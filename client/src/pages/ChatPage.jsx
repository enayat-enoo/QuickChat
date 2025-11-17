import { useState, useContext, useEffect } from "react";
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
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { updateChatList } from "../store/chatSlice";
import { useDispatch } from "react-redux";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const chatList = useSelector((state) => state.chat?.chatList ?? []);
  const activeChat = useSelector((state) => state.chat.activeChat);
  const navigate = useNavigate();
  const receiverId = activeChat.participants[1]._id;
  const chatId = useParams().id;
  const dispatch = useDispatch();

  const otherParticipant = activeChat.participants[1].username === user.username ? activeChat.participants[0] : activeChat.participants[1];
  let statusText = otherParticipant.isOnline ? "Online" : `Last seen at ${new Date(otherParticipant.lastSeen).toLocaleString()}`;

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
    }
    //Cleanup function to remove previous messages when switching chats
    return () => {
      setMessages([]);
    };
  }, [activeChat, dispatch]);

  useEffect(() => {
    socket.on("getMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, [socket]);

  function messageSender() {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      chatId: chatId,
      receiverId: receiverId,
      content: message,
    });
    setMessages((prev) => [
      ...prev,
      {
        sender: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
        },
        receiver: receiverId,
        content: message,
        createdAt: new Date().toISOString(),
      },
    ]);
    dispatch(updateChatList({ chatId, content: message }));
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

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center font-sans">
      <div className="w-full h-screen bg-[#1a1f29] flex rounded-none md:rounded-2xl overflow-hidden shadow-xl">
        {/* Sidebar */}
        <div className="hidden md:flex w-[28%] bg-[#3c2a55] flex-col justify-between p-4">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="https://via.placeholder.com/80x80/1e1e1e/ffffff?text=U"
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
            <div className="flex-1 flex flex-col bg-[#161b22]">
              {/* Top bar */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <img
                    src="https://via.placeholder.com/45x45/1e1e1e/ffffff?text=A"
                    className="w-10 h-10 rounded-full border border-gray-500"
                  />
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {otherParticipant.name}
                    </h3>
                    <p className="text-xs text-green-400">
                      {statusText}
                    </p>
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
            </div>

            {/* Messages */}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender.username === user.username;
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
            </div>
            {/* Input */}
            <form
              className="flex items-center gap-2 p-4 border-t border-gray-700 bg-[#151920]"
              onSubmit={(e) => e.preventDefault()}
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
                className="bg-white text-black px-3 py-2 rounded-lg font-bold hover:bg-gray-300"
              >
                <Send
                  size={18}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onClick={messageSender}
                />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
