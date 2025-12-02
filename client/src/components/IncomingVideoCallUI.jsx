import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingVideoCallUI() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black">

      {/* Blurred Background */}
      <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/portrait')] bg-cover bg-center opacity-30 blur-lg"></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-full max-w-[500px] mx-auto flex flex-col items-center justify-between py-14">

        {/* Caller Info */}
        <div className="flex flex-col items-center mt-12 px-4 text-center">

          {/* Profile Pic Glow */}
          <div className="relative">
            <div className="
              absolute inset-0 w-44 h-44 rounded-full blur-xl 
              bg-purple-700/30 animate-pulse
            "></div>

            <div className="
              w-44 h-44 rounded-full 
              bg-gradient-to-br from-[#3c2a55] to-[#151920]
              flex items-center justify-center
              text-white text-5xl font-bold
              shadow-xl border border-white/20
            ">
              A
            </div>
          </div>

          <h2 className="text-white text-3xl font-semibold mt-6">Alice</h2>
          <p className="text-gray-300 text-lg mt-1 tracking-wide">
            Incoming video call…
          </p>
        </div>

        {/* Accept / Reject Buttons */}
        <div className="flex items-center justify-center gap-20 mb-24">

          {/* Decline */}
          <button className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 
            flex items-center justify-center text-white shadow-2xl transition-all">
            <PhoneOff size={34} />
          </button>

          {/* Accept */}
          <button className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:scale-90 
            flex items-center justify-center text-white shadow-2xl transition-all">
            <Video size={34} />
          </button>

        </div>

        {/* Swipe Hint */}
        <p className="text-gray-400 text-sm mb-4 animate-pulse">
          Swipe up to answer
        </p>
      </div>
    </div>
  );
}
