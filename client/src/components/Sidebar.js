import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Package, ShoppingCart, Truck, FileText, Settings } from 'lucide-react';

export default function Sidebar({ userRole }) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/stock', label: 'Stock Management', icon: Package, roles: ['hq_admin'] },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/audit', label: 'Audit Logs', icon: FileText, roles: ['hq_admin'] }
  ];

  const visibleItems = menuItems.filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>
      <nav className="mt-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-6 py-3 border-l-4 transition ${
                isActive
                  ? 'bg-blue-600 border-blue-400'
                  : 'border-transparent hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
