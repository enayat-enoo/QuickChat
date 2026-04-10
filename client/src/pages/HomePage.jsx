import { MessageSquare, UserSearch } from "lucide-react";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "../store/userSlice";
import { fetchChatList } from "../store/chatSlice";
import Bottom from "../components/Bottom";
import { useSocket } from "../context/SocketContext";
import {
  updateChatList,
  updateOnlineStatus,
  updateOfflineStatus,
} from "../store/chatSlice";
import { setActiveChat } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";
import { getAvatar } from "../utils/avatarHelper";

const API = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const { user, setUser } = useAuth();
  // const { setCallState } = useCall();
  const [userSearch, setUserSearch] = useState("");
  const { socket } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.user);
  const chatList = useSelector((state) => state.chat?.chatList ?? []);

  // fetch chat list on component mount
  useEffect(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  // listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    socket.on("getMessage", (message) => {
      dispatch(updateChatList(message));
    });
    return () => socket.off("newMessage");
  }, [socket, dispatch]);

  // update online status
  useEffect(() => {
    socket?.on("userOnline", ({ userId }) => {
      dispatch(updateOnlineStatus(userId));
    });
  }, [chatList, socket, dispatch]);

  // update offline status
  useEffect(() => {
    socket?.on("userOffline", (data) => {
      dispatch(updateOfflineStatus(data));
    });
  }, [socket, dispatch]);

  // logout handler
  function logoutHandler() {
    axios
      .get(`${API}/api/logout`, { withCredentials: true })
      .then(() => {
        socket?.disconnect();
        // Clear any stale localStorage data from previous versions
        localStorage.clear();
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // Handler to search for a user
  function userSearchHandler() {
    if (!userSearch.trim()) return;
    dispatch(searchUser(userSearch));
    setUserSearch("");
  }

  // Handler to upload avatar
  const fileInputRef = useRef(null);

  function avatarUpload() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    axios
      .post(`${API}/api/user/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      })
      .then((res) => {
        // Update user in context directly — no page reload needed
        setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  return (
    <div className="min-h-screen bg-[#0d1117] font-sans text-white flex md:items-center md:justify-center">
      <div className="w-full h-screen md:w-[1100px] md:h-[600px] bg-[#1a1f29] flex flex-col md:flex-row rounded-none md:rounded-2xl overflow-hidden shadow-none md:shadow-2xl">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        {/* LEFT: Chat list (full screen on mobile) */}
        <div className="w-full md:w-[30%] bg-[#3c2a55] flex flex-col h-full">
          {/* Top + chat list */}
          <div className="p-4 md:p-6 flex flex-col h-full">
            {/* User info */}
            <div className="flex items-center space-x-4 mb-6 md:mb-8">
              <img
                src={getAvatar(user.avatar, user.name)}
                alt="avatar"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-gray-500 object-cover cursor-pointer"
                onClick={avatarUpload}
              />
              <div>
                <h2 className="font-semibold text-base md:text-lg">
                  {user.name}
                </h2>
                <p className="text-xs md:text-sm text-gray-300">
                  {user.username}
                </p>
              </div>
            </div>

            {/* Chats header + search */}
            <div className="flex justify-between items-center gap-2 mb-3">
              <h3 className="text-gray-300 text-xs md:text-sm font-semibold">
                Chats
              </h3>
              <div className="flex items-center gap-2 bg-white rounded-md px-2 py-1 flex-1">
                <UserSearch
                  size={14}
                  className="text-black cursor-pointer"
                  onClick={userSearchHandler}
                />
                <input
                  type="text"
                  className="bg-transparent outline-none text-black text-xs md:text-sm flex-1"
                  placeholder="search user"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Chats list – takes remaining height, scrollable */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 md:pr-2">
              {searchResults.length > 0 ? (
                searchResults.map((search) => (
                  <div
                    key={search.data.id}
                    className="p-3 rounded-lg cursor-pointer hover:bg-[#2a2f3a]"
                    onClick={() => {
                      dispatch(setActiveChat(search.data));
                      navigate(`/chat/${search.data._id}`);
                    }}
                  >
                    <p className="font-medium text-sm md:text-base">
                      {
                        search.data.participants.find(
                          (p) => p.username !== user.username,
                        ).name
                      }
                    </p>
                    <p className="text-xs md:text-sm text-gray-400">
                      @
                      {
                        search.data.participants.find(
                          (p) => p.username !== user.username,
                        ).username
                      }
                    </p>
                  </div>
                ))
              ) : (
                <Sidebar contacts={chatList} />
              )}
            </div>
          </div>

          {/* Bottom – sticks to bottom like WhatsApp (settings + logout) */}
          <div className="border-t border-[#4a3468]">
            <Bottom props={{ logoutHandler }} />
          </div>
        </div>
        {/* RIGHT: Welcome panel – desktop only */}
        <div className="hidden md:flex md:w-[70%] bg-[#161b22] p-10 flex-col justify-center items-center relative">
          <MessageSquare className="text-gray-600 w-20 h-20 mb-6" />
          <h2 className="text-2xl font-semibold">Welcome to QuicKChat</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Select a chat from the left or start a new conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
