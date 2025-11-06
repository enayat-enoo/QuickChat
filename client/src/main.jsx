import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import  { Provider } from "react-redux";
import store from "./store.js";
import "./index.css";
import App from "./App.jsx";

console.log(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
      <App />
      </Provider>
    </AuthProvider>
  </StrictMode>
);
