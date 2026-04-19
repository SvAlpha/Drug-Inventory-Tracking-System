import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Bell } from 'lucide-react';

export default function Navbar({ onLogout, userRole }) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">💊 Drug Inventory</h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-gray-600 hover:text-blue-600 transition"
          >
            <Bell size={24} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
              <span className="capitalize text-sm font-medium">{userRole?.replace('_', ' ')}</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
