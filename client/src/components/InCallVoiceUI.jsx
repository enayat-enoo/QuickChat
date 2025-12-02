export default function InCallVoiceUI() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0c0d] flex flex-col items-center justify-between py-20">

      <div className="flex flex-col items-center mt-12">
        <div className="relative">
          <div className="absolute inset-0 w-40 h-40 rounded-full blur-xl bg-green-600/20 animate-ping"></div>
          <div className="w-40 h-40 rounded-full bg-[#1c1b22] text-white text-5xl font-semibold flex items-center justify-center border border-gray-600">
            A
          </div>
        </div>

        <p className="text-white text-3xl font-semibold mt-6">Alice</p>
        <p className="text-gray-400 text-lg mt-1">Calling… 00:28</p>
      </div>

      <div className="flex items-center justify-center gap-20 mb-24">
        <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">🔇</button>
        <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-xl shadow-xl">📞</button>
        <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white">🔈</button>
      </div>
    </div>
  );
}
