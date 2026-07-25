'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader } from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import { Product } from '@/lib/types';
import * as productAPI from '@/lib/api/products';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (formData: any) => {
    try {
      if (selectedProduct) {
        await productAPI.updateProduct(selectedProduct.id, formData);
      } else {
        await productAPI.createProduct(formData);
      }
      await fetchProducts();
      setSelectedProduct(undefined);
    } catch (error) {
      console.error('Error creating/updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('আপনি কি এই পণ্য মুছে ফেলতে চান?')) {
      try {
        await productAPI.deleteProduct(productId);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">পণ্য ব্যবস্থাপনা</h1>
        <button
          onClick={() => {
            setSelectedProduct(undefined);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন পণ্য যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">পণ্যের নাম</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">SKU</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">স্টক</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ক্রয় মূল্য</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">বিক্রয় মূল্য</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">লাভ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const profit = product.selling_price - product.purchase_price;
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={product.current_stock < product.min_stock_level ? 'text-red-600 font-semibold' : ''}>
                      {product.current_stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">৳{product.purchase_price.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4">৳{product.selling_price.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">৳{profit.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(undefined);
        }}
        onSubmit={handleCreateProduct}
        initialData={selectedProduct}
      />
    </div>
  );
}
