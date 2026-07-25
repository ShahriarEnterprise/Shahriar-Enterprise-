'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { Product } from '@/lib/types';

interface InventoryMonitorProps {
  products: Product[];
}

export default function InventoryMonitor({ products }: InventoryMonitorProps) {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    const low = products.filter((p) => p.current_stock <= p.min_stock_level && p.current_stock > 0);
    const critical = products.filter((p) => p.current_stock === 0);
    setLowStockProducts(low);
    setCriticalStockProducts(critical);
  }, [products]);

  if (lowStockProducts.length === 0 && criticalStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* ক্রিটিক্যাল স্টক */}
      {criticalStockProducts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-700">🚨 জরুরি: স্টক শেষ!</h3>
          </div>
          <div className="space-y-2">
            {criticalStockProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded border border-red-200">
                <div className="font-semibold text-red-800">{product.name}</div>
                <div className="text-sm text-gray-600">SKU: {product.sku}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* কম স্টক */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="text-yellow-600" size={24} />
            <h3 className="text-lg font-bold text-yellow-700">⚠️ সতর্কতা: কম স্টক</h3>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="bg-white p-3 rounded border border-yellow-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-yellow-800">{product.name}</div>
                    <div className="text-sm text-gray-600">বর্তমান: {product.current_stock} {product.unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">ন্যূনতম: {product.min_stock_level}</div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1">
                      এখনই অর্ডার করুন →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
