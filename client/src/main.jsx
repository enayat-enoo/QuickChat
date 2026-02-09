import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store from "./store.js";
import { persistor } from "./store.js";
import { PersistGate } from "redux-persist/integration/react";
import CallContext from "./context/CallContext.jsx";
import AppLayout from "./AppLayout.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <CallContext>
        <Provider store={store}>
          <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
            <AppLayout />
          </PersistGate>
        </Provider>
        </CallContext>
      </SocketProvider>
    </AuthProvider>
    <ToastContainer position="top-center" theme="dark" />
  </StrictMode>
);
