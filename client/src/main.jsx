import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import  CallProvider  from "./context/CallContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <App />
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                theme="dark"
                toastStyle={{ background: "#1a1f29", color: "#e2e8f0" }}
              />
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);