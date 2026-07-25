'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Unit } from '@/lib/types';
import { bdt, toBn } from '@/lib/format';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

const UNITS: Unit[] = ['পিস', 'ডজন', 'কেস', 'বস্তা', 'কেজি'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState<Unit>('পিস');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('5');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const newProduct = {
        user_id: userData.user.id,
        name,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        category,
        unit,
        purchase_price: parseFloat(purchasePrice) || 0,
        selling_price: parseFloat(sellingPrice) || 0,
        current_stock: parseFloat(currentStock) || 0,
        min_stock_level: parseFloat(minStockLevel) || 5,
      };

      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;

      resetForm();
      setIsAddOpen(false);
      fetchProducts();
    } catch (error: any) {
      alert('পণ্য যোগ করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name,
          category,
          unit,
          purchase_price: parseFloat(purchasePrice) || 0,
          selling_price: parseFloat(sellingPrice) || 0,
          current_stock: parseFloat(currentStock) || 0,
          min_stock_level: parseFloat(minStockLevel) || 5,
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert('পণ্য আপডেট করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত এই পণ্যটি ডিলিট করতে চান?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      alert('ডিলিট করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku || '');
    setCategory(p.category || '');
    setUnit(p.unit);
    setPurchasePrice(p.purchase_price.toString());
    setSellingPrice(p.selling_price.toString());
    setCurrentStock(p.current_stock.toString());
    setMinStockLevel(p.min_stock_level.toString());
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setCategory('');
    setUnit('পিস');
    setPurchasePrice('');
    setSellingPrice('');
    setCurrentStock('');
    setMinStockLevel('5');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const totalStockValue = products.reduce((s, p) => s + p.current_stock * p.purchase_price, 0);
  const totalUnits = products.reduce((s, p) => s + p.current_stock, 0);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted pb-24">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-4 py-5 text-white flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#D4AF37]">স্টক ম্যানেজমেন্ট</h1>
        <button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-semibold text-black shadow-md hover:bg-[#c49f30] transition"
        >
          <Plus className="h-4 w-4" /> নতুন পণ্য
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <p className="text-xs text-muted-foreground">মজুদ মূল্য</p>
            <p className="mt-1 text-base font-bold text-primary">{bdt(totalStockValue)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm border border-border">
            <p className="text-xs text-muted-foreground">মোট পণ্য / একক</p>
            <p className="mt-1 text-base font-bold text-card-foreground">
              {toBn(products.length)} / {toBn(totalUnits)}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-card py-2.5 pl-10 pr-4 text-sm outline-none border border-border shadow-sm text-card-foreground"
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">লোড হচ্ছে...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">কোনো পণ্য পাওয়া যায়নি।</p>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between gap-3 border border-border ${
                  p.current_stock <= p.min_stock_level ? 'bg-destructive/5 border-destructive/30' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{p.name}</h3>
                    {p.current_stock <= p.min_stock_level && (
                      <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                        লো স্টক
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.category || 'সাধারণ'} · বিক্রয় {bdt(p.selling_price)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-card-foreground">
                    {toBn(p.current_stock)} {p.unit}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 justify-end">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal Component */}
      {(isAddOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl space-y-4 border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-card-foreground">
                {editingProduct ? 'প্রোডাক্ট এডিট করুন' : 'নতুন পণ্য যোগ করুন'}
              </h2>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingProduct(null);
                }}
                className="text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="পণ্যের নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">ক্যাটাগরি</label>
                  <input
                    type="text"
                    placeholder="যেমন: মুদি"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">ইউনিট</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as Unit)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">ক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">বিক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">লো স্টক অ্যালার্ট</label>
                  <input
                    type="number"
                    step="any"
                    value={minStockLevel}
                    onChange={(e) => setMinStockLevel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1 text-card-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
