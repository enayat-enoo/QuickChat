import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Send, Smile, Paperclip, Mic, Phone, Video } from "lucide-react";
import Bottom from "../components/Bottom";
import Sidebar from "../components/Sidebar";
import ChatLoader from "../components/ChatLoader";
import { useAuth } from "../context/AuthContext";
import { setActiveChat, updateChatList } from "../store/chatSlice";
import { useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
import { useCall } from "../context/CallContext";
import { getAvatar } from "../utils/avatarHelper";
import {
  formatMessageTime,
  formatDateLabel,
  isDifferentDay,
} from "../utils/timeHelper";

const API = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const { user, setUser } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { setCallState, setLocalStream, setRemoteStream, peerConnectionRef } =
    useCall();

  const messageEndRef = useRef(null);
  // Track the last message id so we only auto-scroll when a NEW message
  // arrives (send/receive), not when older messages are prepended.
  const prevLastRef = useRef(null);

  const chatList = useSelector((state) => state.chat?.chatList ?? []);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const navigate = useNavigate();
  const chatId = useParams().id;
  const dispatch = useDispatch();

  // Single source of truth for "the other person" in this 1:1 chat.
  const otherParticipant = activeChat?.participants?.find(
    (p) =>
      p._id !== user._id && p._id !== user.id && p.username !== user.username,
  );

  // If page was refreshed, activeChat is gone from Redux
  // Restore it from the chatList using the URL param
  useEffect(() => {
    if (!activeChat && chatId && chatList.length > 0) {
      const match = chatList.find((c) => c._id === chatId);
      if (match) {
        dispatch(setActiveChat(match));
      } else {
        navigate("/");
      }
    }
  }, [chatId, activeChat, chatList, dispatch, navigate]);

  let statusText = "";
  if (otherParticipant) {
    statusText = otherParticipant.isOnline
      ? "Online"
      : `Last seen at ${new Date(otherParticipant.lastSeen).toLocaleString()}`;
    if (statusText.includes("Invalid Date")) {
      statusText = "";
    }
  }

  async function startVideoCall() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
    } catch (error) {
      console.log(error);
      return;
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const pc = peerConnectionRef.current;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ICE_CANDIDATE", {
          toUserId: otherParticipant._id,
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

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (!socket || !otherParticipant) return;
      socket.emit("CALL_INITIATE", {
        toUserId: otherParticipant._id,
        callType: "video",
        name: user.name,
        avatar: user.avatar,
        sdp: offer,
      });
      setCallState({
        status: "outgoing",
        callType: "video",
        peerUserId: otherParticipant._id,
        isCaller: true,
        callerDetails: {
          name: otherParticipant.name,
          avatar: otherParticipant.avatar || null,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function startVoiceCall() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
    } catch (error) {
      console.log(error);
      return;
    }

    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const pc = peerConnectionRef.current;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ICE_CANDIDATE", {
          toUserId: otherParticipant._id,
          candidate: event.candidate,
        });
      }
    };

    // FIX: voice calls previously never wired remote audio into the UI.
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    stream.getAudioTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (!socket || !otherParticipant) return;
      socket.emit("CALL_INITIATE", {
        toUserId: otherParticipant._id,
        callType: "voice",
        name: user.name,
        avatar: user.avatar,
        sdp: offer,
      });
      setCallState({
        status: "outgoing",
        callType: "voice",
        peerUserId: otherParticipant._id,
        isCaller: true,
        callerDetails: {
          name: otherParticipant.name,
          avatar: otherParticipant.avatar || null,
        },
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }

  // Initial fetch for the active chat.
  // - markRead fires only AFTER a successful fetch (so a failed fetch
  //   doesn't silently clear the badge).
  // - socket is in deps so markRead is retried if the socket connects late.
  // - 403 → we lost access, go home.
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setHasMore(false);
    setCursor(null);

    axios
      .get(`${API}/api/message/getmessage?chatId=${activeChat._id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setMessages(res.data.data);
        setHasMore(res.data.hasMore);
        setCursor(res.data.nextCursor);
        setLoading(false);
        socket?.emit("markRead", { chatId: activeChat._id });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        if (err.response?.status === 403) {
          navigate("/");
        }
      });

    return () => {
      setMessages([]);
      prevLastRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?._id, socket]);

  // Auto-scroll only when the LAST message changes — not when older
  // messages are prepended by loadOlderMessages.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;
    if (prevLastRef.current !== last._id) {
      prevLastRef.current = last._id;
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load one page of older messages and prepend to the top.
  // Moved out of messageSender — it was previously declared inside it
  // and was out of scope at the JSX call site (ReferenceError past 50 msgs).
  async function loadOlderMessages() {
    if (!cursor || loadingMore || !activeChat) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(
        `${API}/api/message/getmessage?chatId=${activeChat._id}&cursor=${cursor}`,
        { withCredentials: true },
      );
      setMessages((prev) => [...res.data.data, ...prev]);
      setHasMore(res.data.hasMore);
      setCursor(res.data.nextCursor);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) navigate("/");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!socket) return;

    // Message from the other person
    const handleIncoming = (incoming) => {
      if (activeChat && incoming.chatId === activeChat._id) {
        setMessages((prev) => [...prev, incoming]);
      }
    };

    // Confirmation from server — replace our optimistic message.
    // Matches on clientId (echoed by the server) so two rapid sends
    // can't swap/duplicate each other.
    const handleSent = (incoming) => {
      if (incoming._timing) {
        const rtt = Date.now() - (incoming._timing.clientSentAt || Date.now());
        console.debug("[thesis]", {
          rttMs: rtt,
          dbWriteMs: incoming._timing.dbWriteMs,
          redisEmitMs: incoming._timing.redisEmitMs,
          totalServerMs: incoming._timing.totalServerMs,
          crossNode: incoming._timing.crossNode,
          nodeId: incoming._timing.nodeId,
        });
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.clientId && m.clientId === incoming.clientId ? incoming : m,
        ),
      );
    };

    // Remove only the failed optimistic message (matched by clientId).
    const handleError = ({ clientId, message: errMsg }) => {
      setMessages((prev) =>
        prev.filter((m) => !(m.clientId && m.clientId === clientId)),
      );
      console.error("Message send failed:", errMsg);
    };

    socket.on("getMessage", handleIncoming);
    socket.on("messageSent", handleSent);
    socket.on("messageError", handleError);

    return () => {
      socket.off("getMessage", handleIncoming);
      socket.off("messageSent", handleSent);
      socket.off("messageError", handleError);
    };
  }, [socket, activeChat]);

  function messageSender() {
    if (!message.trim()) return;

    const receiver = activeChat?.participants?.find(
      (p) =>
        p._id !== user._id && p._id !== user.id && p.username !== user.username,
    );
    const receiverIdSafe = receiver ? receiver._id : null;
    const currentChatId = chatId || activeChat?._id;

    if (!receiverIdSafe || !currentChatId) {
      console.warn("Can't send message — missing chat or receiver id");
      return;
    }

    // Unique client id — echoed back by the server so we can match the
    // confirmation to exactly this optimistic message (not "the first one").
    const clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    socket.emit("sendMessage", {
      chatId: currentChatId,
      receiverId: receiverIdSafe,
      content: message,
      clientSentAt: Date.now(),
      clientId,
    });

    // Optimistic UI
    const optimisticMsg = {
      _id: `optimistic-${clientId}`, // string id, never collides with ObjectId
      clientId,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      receiver: receiverIdSafe,
      content: message,
      createdAt: new Date().toISOString(),
      chatId: currentChatId,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    dispatch(updateChatList({ chatId: currentChatId, content: message }));
    setMessage("");
  }

  function logoutHandler() {
    axios
      .get(`${API}/api/logout`, { withCredentials: true })
      .then(() => {
        localStorage.clear();
        setUser(null);
        navigate("/login");
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Early return if no chat selected.
  // Navigation is handled by the effect above — calling navigate() during
  // render is a React anti-pattern.
  if (!activeChat) return null;

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-sans px-2 md:px-0">
      <div className="w-full md:w-[1100px] h-screen md:h-[600px] bg-[#1a1f29] flex rounded-none md:rounded-2xl overflow-hidden shadow-xl">
        {/* Sidebar */}
        <div className="hidden md:flex w-[28%] bg-[#3c2a55] flex-col justify-between p-4">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={getAvatar(user.avatar, user.name)}
                className="w-12 h-12 rounded-full border border-gray-400 object-cover"
              />
              <div>
                <h2 className="text-white font-semibold">{user.name}</h2>
                <p className="text-xs text-gray-300">@{user.username}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-200 text-sm font-semibold">Chats</p>
            </div>

            <Sidebar contacts={chatList} />
          </div>

          <Bottom props={{ logoutHandler }} />
        </div>

        {/* Chat section */}
        {loading ? (
          <ChatLoader />
        ) : (
          <div className="flex-1 flex flex-col bg-[#161b22]">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                {/* Back button — mobile only */}
                <button
                  className="md:hidden text-gray-400 hover:text-white mr-1"
                  onClick={() => navigate("/")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>

                {otherParticipant && (
                  <>
                    <img
                      src={getAvatar(
                        otherParticipant.avatar,
                        otherParticipant.name,
                      )}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-500 object-cover"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-sm md:text-base">
                        {otherParticipant.name}
                      </h3>
                      <p
                        className={`text-xs ${
                          otherParticipant.isOnline
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        {statusText}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 md:gap-5 text-gray-300">
                <button className="hover:text-white" onClick={startVoiceCall}>
                  <Phone size={18} />
                </button>
                <button className="hover:text-white" onClick={startVideoCall}>
                  <Video size={22} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {hasMore && (
                <div className="flex justify-center pb-2">
                  <button
                    onClick={loadOlderMessages}
                    disabled={loadingMore}
                    className="text-xs text-gray-400 hover:text-white bg-[#20262e] px-4 py-1.5 rounded-full transition disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load older messages"}
                  </button>
                </div>
              )}
              {messages.map((msg, index) => {
                const isMine =
                  msg.sender._id === user._id ||
                  msg.sender.username === user.username;

                const showDateSeparator =
                  index === 0 ||
                  isDifferentDay(messages[index - 1].createdAt, msg.createdAt);

                return (
                  <div key={msg._id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="text-xs text-gray-500 bg-[#20262e] px-3 py-1 rounded-full">
                          {formatDateLabel(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`px-3 md:px-4 py-2 rounded-xl max-w-[80%] md:max-w-[70%] text-sm ${
                          isMine
                            ? "bg-[#3c2a55] text-white"
                            : "bg-[#20262e] text-gray-200"
                        }`}
                      >
                        <p>{msg.content}</p>

                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMine ? "text-purple-300" : "text-gray-500"
                          }`}
                        >
                          {msg.createdAt
                            ? formatMessageTime(msg.createdAt)
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 p-3 md:p-4 border-t border-gray-700 bg-[#151920]"
              onSubmit={(e) => {
                e.preventDefault();
                messageSender();
              }}
            >
              <button type="button" className="text-gray-400 hover:text-white">
                <Paperclip size={20} />
              </button>
              <button type="button" className="text-gray-400 hover:text-white">
                <Smile size={20} />
              </button>

              <input
                className="flex-1 bg-[#20262e] text-gray-200 px-3 md:px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-purple-600 text-sm"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <button type="button" className="text-gray-400 hover:text-white">
                <Mic size={20} />
              </button>
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-white text-black px-3 py-2 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}