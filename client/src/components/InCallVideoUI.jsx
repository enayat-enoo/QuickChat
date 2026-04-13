import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageCircle,
  MoreVertical,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useCall } from "../context/CallContext";
import { useSocket } from "../context/SocketContext";
import { useState, useRef, useEffect } from "react";
export default function InCallVideoUI() {
  const [mini, setMini] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const { socket } = useSocket();
  const {
    callState,
    setCallState,
    localStream,
    remoteStream,
    callActive,
    setCallActive,
  } = useCall();
  const [seconds, setSeconds] = useState(0);
  const { name } = callState.callerDetails;

  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [remoteVideoRef, localVideoRef, localStream, remoteStream]);

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

  function toggleMicMute() {
    localStream.getAudioTracks()[0].enabled =
      !localStream.getAudioTracks()[0].enabled;
    setMuted(!muted);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Main container */}
      <div className="relative w-full h-full md:w-[1100px] md:h-[700px] bg-[#0b0e12] rounded-none md:rounded-2xl overflow-hidden shadow-2xl">
        {/* Remote video placeholder */}
        <div className="absolute inset-0 bg-[#0f1317] flex items-center justify-center">
          <div className="text-white/60 text-3xl font-semibold">
            <video ref={remoteVideoRef} autoPlay playsInline />
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-gray-700">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <div className="leading-none">
              <p className="text-white text-sm font-semibold">{name}</p>
              <p className="text-gray-300 text-xs">
                {callActive ? formatTime(seconds) : "connecting..."}
              </p>
            </div>
          </div>

          <button className="bg-black/40 p-2 rounded-md text-gray-300 border border-gray-700 hover:text-white">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Local preview picture-in-picture */}
        <div
          className={`absolute right-4 bottom-28 md:bottom-16 
          ${mini ? "w-36 h-24" : "w-48 h-32"} 
          bg-black/50 rounded-xl shadow-2xl border border-gray-700 overflow-hidden`}
        >
          <div className="w-full h-full bg-[#1a1d21] text-gray-300 flex items-center justify-center">
            <video ref={localVideoRef} autoPlay playsInline />
          </div>
          <button
            onClick={() => setMini(!mini)}
            className="absolute top-1 left-1 bg-black/40 rounded-full p-1 text-gray-200 hover:text-white"
          >
            {mini ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>

        {/* Bottom control bar */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur-md border border-gray-700 px-4 py-3 rounded-full flex items-center gap-4">
            <button
              onClick={toggleMicMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition 
              ${muted ? "bg-gray-600 text-white" : "bg-white text-black"}`}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              onClick={() => setCameraOff(!cameraOff)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition 
              ${cameraOff ? "bg-gray-600 text-white" : "bg-white text-black"}`}
            >
              {cameraOff ? <VideoOff size={18} /> : <Video size={18} />}
            </button>

            {/* <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center"> */}
            {/* <ArrowRepeat size={18}/> */}
            {/* </button> */}

            {/* <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center">
              <MessageCircle size={18} />
            </button> */}

            <button
              className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl"
              onClick={resetCall}
            >
              <Phone size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
