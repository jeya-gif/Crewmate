import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || message.trim() === "") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const groqKey = Deno.env.get("GROQ_API_KEY");

    console.log("ENV CHECK:", {
      supabaseUrlExists: !!supabaseUrl,
      supabaseAnonKeyExists: !!supabaseAnonKey,
      groqKeyExists: !!groqKey,
    });

    if (!supabaseUrl || !supabaseAnonKey || !groqKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization") || "";

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // ✅ Get logged in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("AUTH ERROR:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // ✅ Auto delete messages older than 1 day
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from("ai_messages")
      .delete()
      .eq("user_id", userId)
      .lt("created_at", yesterday);

    // ✅ Save user message
    await supabase.from("ai_messages").insert([
      {
        user_id: userId,
        role: "user",
        message: message,
      },
    ]);

    // ---------------- FETCH CONTEXT ----------------

    // Followers count
    const { count: followerCount } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId);

    // User posts
    const { data: userPosts } = await supabase
      .from("posts")
      .select("id, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Last 5 posts
    const last5Posts = userPosts?.slice(0, 5) || [];
    const last5Text =
      last5Posts.length > 0
        ? last5Posts.map((p, i) => `${i + 1}) ${p.content}`).join("\n")
        : "None";

    // Total likes received + top post
    let totalLikes = 0;
    let topPostText = "No posts yet.";
    let topPostLikes = -1;

    if (userPosts && userPosts.length > 0) {
      for (const post of userPosts) {
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        const likes = likeCount || 0;
        totalLikes += likes;

        if (likes > topPostLikes) {
          topPostLikes = likes;
          topPostText = `"${post.content}" (${likes} likes)`;
        }
      }
    }

    // Notifications today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayNotifs } = await supabase
      .from("notifications")
      .select("message, created_at")
      .eq("user_id", userId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    const notifText =
      todayNotifs && todayNotifs.length > 0
        ? todayNotifs.map((n, i) => `${i + 1}) ${n.message}`).join("\n")
        : "No notifications today.";

    // ---------------- PROMPT BUILD ----------------

    const systemPrompt = `
You are CrewMate AI assistant.

Use the following real user data to answer questions.
Never invent fake numbers or fake notifications.

User Stats:
- Followers count: ${followerCount || 0}
- Total likes received: ${totalLikes}
- Last 5 posts:
${last5Text}
- Top post:
${topPostText}
- Notifications today:
${notifText}

Rules:
- Keep response short and clear.
- If user asks about posts, use last 5 posts.
- If user asks about followers or likes, use stats above.
- If user asks something unrelated, answer normally.
`;

    // ---------------- GROQ API CALL ----------------

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
          "User-Agent": "CrewMate-AI",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
        }),
      }
    );

    console.log("Groq status:", groqRes.status);

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.log("Groq ERROR response:", errorText);

      return new Response(
        JSON.stringify({
          error: "Groq API failed",
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const groqData = await groqRes.json();
    console.log("Groq SUCCESS response:", groqData);

    const aiReply =
      groqData?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate an answer.";

    // ✅ Save AI reply
    await supabase.from("ai_messages").insert([
      {
        user_id: userId,
        role: "assistant",
        message: aiReply,
      },
    ]);

    return new Response(JSON.stringify({ reply: aiReply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("SERVER ERROR:", err);

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});