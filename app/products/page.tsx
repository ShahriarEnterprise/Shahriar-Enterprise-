'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { bdt, toBn } from '@/lib/format'
import { Plus, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  // Form states
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('পিস')
  const [lowStockAlert, setLowStockAlert] = useState('5')

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalStockValue = products.reduce((s, p) => s + p.stock * p.buyPrice, 0)
  const totalUnits = products.reduce((s, p) => s + p.stock, 0)

  // Open Edit Modal & load data
  const handleOpenEdit = (p: any) => {
    setEditingProduct(p)
    setName(p.name)
    setCategory(p.category)
    setBuyPrice(p.buyPrice.toString())
    setSellPrice(p.sellPrice.toString())
    setStock(p.stock.toString())
    setUnit(p.unit)
    setLowStockAlert((p.lowStockAlert || 5).toString())
  }

  // Handle Update Submit
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    updateProduct(editingProduct.id, {
      name,
      category,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      stock: Number(stock) || 0,
      unit,
      lowStockAlert: Number(lowStockAlert) || 5,
    })

    setEditingProduct(null)
  }

  // Handle Add New Product
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addProduct({
      name,
      category,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      stock: Number(stock) || 0,
      unit,
      lowStockAlert: Number(lowStockAlert) || 5,
    })
    setIsAddOpen(false)
    setName('')
    setCategory('')
    setBuyPrice('')
    setSellPrice('')
    setStock('')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted pb-24">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-4 py-5 text-white flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#D4AF37]">স্টক ম্যানেজমেন্ট</h1>
        <button
          onClick={() => {
            setName('')
            setCategory('')
            setBuyPrice('')
            setSellPrice('')
            setStock('')
            setIsAddOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl bg-[#D4AF37] px-3.5 py-2 text-xs font-semibold text-black shadow-md"
        >
          <Plus className="h-4 w-4" /> নতুন পণ্য
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">মজুদ মূল্য</p>
            <p className="mt-1 text-lg font-bold text-primary">{bdt(totalStockValue)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">মোট পণ্য / একক</p>
            <p className="mt-1 text-lg font-bold text-card-foreground">
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
            className="w-full rounded-2xl bg-card py-2.5 pl-10 pr-4 text-sm outline-none border border-border shadow-sm"
          />
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="rounded-2xl bg-card p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-card-foreground truncate">{p.name}</h3>
                  {p.stock <= p.lowStockAlert && (
                    <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                      লো স্টক
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {p.category} · বিক্রয় {bdt(p.sellPrice)}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-card-foreground">
                  {toBn(p.stock)} {p.unit}
                </p>
                <div className="flex items-center gap-2 mt-2 justify-end">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm('আপনি কি নিশ্চিত এই পণ্যটি ডিলিট করতে চান?')) {
                        deleteProduct(p.id)
                      }
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-card-foreground">প্রোডাক্ট এডিট করুন</h2>
              <button onClick={() => setEditingProduct(null)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">ক্যাটাগরি</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">ক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">বিক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">একক (যেমন: কেজি, পিস)</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-card-foreground">নতুন পণ্য যোগ করুন</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  placeholder="পণ্যের নাম লিখুন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">ক্যাটাগরি</label>
                <input
                  type="text"
                  placeholder="যেমন: মুদি, ডেইরি"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">ক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">বিক্রয়মূল্য (৳)</label>
                  <input
                    type="number"
                    required
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">স্টক পরিমাণ</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">একক</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm outline-none mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
