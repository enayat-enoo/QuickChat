import { useEffect } from "react";
import { useCall } from "../context/CallContext";

export const useCallListeners = (socket) => {
  const {
    peerConnectionRef,
    callState,
    iceCandidateQueue,
    setIceCandidateQueue,
    setCallState,
    setCallActive
  } = useCall();
  useEffect(() => {
    if (!socket) return;
    const handleIncomingCall = async ({
      fromUserId,
      callType,
      name,
      avatar,
      sdp,
    }) => {
      setCallState((prev) => {
        if (prev?.status === "active" || prev?.status === "incoming")
          return prev;
        return {
          status: "incoming",
          callType,
          peerUserId: fromUserId,
          isCaller: false,
          callerDetails: {
            name: name || "Unknown User",
            avatar: avatar || null,
          },
          sdp: sdp,
        };
      });
    };

    const handleIncomingCallIceCandidate = async ({
      fromUserId,
      candidate,
    }) => {
      if (callState.peerUserId && fromUserId !== callState.peerUserId) return;
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.log(error);
          return;
        }
      } else {
        console.log("Buffering ICE candidate for later...");
        setIceCandidateQueue((prev) => [...prev, candidate]);
      }
    };

    const onCallAccepted = async (answerSdp) => {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.log("No peer connection found");
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        if (iceCandidateQueue.length > 0) {
          iceCandidateQueue.forEach(async (candidate) => {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              console.warn(error);
            }
          });
          setIceCandidateQueue([]);
        }
        setCallState((prev) => ({
          ...prev,
          status: "in-call",
        }));
        setCallActive(true);
      } catch (error) {
        console.log("Error While setting remote description", error);
      }
    };
    const handleCallAccepted = async ({ fromUserId, sdp }) => {
      // console.log("Call Accepted from", fromUserId);
      if (onCallAccepted) {
        await onCallAccepted(sdp);
      }
    };

    const handleCallDrop = ({ fromUserId }) => {
      // console.log("Call dropped from", fromUserId);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      setCallActive(false);
      setCallState({
        status: "idle",
        callType: null,
        peerUserId: null,
        isCaller: false,
        callerDetails: null,
        sdp: null,
      });
      setIceCandidateQueue([]);
    };
    socket.on("CALL_INCOMING", handleIncomingCall);
    socket.on("ICE_CANDIDATE", handleIncomingCallIceCandidate);
    socket.on("CALL_ACCEPTED", handleCallAccepted);
    socket.on("CALL_DROP", handleCallDrop);
    return () => {
      socket.off("CALL_INCOMING", handleIncomingCall);
      socket.off("ICE_CANDIDATE", handleIncomingCallIceCandidate);
      socket.off("CALL_ACCEPTED", handleCallAccepted);
      socket.off("CALL_DROP", handleCallDrop);
    };
  }, [
    socket,
    setCallState,
    peerConnectionRef,
    callState,
    setIceCandidateQueue,
    iceCandidateQueue
  ]);
};
