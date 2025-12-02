import { Phone, PhoneOff } from "lucide-react";

export default function IncomingVoiceCallUI() {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#141416] to-[#0b0b0c] flex items-center justify-center">

      <div className="flex flex-col items-center justify-between h-full py-20">

        {/* Avatar with Glow */}
        <div className="flex flex-col items-center text-center mt-16">
          <div className="relative">
            <div className="absolute inset-0 w-40 h-40 rounded-full blur-lg bg-purple-600/20 animate-pulse"></div>
            <div className="w-40 h-40 rounded-full bg-[#25232a] flex items-center justify-center text-white text-5xl font-bold shadow-xl border border-gray-600/40">
              A
            </div>
          </div>

          <h2 className="text-white text-3xl font-semibold mt-6">Alice</h2>
          <p className="text-gray-400 text-lg mt-1">Incoming voice call…</p>
        </div>

        <div className="flex items-center justify-center gap-24 mb-24">

          <button className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 transition shadow-xl flex items-center justify-center text-white">
            <PhoneOff size={34} />
          </button>

          <button className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:scale-90 transition shadow-xl flex items-center justify-center text-white">
            <Phone size={34} />
          </button>

        </div>

        <p className="text-gray-500 text-sm mb-4 animate-pulse">Swipe up to answer</p>
      </div>

    </div>
  );
}
