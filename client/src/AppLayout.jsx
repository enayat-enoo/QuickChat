import App from "./App";
import { useCall } from "./context/CallContext";
import OutgoingVideoCallUI from "./components/OutgoingVideoCallUI";
import IncomingVideoCallUI from "./components/IncomingVideoCallUI";
import InCallVideoUI from "./components/InCallVideoUI";
import InCallVoiceUI from "./components/InCallVoiceUI";
import IncomingVoiceCallUI from "./components/InComingVoiceCallUI";
import OutgoingVoiceCallUI from "./components/OutgoingVoiceCallUI";
import { useSelector } from "react-redux";
import { useAuth } from "./context/AuthContext";
import { useCallListeners } from "./hooks/useCallListeners";
import { useSocket } from "./context/SocketContext";
export default function AppLayout() {
  const { callState } = useCall();
  const { user } = useAuth();
  const { socket } = useSocket();
  const activeChat = useSelector((state) => state.chat.activeChat);

  const otherParticipant = activeChat?.participants?.find(
    (p) => p.username !== user?.username
  );

  useCallListeners(socket);

  return (
    <>
      <App />
      {callState.status === "outgoing" && callState.callType === "video" && (
        <OutgoingVideoCallUI otherParticipant={otherParticipant} />
      )}
      {callState.status === "outgoing" && callState.callType === "voice" && (
        <OutgoingVoiceCallUI otherParticipant={otherParticipant} />
      )}
      {callState.status === "incoming" && callState.callType === "video" && (
        <IncomingVideoCallUI />
      )}
      {callState.status === "incoming" && callState.callType === "voice" && (
        <IncomingVoiceCallUI />
      )}
      {callState.status === "in-call" && callState.callType === "video" && (
        <InCallVideoUI />
      )}
      {callState.status === "in-call" && callState.callType === "voice" && (
        <InCallVoiceUI />
      )}
    </>
  );
}
