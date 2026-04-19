import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { stockService, orderService, consumptionService } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard({ userRole }) {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    criticalStock: 0,
    pendingOrders: 0,
    recentData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      // All roles can get orders
      const orderRes = await orderService.getAll();
      const orders = orderRes.data || [];

      // Different data based on role
      let dashboardData = {
        totalDrugs: 0,
        criticalStock: 0,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        recentData: []
      };

      if (userRole === 'hq_admin') {
        // HQ Admin sees all drugs and consumption logs
        const [stockRes, consumeRes] = await Promise.all([
          stockService.getAll(),
          consumptionService.getAll()
        ]);
        
        const drugs = stockRes.data || [];
        const consumption = consumeRes.data || [];

        dashboardData.totalDrugs = drugs.length;
        dashboardData.criticalStock = drugs.filter(d => d.currentLevel <= d.criticalLimit).length;
        dashboardData.recentData = consumption.slice(0, 5);
      } else if (userRole === 'hospital_staff') {
        // Hospital sees stock and their consumption logs
        const [stockRes, consumeRes] = await Promise.all([
          stockService.getAll(),
          consumptionService.getMy()
        ]);
        
        const drugs = stockRes.data || [];
        const consumption = consumeRes.data || [];

        dashboardData.totalDrugs = drugs.length;
        dashboardData.criticalStock = drugs.filter(d => d.currentLevel <= d.criticalLimit).length;
        dashboardData.recentData = consumption.slice(0, 5);
      } else if (userRole === 'vendor') {
        // Vendor sees their assigned orders
        dashboardData.totalDrugs = orders.filter(o => o.fulfilledBy).length;
        dashboardData.recentData = orders.slice(0, 5);
      }

      setStats(dashboardData);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied for this action');
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`card ${color}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color === 'bg-red-50' ? 'bg-red-100' : 'bg-blue-100'}`}>
          <Icon className={color === 'bg-red-50' ? 'text-red-600' : 'text-blue-600'} size={28} />
        </div>
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userRole === 'vendor' ? (
          <>
            <StatCard icon={Package} title="Assigned Orders" value={stats.totalDrugs} />
            <StatCard icon={TrendingUp} title="Pending Orders" value={stats.pendingOrders} />
          </>
        ) : (
          <>
            <StatCard icon={Package} title="Total Drugs" value={stats.totalDrugs} />
            <StatCard icon={AlertTriangle} title="Critical Stock" value={stats.criticalStock} color="bg-red-50" />
            <StatCard icon={TrendingUp} title="Pending Orders" value={stats.pendingOrders} />
            <StatCard icon={Users} title="Active Users" value="3" />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          {userRole === 'vendor' ? 'Recent Orders' : 'Recent Activity'}
        </h2>
        {stats.recentData.length > 0 ? (
          <table className="table">
            <thead>
              <tr className="bg-gray-50">
                {userRole === 'vendor' ? (
                  <>
                    <th>Drug</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Date</th>
                  </>
                ) : (
                  <>
                    <th>Drug</th>
                    <th>Quantity/Action</th>
                    <th>Details</th>
                    <th>Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {stats.recentData.map((item) => (
                <tr key={item._id}>
                  {userRole === 'vendor' ? (
                    <>
                      <td className="font-medium">{item.drugId?.drugName || 'N/A'}</td>
                      <td>{item.quantity}</td>
                      <td><span className="badge badge-info">{item.status}</span></td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </>
                  ) : (
                    <>
                      <td className="font-medium">{item.drugId?.drugName || 'N/A'}</td>
                      <td>{item.quantityConsumed || item.quantity}</td>
                      <td>{item.stockLevelAfter || item.status}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📖 Quick Guide</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            {userRole === 'vendor' ? (
              <>
                <li>• View orders assigned to you</li>
                <li>• Update shipment status and location</li>
                <li>• Track order progress in real-time</li>
                <li>• Receive notifications for order updates</li>
              </>
            ) : (
              <>
                <li>• Use Stock Management to view and manage drug inventory</li>
                <li>• Track orders and shipments in real-time</li>
                <li>• View audit logs for complete transparency</li>
                <li>• Manage notifications for critical alerts</li>
              </>
            )}
          </ul>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-lg font-bold text-green-900 mb-2">✨ System Features</h3>
          <ul className="text-sm text-green-800 space-y-2">
            {userRole === 'vendor' ? (
              <>
                <li>✓ Real-time order tracking</li>
                <li>✓ Multi-location updates</li>
                <li>✓ Status notifications</li>
                <li>✓ Complete audit history</li>
              </>
            ) : (
              <>
                <li>✓ Real-time inventory tracking</li>
                <li>✓ Automated low-stock alerts</li>
                <li>✓ Multi-role access control</li>
                <li>✓ Complete audit trail</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
