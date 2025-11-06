export default function ChatLoader() {
  return (
    <div className="flex-1 bg-[#161b22] flex flex-col animate-pulse">

      {/* Top bar skeleton */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700">
        <div className="w-10 h-10 rounded-full bg-[#2a2f3a]" />
        <div>
          <div className="w-24 h-4 bg-[#2a2f3a] rounded mb-1"></div>
          <div className="w-16 h-3 bg-[#2a2f3a] rounded"></div>
        </div>

        <div className="ml-auto flex gap-3">
          <div className="w-6 h-6 bg-[#2a2f3a] rounded" />
          <div className="w-6 h-6 bg-[#2a2f3a] rounded" />
          <div className="w-6 h-6 bg-[#2a2f3a] rounded" />
          <div className="w-6 h-6 bg-[#2a2f3a] rounded" />
        </div>
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-[#2a2f3a] rounded-full"></div>
          <div className="w-1/3 h-4 bg-[#2a2f3a] rounded"></div>
        </div>

        <div className="flex justify-end gap-2">
          <div className="w-1/2 h-4 bg-[#3c2a55] rounded"></div>
          <div className="w-10 h-10 bg-[#3c2a55] rounded-full"></div>
        </div>

        <div className="flex gap-2">
          <div className="w-10 h-10 bg-[#2a2f3a] rounded-full"></div>
          <div className="w-2/4 h-4 bg-[#2a2f3a] rounded"></div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="p-4 border-t border-gray-700 bg-[#151920] flex items-center gap-3">
        <div className="w-6 h-6 bg-[#2a2f3a] rounded"></div>
        <div className="w-full h-10 bg-[#2a2f3a] rounded"></div>
        <div className="w-10 h-10 bg-[#2a2f3a] rounded"></div>
      </div>
    </div>
  );
}
