import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { stockService } from '../services/api';
import toast from 'react-hot-toast';

export default function StockManagement({ userRole }) {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    drugName: '',
    category: '',
    currentLevel: 0,
    criticalLimit: 0,
    unit: 'tablets'
  });

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const { data } = await stockService.getAll();
      setDrugs(data);
    } catch (error) {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await stockService.update(editingId, formData);
        toast.success('Drug updated successfully');
      } else {
        await stockService.add(formData);
        toast.success('Drug added successfully');
      }
      setFormData({ drugName: '', category: '', currentLevel: 0, criticalLimit: 0, unit: 'tablets' });
      setEditingId(null);
      setShowForm(false);
      fetchDrugs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await stockService.delete(id);
      toast.success('Drug deleted successfully');
      fetchDrugs();
    } catch (error) {
      toast.error('Failed to delete drug');
    }
  };

  const handleEdit = (drug) => {
    setFormData({
      drugName: drug.drugName,
      category: drug.category,
      currentLevel: drug.currentLevel,
      criticalLimit: drug.criticalLimit,
      unit: drug.unit
    });
    setEditingId(drug._id);
    setShowForm(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Stock Management</h1>
        {userRole === 'hq_admin' && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ drugName: '', category: '', currentLevel: 0, criticalLimit: 0, unit: 'tablets' });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> Add Drug
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && userRole === 'hq_admin' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Drug' : 'Add New Drug'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Drug Name"
              value={formData.drugName}
              onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="Current Level"
              value={formData.currentLevel}
              onChange={(e) => setFormData({ ...formData, currentLevel: parseInt(e.target.value) })}
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="Critical Limit"
              value={formData.criticalLimit}
              onChange={(e) => setFormData({ ...formData, criticalLimit: parseInt(e.target.value) })}
              className="input-field"
              required
            />
            <input
              type="text"
              placeholder="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input-field"
            />
            <div className="flex gap-2 col-span-full">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'Update' : 'Add'} Drug
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr className="bg-gray-50">
                <th>Drug Name</th>
                <th>Category</th>
                <th>Current Level</th>
                <th>Critical Limit</th>
                <th>Status</th>
                {userRole === 'hq_admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {drugs.length > 0 ? (
                drugs.map((drug) => {
                  const isCritical = drug.currentLevel <= drug.criticalLimit;
                  return (
                    <tr key={drug._id}>
                      <td className="font-medium">{drug.drugName}</td>
                      <td>{drug.category}</td>
                      <td>{drug.currentLevel} {drug.unit}</td>
                      <td>{drug.criticalLimit} {drug.unit}</td>
                      <td>
                        {isCritical ? (
                          <span className="badge badge-danger flex items-center gap-1 w-fit">
                            <AlertTriangle size={14} /> Critical
                          </span>
                        ) : (
                          <span className="badge badge-success">Normal</span>
                        )}
                      </td>
                      {userRole === 'hq_admin' && (
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(drug)}
                              className="text-blue-600 hover:text-blue-800 transition"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(drug._id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">
                    No drugs in inventory yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
