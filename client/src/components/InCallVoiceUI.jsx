import { useEffect, useRef, useState } from "react";
import { useCall } from "../context/CallContext";
import { useSocket } from "../context/SocketContext";

export default function InCallVoiceUI() {
  const { socket } = useSocket();
  const {
    localStream,
    callState,
    setCallState,
    remoteStream,
    callActive,
    setCallActive,
  } = useCall();
  const [seconds, setSeconds] = useState(0);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const { name } = callState.callerDetails;

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [callActive]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [audioRef, remoteStream]);

  function resetCall() {
    localStream?.getTracks().forEach((t) => t.stop());
    setCallActive(false);
    setCallState({
      status: "idle",
      callType: null,
      peerUserId: null,
      isCaller: false,
      callerDetails: null,
      sdp: null,
    });
    socket.emit("CALL_DROP", { toUserId: callState.peerUserId });
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0d] flex flex-col items-center justify-between py-20">
      <div className="flex flex-col items-center mt-12">
        <div className="relative">
          <div className="absolute inset-0 w-40 h-40 rounded-full blur-xl bg-green-600/20 animate-ping"></div>
          <div className="w-40 h-40 rounded-full bg-[#1c1b22] text-white text-5xl font-semibold flex items-center justify-center border border-gray-600">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>

        <p className="text-white text-3xl font-semibold mt-6">{name}</p>
        <p className="text-gray-400 text-lg mt-1">
          {callActive ? formatTime(seconds) : "connecting..."}
        </p>
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
      </div>

      <div className="flex items-center justify-center gap-20 mb-24">
        <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">
          🔇
        </button>
        <button
          className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-xl"
          onClick={resetCall}
        >
          📞
        </button>
        <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">
          🔈
        </button>
      </div>
    </div>
  );
}
