import { MessageSquare, LogOut, Settings, UserSearch } from "lucide-react";
import { useContext, useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchUser } from "../store/userSlice";
import { fetchChatList } from "../store/chatSlice";

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const [userSearch, setUserSearch] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults } = useSelector((state) => state.user);
  const chatList  = useSelector((state) => state.chat?.chatList ?? []);

  useEffect(() => {
    dispatch(fetchChatList());
  },[dispatch]);

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
                searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 rounded-lg cursor-pointer hover:bg-[#2a2f3a]"
                    onClick={() => navigate(`/chat/${user.data.id}`)}
                  >
                    <p className="font-medium">{user.data.name}</p>
                    <p className="text-sm text-gray-400">
                      @{user.data.username}
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
          <div className="border-t border-gray-600 pt-4 flex justify-between">
            <button className="flex items-center text-gray-300 hover:text-white gap-2 text-sm">
              <Settings size={18} /> Settings
            </button>
            <button
              className="flex items-center text-gray-300 hover:text-white gap-2 text-sm"
              onClick={logoutHandler}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
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
