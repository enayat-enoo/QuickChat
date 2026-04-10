import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveChat } from "../store/chatSlice";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getAvatar } from "../utils/avatarHelper";
import { formatMessageTime } from "../utils/timeHelper";

export default function Sidebar({ contacts }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const activeChat = useSelector((state) => state.chat.activeChat);

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
        <p>No conversations yet.</p>
        <p className="text-xs mt-1">Search for a user to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {contacts.map((c) => {
        // Always find the other participant by ID, never by index
        const other = c.participants?.find((p) => p._id !== user.id && p.username !== user.username);
        if (!other) return null;

        // Unread count for current user
        const unread = c.participantInfo?.[user.id]?.unreadCount || 0;

        const isActive = activeChat?._id === c._id;

        return (
          <div
            key={c._id}
            onClick={() => {
              dispatch(setActiveChat(c));
              navigate(`/chat/${c._id}`);
            }}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
              isActive
                ? "bg-[#161b22]"
                : "hover:bg-[#2a2f3a]"
            }`}
          >
            {/* Avatar with online indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={getAvatar(other.avatar, other.name)}
                alt={other.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {other.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#3c2a55]" />
              )}
            </div>

            {/* Name + last message */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {other.name}
                </p>
                {c.lastMessage?.createdAt && (
                  <span className="text-[10px] text-gray-500 flex-shrink-0 ml-1">
                    {formatMessageTime(c.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-xs text-gray-400 truncate">
                  {c.lastMessage?.content || "Start a conversation"}
                </p>
                {unread > 0 && (
                  <span className="flex-shrink-0 ml-1 bg-purple-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}