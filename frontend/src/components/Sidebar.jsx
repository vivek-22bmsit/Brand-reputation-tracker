function Sidebar({ activePage, onPageChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mentions', label: 'Live Mentions', icon: '💬' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'alerts', label: 'Alerts', icon: '🔔', badge: true },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="w-64 h-screen border-r border-gray-200 bg-white fixed left-0 top-0 z-50 shadow-sm overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">BP</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900">BrandPulse</h1>
            <p className="text-xs text-gray-500">Reputation Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  activePage === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-white">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow">
            <span className="text-white font-semibold">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
