import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import CreatePost from "../pages/CreatePost";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Profile from "../pages/Profile";
import EditProfile from "../pages/EditProfile";
import Users from "../pages/Users";
import UserProfile from "../pages/UserProfile";
import Notifications from "../pages/Notifications";
import Inbox from "../pages/Inbox";
import Chat from "../pages/Chat";
import AiChat from "../pages/AiChat";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        }
      />

      <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit-profile"
  element={
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  }
/>
<Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>

<Route
  path="/user/:id"
  element={
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  }
/>

<Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/inbox"
  element={
    <ProtectedRoute>
      <Inbox />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-chat"
  element={<AiChat />}
/>
<Route
  path="/chat/:conversationId"
  element={
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  }
/>
    </Routes>
        
  );
};

export default AppRoutes;