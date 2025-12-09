import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();
const API = import.meta.env.VITE_API_URL;
export function SocketProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;
    const newSocket = io(API, {
      withCredentials: true,
      auth: { token: user?.token },
    });

    newSocket.on("connect", () => {
      newSocket.emit("setup", user._id); 
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};