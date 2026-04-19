import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notif => notif.map(n => n._id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update notification');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`card cursor-pointer transition ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-600'}`}
              onClick={() => markAsRead(notif._id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{notif.message}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notif.isRead && (
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center text-gray-500 py-8">
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
