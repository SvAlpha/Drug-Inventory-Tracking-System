import React from 'react';
import { User, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage({ userRole }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800">Profile</h1>

      <div className="card">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {userRole ? userRole[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userRole?.replace('_', ' ').toUpperCase()}</h2>
            <p className="text-gray-600">ID: {userId?.slice(-8)}</p>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <div>
            <label className="text-sm font-semibold text-gray-600">Role</label>
            <p className="text-lg text-gray-800 capitalize">{userRole?.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Account Type</label>
            <p className="text-lg text-gray-800">
              {userRole === 'hq_admin' ? 'Administrator' : userRole === 'hospital_staff' ? 'Hospital Staff' : 'Vendor'}
            </p>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-4">Account Actions</h3>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="card bg-blue-50">
        <h3 className="font-bold text-blue-900 mb-2">Help & Support</h3>
        <p className="text-blue-800 text-sm">
          For technical support or issues, please contact the system administrator.
        </p>
      </div>
    </div>
  );
}
