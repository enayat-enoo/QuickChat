import { PhoneOff, Video } from "lucide-react";
import { useCall } from "../context/CallContext";
import { useSocket } from "../context/SocketContext";

export default function OutgoingVideoCallUI({ otherParticipant }) {
  const { setCallState } = useCall();
  const { socket } = useSocket();

  if (!otherParticipant) return null;

  function callDrop() {
    setCallState({
      status: "idle",
      callType: null,
      peerUserId: null,
      isCaller: false,
      callerDetails: null,
      sdp: null,
    });
    if (!socket) return;
    socket.emit("CALL_DROP", { toUserId: otherParticipant._id });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center">
      {/* Blurred background (caller side preview) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3c2a55] via-[#1a1f29] to-black opacity-40 blur-lg"></div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Main container */}
      <div className="relative z-10 w-full h-full max-w-[500px] mx-auto flex flex-col items-center justify-between py-16">
        {/* Top status */}
        <div className="flex flex-col items-center mt-10 text-center px-4">
          <div className="text-gray-300 text-sm tracking-wide uppercase">
            Video Calling
          </div>
        </div>

        {/* User avatar + pulse */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 w-44 h-44 rounded-full blur-xl bg-purple-600/30 animate-pulse"></div>

            {/* Avatar */}
            <div
              className="w-44 h-44 rounded-full bg-gradient-to-br from-[#3c2a55] to-[#151920]
              flex items-center justify-center text-white text-5xl font-bold
              shadow-2xl border border-white/20"
            >
              {otherParticipant.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                otherParticipant.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="text-white text-3xl font-semibold mt-6">
            {otherParticipant.name}
          </h2>

          {/* Ringing text */}
          <p className="text-gray-300 text-lg mt-2 animate-pulse">Ringing…</p>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col items-center gap-6 mb-20">
          {/* Cancel Call */}
          <button
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-90
            transition-all flex items-center justify-center text-white shadow-2xl"
            onClick={callDrop}
          >
            <PhoneOff size={34} />
          </button>

          {/* Info */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Video size={16} />
            <span>Calling via QuickChat</span>
          </div>
        </div>
      </div>
    </div>
  );
}
