import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrendsPage from './components/TrendsPage';
import { fetchBrands } from './services/api';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands
  });

  useEffect(() => {
    if (brands && brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0]);
    }
  }, [brands, selectedBrand]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Cannot connect to backend API</p>
          <p className="text-sm text-gray-500">Make sure backend is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands, mentions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3.5 top-3 text-gray-400 text-lg">🔍</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4 ml-6">
              {/* Brand Selector */}
              {brands && brands.length > 0 && (
                <select
                  value={selectedBrand?._id || ''}
                  onChange={(e) => {
                    const brand = brands.find(b => b._id === e.target.value);
                    setSelectedBrand(brand);
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-700 hover:border-gray-400 transition-all cursor-pointer"
                >
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Notifications */}
              <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile */}
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all">
                <span className="text-white font-semibold">U</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {selectedBrand ? (
            <>
              {activePage === 'dashboard' && <Dashboard brand={selectedBrand} />}
              {activePage === 'trends' && <TrendsPage brand={selectedBrand} />}
              {activePage === 'mentions' && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">💬</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Mentions</h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              )}
              {activePage === 'alerts' && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">🔔</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Alerts</h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              )}
              {activePage === 'settings' && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Brands Yet</h2>
              <p className="text-gray-600 mb-6">Create your first brand to start tracking mentions</p>
              <div className="bg-gray-900 text-gray-100 px-6 py-4 rounded-xl inline-block text-left shadow-lg">
                <code className="text-sm">
                  curl -X POST http://localhost:5000/api/brands \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-d '{`{"name":"YourBrand","keywords":["keyword1"]}`}'
                </code>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
