'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Printer, FileText } from 'lucide-react';
import { Party, Product } from '@/lib/types';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  parties: Party[];
  products: Product[];
}

export default function BillingModal({ isOpen, onClose, onSubmit, parties, products }: BillingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    party_id: '',
    type: 'sale',
    transaction_date: new Date().toISOString().split('T')[0],
    items: [{ product_id: '', quantity: 0, unit_price: 0 }],
    discount: 0,
    tax: 0,
    payment_method: 'cash',
    notes: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.includes(searchTerm)
  );

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const afterDiscount = subtotal - formData.discount;
    return afterDiscount + (afterDiscount * formData.tax) / 100;
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
      const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const total = calculateTotal();
      await onSubmit({
        ...formData,
        products: formData.items,
        total_amount: total,
        payment_status: 'completed',
        paid_amount: total,
      });
      setFormData({
        party_id: '',
        type: 'sale',
        transaction_date: new Date().toISOString().split('T')[0],
        items: [{ product_id: '', quantity: 0, unit_price: 0 }],
        discount: 0,
        tax: 0,
        payment_method: 'cash',
        notes: '',
      });
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const afterDiscount = subtotal - formData.discount;
  const tax = (afterDiscount * formData.tax) / 100;
  const total = afterDiscount + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-6 bg-blue-600 text-white rounded-t-lg">
          <h2 className="text-2xl font-bold">🧾 বিল তৈরি করুন</h2>
          <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ক্রেতা *</label>
              <select
                value={formData.party_id}
                onChange={(e) => setFormData({ ...formData, party_id: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ক্রেতা নির্বাচন করুন</option>
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
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">পেমেন্ট পদ্ধতি</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">নগদ</option>
                <option value="card">কার্ড</option>
                <option value="bank_transfer">ব্যাংক ট্রান্সফার</option>
                <option value="check">চেক</option>
              </select>
            </div>
          </div>

          {/* পণ্য সার্চ */}
          <div>
            <label className="block text-sm font-semibold mb-2">🔍 পণ্য খুঁজুন এবং যোগ করুন</label>
            <input
              type="text"
              placeholder="পণ্যের নাম বা SKU লিখুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            />
            {searchTerm && filteredProducts.length > 0 && (
              <div className="border rounded-lg max-h-32 overflow-y-auto bg-gray-50">
                {filteredProducts.slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        items: [
                          ...prev.items,
                          { product_id: product.id, quantity: 1, unit_price: product.selling_price },
                        ],
                      }));
                      setSearchTerm('');
                    }}
                    className="w-full text-left p-2 hover:bg-blue-100 border-b"
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-sm text-gray-600">SKU: {product.sku} | মূল্য: ৳{product.selling_price}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* পণ্য আইটেম */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-5 gap-2 mb-3 font-semibold text-sm">
              <div>পণ্য</div>
              <div>পরিমাণ</div>
              <div>মূল্য</div>
              <div>মোট</div>
              <div>কর্ম</div>
            </div>
            {formData.items.map((item, index) => {
              const product = products.find((p) => p.id === item.product_id);
              return (
                <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const prod = products.find((p) => p.id === e.target.value);
                      handleItemChange(index, 'product_id', e.target.value);
                      if (prod) handleItemChange(index, 'unit_price', prod.selling_price);
                    }}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">পণ্য নির্বাচন</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                  />
                  <div className="font-semibold">৳{(item.quantity * item.unit_price).toLocaleString('bn-BD')}</div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    মুছুন
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-3 flex items-center gap-1"
            >
              <Plus size={16} /> পণ্য যোগ করুন
            </button>
          </div>

          {/* ছাড় এবং ট্যাক্স */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ছাড় (৳)</label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ট্যাক্স (%)</label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
          </div>

          {/* সারসংক্ষেপ */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="grid grid-cols-2 gap-4 text-lg">
              <div>উপ-মোট:</div>
              <div className="font-bold">৳{subtotal.toLocaleString('bn-BD')}</div>
              <div>ছাড়:</div>
              <div className="font-bold">-৳{formData.discount.toLocaleString('bn-BD')}</div>
              <div>ট্যাক্স ({formData.tax}%):</div>
              <div className="font-bold">+৳{tax.toLocaleString('bn-BD')}</div>
              <div className="border-t-2 border-blue-300 pt-2 text-xl font-bold">মোট বিল:</div>
              <div className="border-t-2 border-blue-300 pt-2 text-xl font-bold text-blue-600">৳{total.toLocaleString('bn-BD')}</div>
            </div>
          </div>

          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="নোট বা মন্তব্য (ঐচ্ছিক)..."
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />

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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {loading ? 'প্রক্রিয়াজাত হচ্ছে...' : '✓ বিল সংরক্ষণ করুন'}
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              প্রিন্ট প্রিভিউ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
