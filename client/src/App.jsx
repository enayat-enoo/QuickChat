import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import ProtectedRoute from "./ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

let router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute children={<HomePage />} />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/chat/:id",
    element: <ProtectedRoute children={<ChatPage />} />,
  },
]);
function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
