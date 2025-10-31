import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

let router = createBrowserRouter([
  {
    path : '/',
    element : <HomePage/>
  },
  {
    path : '/register',
    element : <Register/>
  },
  {
    path : '/login',
    element : <Login/>
  }
])
function App() {
  return <div>
   <RouterProvider router={router}/>
  </div>;
}

export default App;
