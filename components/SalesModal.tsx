'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Party, Product } from '@/lib/types';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  parties: Party[];
  products: Product[];
}

export default function SalesModal({ isOpen, onClose, onSubmit, parties, products }: SalesModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    party_id: '',
    type: 'sale',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [{ product_id: '', quantity: 0, unit_price: 0 }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 0, unit_price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const total_amount = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      await onSubmit({
        ...formData,
        products: formData.items,
        total_amount,
        payment_status: 'pending',
        paid_amount: 0,
      });
      setFormData({
        party_id: '',
        type: 'sale',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: [{ product_id: '', quantity: 0, unit_price: 0 }],
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const total = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">নতুন বিক্রয় লেনদেন</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">গ্রাহক *</label>
              <select
                name="party_id"
                value={formData.party_id}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">গ্রাহক নির্বাচন করুন</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">তারিখ *</label>
              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">পণ্য সমূহ</label>
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-3">
                <select
                  value={item.product_id}
                  onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                  required
                  className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">পণ্য নির্বাচন</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="পরিমাণ"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                  step="0.01"
                  className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="মূল্য"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                  step="0.01"
                  className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="bg-red-500 text-white px-2 py-2 rounded-lg text-sm hover:bg-red-600"
                >
                  মুছুন
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-2"
            >
              + পণ্য যোগ করুন
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">মন্তব্য</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="মন্তব্য (ঐচ্ছিক)"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-bold">মোট পরিমাণ: ৳{total.toLocaleString('bn-BD')}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg font-semibold hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
