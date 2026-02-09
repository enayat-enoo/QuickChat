import { useEffect } from "react";

export const useWebRTC = (socket) => {
  useEffect(() => {
    if (!socket) return;
  }, [socket]);
};
