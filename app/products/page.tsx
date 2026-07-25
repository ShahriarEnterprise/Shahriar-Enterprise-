'use client'

import { useMemo, useState } from 'react'
import { Search, Package, SlidersHorizontal, Trash2, Edit } from 'lucide-react'
import { Screen } from '@/components/screen'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AddProductDialog } from '@/components/products/add-product-dialog'
import { StockAdjustDialog } from '@/components/products/stock-adjust-dialog'
import { useStore } from '@/lib/store'
import { supabase } from '@/lib/supabase' // সুপাবেস ক্লায়েন্ট ইমপোর্ট করা হলো
import { bdt, toBn } from '@/lib/format'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const { products } = useStore()
  const [query, setQuery] = useState('')
  const [adjust, setAdjust] = useState<Product | null>(null)

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  )

  const stockValue = products.reduce((s, p) => s + p.stock * p.buyPrice, 0)
  const totalItems = products.reduce((s, p) => s + p.stock, 0)

  // প্রোডাক্ট ডিলিট করার ফাংশন
  const handleDelete = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation() // যাতে কার্ডের অন্য ক্লিক ইভেন্ট কাজ না করে
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি ডিলিট করতে চান?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        alert("ডিলিট করতে সমস্যা হয়েছে: " + error.message)
      } else {
        alert("প্রোডাক্ট সফলভাবে ডিলিট হয়েছে!")
        window.location.reload()
      }
    }
  }

  return (
    <Screen title="স্টক ম্যানেজমেন্ট" headerRight={<AddProductDialog />}>
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">মজুদ মূল্য</p>
            <p className="mt-1 text-lg font-bold text-primary">{bdt(stockValue)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">মোট পণ্য / একক</p>
            <p className="mt-1 text-lg font-bold text-card-foreground">
              {toBn(products.length)} / {toBn(totalItems)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পণ্য খুঁজুন..."
            className="bg-card pl-9"
          />
        </div>

        {/* List */}
        <ul className="space-y-2.5">
          {filtered.map((p) => {
            const low = p.stock <= p.lowStockAlert
            return (
              <li key={p.id}>
                <div
                  onClick={() => setAdjust(p)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.category} · বিক্রয় {bdt(p.sellPrice)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* ডিলিট বাটন */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <SlidersHorizontal className="h-3 w-3 text-muted-foreground" />
                        <span
                          className={`text-sm font-bold ${
                            low ? 'text-destructive' : 'text-card-foreground'
                          }`}
                        >
                          {toBn(p.stock)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{p.unit}</p>
                      {low && (
                        <Badge
                          variant="secondary"
                          className="mt-0.5 bg-red-50 text-[10px] text-destructive"
                        >
                          লো স্টক
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
              কোনো পণ্য পাওয়া যায়নি
            </li>
          )}
        </ul>
      </div>

      <StockAdjustDialog product={adjust} onOpenChange={(o) => !o && setAdjust(null)} />
    </Screen>
  )
}
