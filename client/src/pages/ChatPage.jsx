import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  UserPlus,
  Send,
  Smile,
  Paperclip,
  Mic,
  Phone,
  Video,
} from "lucide-react";
import Bottom from "../components/Bottom";
import Sidebar from "../components/Sidebar";
import ChatLoader from "../components/ChatLoader";
import { useAuth } from "../context/AuthContext";
import { updateChatList } from "../store/chatSlice";
import { useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
export default function ChatPage() {
  const [message, setMessage] = useState("");
  const { user } = useAuth();
  const { socket } = useSocket();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  const messageEndRef = useRef(null);

  const chatList = useSelector((state) => state.chat?.chatList ?? []);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const navigate = useNavigate();
  const chatId = useParams().id;
  const dispatch = useDispatch();

  const otherParticipant = activeChat?.participants?.find(
    (p) => p.username !== user.username
  );

  let statusText = otherParticipant.isOnline
    ? "Online"
    : `Last seen at ${new Date(otherParticipant.lastSeen).toLocaleString()}`;
    if(statusText.includes("Invalid Date")){
      statusText = "";
    }

  useEffect(() => {
    if (activeChat) {
      axios
        .get(
          `http://localhost:8001/api/message/getmessage?chatId=${activeChat._id}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setLoading(false);
          setMessages(res.data.data);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setMessages([]);
    }
    //Cleanup function to remove previous messages when switching chats
    return () => {
      setMessages([]);
    };
  }, [activeChat?._id]);

  useEffect(() => {
    if (!socket) return;
    const handleIncoming = (message) => {
      if (activeChat && message.chatId === activeChat._id) {
        //only add message if it belongs to the active chat
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    socket.on("getMessage", handleIncoming);
    return () => {
      socket.off("getMessage", handleIncoming);
    };
  }, [socket, activeChat]);

  function messageSender() {
    if (!message.trim()) return;

    // guard activeChat / receiverId
    const receiver = activeChat?.participants?.find(
      (p) => p.username !== user.username
    );
    const receiverIdSafe = receiver ? receiver._id : null;
    const currentChatId = chatId || activeChat?._id;

    if (!receiverIdSafe || !currentChatId) {
      console.warn("Can't send message — missing chat or receiver id");
      return;
    }

    socket.emit("sendMessage", {
      chatId: currentChatId,
      receiverId: receiverIdSafe,
      content: message,
    });

    // Optimistic UI
    const optimisticMsg = {
      _id: Date.now().toString(), // Temp ID to prevent key errors
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
      .get("http://localhost:8001/api/logout", { withCredentials: true })
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Early return if no chat selected (prevents "cannot read properties of undefined")
  if (!activeChat) {
    return (
      <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center">
        {/* You can keep Sidebar here if you want it visible on empty state */}
        <div className="text-white">Select a chat to start messaging</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-sans">
      <div className="w-full h-screen bg-[#1a1f29] flex rounded-none md:rounded-2xl overflow-hidden shadow-xl">
        {/* Sidebar */}
        <div className="hidden md:flex w-[28%] bg-[#3c2a55] flex-col justify-between p-4">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src={user.avatar}
                className="w-12 h-12 rounded-full border border-gray-400"
              />
              <div>
                <h2 className="text-white font-semibold">{user.name}</h2>
                <p className="text-xs text-gray-300">@{user.username}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-200 text-sm font-semibold">Chats</p>
              <button className="text-xs px-2 py-1 bg-white text-black rounded flex items-center gap-1 hover:bg-gray-200">
                <UserPlus size={14} /> Add
              </button>
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
            {/* Top bar – no flex-1 here */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src={otherParticipant.avatar}
                  className="w-10 h-10 rounded-full border border-gray-500"
                />
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {otherParticipant.name}
                  </h3>
                  <p className="text-xs text-green-400">{statusText}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 text-gray-300">
                <button className="hover:text-white">
                  <Phone size={20} />
                </button>
                <button className="hover:text-white">
                  <Video size={25} />
                </button>
              </div>
            </div>

            {/* Messages – this gets all remaining height */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine =
                  msg.sender._id === user._id ||
                  msg.sender.username === user.username;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-[70%] text-sm ${
                        isMine
                          ? "bg-[#3c2a55] text-white"
                          : "bg-[#20262e] text-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 p-4 border-t border-gray-700 bg-[#151920]"
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
                className="flex-1 bg-[#20262e] text-gray-200 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-purple-600"
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
                className="bg-white text-black px-3 py-2 rounded-lg font-bold hover:bg-gray-300"
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
