import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext(null);
const API = import.meta.env.VITE_API_URL;

export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Only depend on the stable user id — not the object reference,
  // and not a token (auth is the httpOnly cookie, sent automatically
  // because withCredentials is true).
  const userId = user?._id ?? user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setSocket((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      setConnected(false);
      return;
    }

    const newSocket = io(API, {
      withCredentials: true, // sends the httpOnly `token` cookie on handshake
    });

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));
    newSocket.on("connect_error", (err) => {
      console.error("socket connect_error:", err.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off();
      newSocket.disconnect();
      setConnected(false);
    };
  }, [userId]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);