export default function Header() {
  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex-1 max-w-xl">
        <input
          type="search"
          placeholder="Search IP, users, error codes..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#b8ff3c]"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white">
          <span className="sr-only">Notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          🔔
        </button>
        <button className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-gray-700" />
          Profile
        </button>
      </div>
    </header>
  )
}
