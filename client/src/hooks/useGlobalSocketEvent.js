import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
import {
  updateChatList,
  updateOnlineStatus,
  updateOfflineStatus,
} from "../store/chatSlice";

export function useGlobalSocketEvents() {
  const { socket } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    // New message received — update the chat list preview
    const handleMessage = (message) => {
      dispatch(updateChatList(message));
    };

    // User came online
    const handleOnline = ({ userId }) => {
      dispatch(updateOnlineStatus(userId));
    };

    // User went offline
    const handleOffline = (data) => {
      dispatch(updateOfflineStatus(data));
    };

    socket.on("getMessage", handleMessage);
    socket.on("userOnline", handleOnline);
    socket.on("userOffline", handleOffline);

    // Cleanup — runs when socket changes or component unmounts
    return () => {
      socket.off("getMessage", handleMessage);
      socket.off("userOnline", handleOnline);
      socket.off("userOffline", handleOffline);
    };
  }, [socket, dispatch]);
}