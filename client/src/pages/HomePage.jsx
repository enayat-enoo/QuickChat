import { MessageSquare, UserSearch } from "lucide-react";
import axios from "axios";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "../store/userSlice";
import { fetchChatList } from "../store/chatSlice";
import Bottom from "../components/Bottom";
import { useSocket } from "../context/SocketContext";
import { updateChatList } from "../store/chatSlice";
import { setActiveChat } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const [userSearch, setUserSearch] = useState("");
  const { socket } = useSocket();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.user);
  const chatList = useSelector((state) => state.chat?.chatList ?? []);

  useEffect(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    socket.on("getMessage", (message) => {
      dispatch(updateChatList(message));
    });
    return ()=>socket.off("newMessage");
  }, [socket, dispatch]);

  function logoutHandler() {
    axios
      .get("http://localhost:8001/api/logout", { withCredentials: true })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function userSearchHandler() {
    if (!userSearch.trim()) return;
    dispatch(searchUser(userSearch));
    setUserSearch("");
  }

  function avatarUpload() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("avatar", file);
      axios
        .post("http://localhost:8001/api/user/avatar", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        })
        .then(() => {
          window.location.reload();
        })
        .catch((err) => {
          console.log(err);
        });
    };
    fileInput.click();
  }


  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-sans text-white">
      <div className="w-[1100px] h-[600px] bg-[#1a1f29] rounded-2xl overflow-hidden flex shadow-2xl">
        {/* Sidebar */}
        <div className="w-[30%] bg-[#3c2a55] flex flex-col justify-between p-6">
          {/* Top - User Info */}
          <div>
            <div className="flex items-center space-x-4 mb-8">
              <img
                src={user.avatar}
                alt="avatar"
                className="w-14 h-14 rounded-full border-2 border-gray-500 object-cover"
                onClick={avatarUpload}
              />
              <div>
                <h2 className="font-semibold text-lg">{user.name}</h2>
                <p className="text-sm text-gray-300">{user.username}</p>
              </div>
            </div>

            {/* Contacts Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-300 text-sm font-semibold">Chats</h3>
              <div className="flex items-center gap-2 bg-white rounded-md px-2 py-1">
                <UserSearch
                  size={14}
                  className="text-black cursor-pointer"
                  onClick={userSearchHandler}
                />
                <input
                  type="text"
                  className="bg-transparent outline-none text-black text-sm flex-1"
                  placeholder="search user"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
              {/* If search results exist, show them */}
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
                    <p className="font-medium">{
                      search.data.participants.find((p) => p.username !== user.username).name}</p>
                    <p className="text-sm text-gray-400">
                      @{search.data.participants.find((p) => p.username !== user.username).username}
                    </p>
                  </div>
                ))
              ) : (
                /* Show default contacts */
                <Sidebar contacts={chatList} />
              )}
            </div>
          </div>

          {/* Bottom - Settings/Logout */}
          <Bottom props={{ logoutHandler }} />
        </div>

        {/* Chat Area */}
        <div className="w-[70%] bg-[#161b22] p-10 flex flex-col justify-center items-center relative">
          <MessageSquare className="text-gray-600 w-20 h-20 mb-6" />
          <h2 className="text-2xl font-semibold">Welcome to QuicKChat</h2>
          <p className="text-gray-400 text-sm mt-2">
            Select a chat from the left or start a new conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
