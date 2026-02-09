import { PhoneOff, Video } from "lucide-react";
import { useCall } from "../context/CallContext";
import { useSocket } from "../context/SocketContext";

export default function IncomingVideoCallUI() {
  const { socket } = useSocket();
  const {
    setCallState,
    callState,
    setLocalStream,
    peerConnectionRef,
    setRemoteStream,
    setCallActive
  } = useCall();
  const { name, avatar } = callState.callerDetails;

  async function startCall() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.log("Media Error", error);
      return;
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });
    const pc = peerConnectionRef.current;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ICE_CANDIDATE", {
          toUserId: callState.peerUserId,
          candidate: event.candidate,
        });
      }
    };
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    const offer = callState.sdp;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("CALL_ACCEPTED", {
      toUserId: callState.peerUserId,
      sdp: answer,
    });

    setCallState((prev) => ({
      ...prev,
      status: "in-call",
    }));
    setCallActive(true);
  }

  function callDrop() {
    setCallState({
      status: "idle",
      callType: null,
      peerUserId: null,
      isCaller: false,
    });
    socket.emit("CALL_DROP", { toUserId: callState.peerUserId });
  }
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black">
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/portrait')] bg-cover bg-center opacity-30 blur-lg"></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[500px] mx-auto flex flex-col items-center justify-between py-14">
        {/* Caller Info */}
        <div className="flex flex-col items-center mt-12 px-4 text-center">
          {/* Profile Pic Glow */}
          <div className="relative">
            <div
              className="
              absolute inset-0 w-44 h-44 rounded-full blur-xl 
              bg-purple-700/30 animate-pulse
            "
            ></div>

            <div
              className="
              w-44 h-44 rounded-full 
              bg-gradient-to-br from-[#3c2a55] to-[#151920]
              flex items-center justify-center
              text-white text-5xl font-bold
              shadow-xl border border-white/20
            "
            >
              {avatar ? (
                <img
                  src={avatar}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <h2 className="text-white text-3xl font-semibold mt-6">{name}</h2>
          <p className="text-gray-300 text-lg mt-1 tracking-wide">
            Incoming video call…
          </p>
        </div>

        {/* Accept / Reject Buttons */}
        <div className="flex items-center justify-center gap-20 mb-24">
          {/* Decline */}
          <button
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 
            flex items-center justify-center text-white shadow-2xl transition-all"
            onClick={callDrop}
          >
            <PhoneOff size={34} />
          </button>

          {/* Accept */}
          <button
            className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:scale-90 
            flex items-center justify-center text-white shadow-2xl transition-all"
            onClick={startCall}
          >
            <Video size={34} />
          </button>
        </div>

        {/* Swipe Hint */}
        <p className="text-gray-400 text-sm mb-4 animate-pulse">
          Swipe up to answer
        </p>
      </div>
    </div>
  );
}
