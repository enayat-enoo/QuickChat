import { createContext, useState, useRef, useContext } from "react";

const CallContextProvider = createContext(null);
function CallContext({ children }) {
  const peerConnectionRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [iceCandidateQueue, setIceCandidateQueue] = useState([]);
  const [callActive,setCallActive] = useState(false);

  const [callState, setCallState] = useState({
    status: "idle",
    callType: null, 
    peerUserId: null,
    isCaller: false,
    callerDetails: null,
    sdp: null,
  });
  return (
    <CallContextProvider.Provider
      value={{
        callState,
        setCallState,
        peerConnectionRef,
        localStream,
        setLocalStream,
        remoteStream,
        setRemoteStream,
        iceCandidateQueue,
        setIceCandidateQueue,
        callActive,
        setCallActive
      }}
    >
      {children}
    </CallContextProvider.Provider>
  );
}

export const useCall = () => useContext(CallContextProvider);
export default CallContext;
