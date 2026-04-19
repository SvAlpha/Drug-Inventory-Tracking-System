import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shipmentService } from '../services/api';
import toast from 'react-hot-toast';

export default function ShipmentTracking() {
  const { orderId } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipment();
  }, [orderId]);

  const fetchShipment = async () => {
    try {
      const { data } = await shipmentService.getTimeline(orderId);
      setShipment(data);
    } catch (error) {
      toast.error('Failed to load shipment data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!shipment) {
    return <div className="text-center text-gray-500">Shipment not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Shipment Tracking</h1>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">{shipment.order?.drugId?.drugName} - Order #{orderId.slice(-8)}</h2>
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-gray-600 text-sm">Quantity</p>
            <p className="font-bold text-lg">{shipment.order?.quantity}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Vendor</p>
            <p className="font-bold text-lg">{shipment.order?.fulfilledBy?.companyName || 'Unassigned'}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4">Timeline</h3>
        <div className="space-y-4">
          {shipment.timeline?.map((entry, index) => (
            <div key={entry._id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                {index < shipment.timeline.length - 1 && (
                  <div className="w-1 h-12 bg-blue-200 mt-2"></div>
                )}
              </div>
              <div className="pb-8">
                <p className="font-bold text-lg">{entry.status}</p>
                <p className="text-gray-600 text-sm">{entry.location}</p>
                <p className="text-gray-500 text-sm">{entry.note}</p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(entry.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
