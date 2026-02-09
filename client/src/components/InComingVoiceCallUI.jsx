import { Phone, PhoneOff } from "lucide-react";
import { useCall } from "../context/CallContext";
import { useSocket } from "../context/SocketContext";

export default function IncomingVoiceCallUI() {
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

    socket.emit("CALL_ACCEPTED",{
      toUserId : callState.peerUserId,
      sdp : answer
    })

    setCallState((prev) => ({
      ...prev,
      status: "in-call",
    }))

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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#141416] to-[#0b0b0c] flex items-center justify-center">
      <div className="flex flex-col items-center justify-between h-full py-20">
        {/* Avatar with Glow */}
        <div className="flex flex-col items-center text-center mt-16">
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 rounded-full blur-lg bg-purple-600/20 animate-pulse"></div>
            <div className="w-40 h-40 rounded-full bg-[#25232a] flex items-center justify-center text-white text-5xl font-bold shadow-xl border border-gray-600/40">
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
          <p className="text-gray-400 text-lg mt-1">Incoming voice call…</p>
        </div>

        <div className="flex items-center justify-center gap-24 mb-24">
          <button
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 transition shadow-xl flex items-center justify-center text-white"
            onClick={callDrop}
          >
            <PhoneOff size={34} />
          </button>

          <button className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:scale-90 transition shadow-xl flex items-center justify-center text-white"
          onClick={startCall}>
            <Phone size={34} />
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-4 animate-pulse">
          Swipe up to answer
        </p>
      </div>
    </div>
  );
}
