import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "./AppLayout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

let router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/chat/:id", element: <ChatPage /> },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
