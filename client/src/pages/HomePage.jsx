import { MessageSquare, LogOut, Settings, UserPlus } from "lucide-react";

export default function HomePage() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://via.placeholder.com/80x80/1e1e1e/ffffff?text=JD",
  };

  const contacts = [
    { id: 1, name: "Alice", lastMsg: "Hey there!", active: true },
    { id: 2, name: "Bob", lastMsg: "Let's meet tomorrow." },
    { id: 3, name: "Charlie", lastMsg: "Typing..." },
  ];

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
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
            </div>

            {/* Contacts Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-300 text-sm font-semibold">Chats</h3>
              <button className="bg-white text-black rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-gray-200 transition">
                <UserPlus size={14} /> Add
              </button>
            </div>

            {/* Contacts List */}
            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    c.active ? "bg-[#161b22]" : "hover:bg-[#2a2f3a]"
                  }`}
                >
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-gray-400 truncate">{c.lastMsg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Settings/Logout */}
          <div className="border-t border-gray-600 pt-4 flex justify-between">
            <button className="flex items-center text-gray-300 hover:text-white gap-2 text-sm">
              <Settings size={18} /> Settings
            </button>
            <button className="flex items-center text-gray-300 hover:text-white gap-2 text-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-[70%] bg-[#161b22] p-10 flex flex-col justify-center items-center relative">
          {/* <div className="absolute top-5 right-5 flex gap-2">
            {["RU", "DE", "EN"].map((lang) => (
              <button
                key={lang}
                className={`px-3 py-1 rounded-md text-sm ${
                  lang === "EN"
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div> */}

          <MessageSquare className="text-gray-600 w-20 h-20 mb-6" />
          <h2 className="text-2xl font-semibold">Welcome to  QuicKChat</h2>
          <p className="text-gray-400 text-sm mt-2">
            Select a chat from the left or start a new conversation.
          </p>
        </div>
      </div>
    </div>
  );
}
