import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchChatList } from "./store/chatSlice";
import { useAuth } from "./context/AuthContext";
import { useGlobalSocketEvents } from "./hooks/useGlobalSocketEvents";
import InComingVoiceCallUI from "./components/InComingVoiceCallUI";
import IncomingVideoCallUI from "./components/IncomingVideoCallUI";
import OutgoingVoiceCallUI from "./components/OutgoingVoiceCallUI";
import OutgoingVideoCallUI from "./components/OutgoingVideoCallUI";
import InCallVoiceUI from "./components/InCallVoiceUI";
import InCallVideoUI from "./components/InCallVideoUI";
import { useCall } from "./context/CallContext";

export default function AppLayout() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { callState } = useCall();

  useGlobalSocketEvents();

  // Fetch chat list once when user is available
  useEffect(() => {
    if (user) {
      dispatch(fetchChatList());
    }
  }, [user, dispatch]);

  return (
    <>
      {/* Global call overlays — shown on top of any page */}
      {callState?.status === "incoming" && callState?.callType === "voice" && (
        <InComingVoiceCallUI />
      )}
      {callState?.status === "incoming" && callState?.callType === "video" && (
        <IncomingVideoCallUI />
      )}
      {callState?.status === "outgoing" && callState?.callType === "voice" && (
        <OutgoingVoiceCallUI />
      )}
      {callState?.status === "outgoing" && callState?.callType === "video" && (
        <OutgoingVideoCallUI />
      )}
      {callState?.status === "in-call" && callState?.callType === "voice" && (
        <InCallVoiceUI />
      )}
      {callState?.status === "in-call" && callState?.callType === "video" && (
        <InCallVideoUI />
      )}

      <Outlet />
    </>
  );
}
