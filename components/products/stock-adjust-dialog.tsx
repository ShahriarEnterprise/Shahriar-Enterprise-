'use client'

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { Product } from '@/lib/types'
import { toBn } from '@/lib/format'

export function StockAdjustDialog({
  product,
  onOpenChange,
}: {
  product: Product | null
  onOpenChange: (open: boolean) => void
}) {
  const { updateProduct } = useStore()
  const [delta, setDelta] = useState(0)

  const open = product !== null
  const newStock = product ? Math.max(0, product.stock + delta) : 0

  function save() {
    if (product) updateProduct(product.id, { stock: newStock })
    setDelta(0)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setDelta(0)
        onOpenChange(o)
      }}
    >
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base">{product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">স্টক সমন্বয় করুন</p>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setDelta((d) => d - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-destructive active:scale-95"
              aria-label="কমান"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div>
              <p className="text-3xl font-bold text-foreground">{toBn(newStock)}</p>
              <p className="text-xs text-muted-foreground">
                {delta >= 0 ? '+' : ''}
                {toBn(delta)} {product?.unit}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDelta((d) => d + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary active:scale-95"
              aria-label="বাড়ান"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center gap-2">
            {[5, 10, 25, 50].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDelta((d) => d + n)}
                className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                +{toBn(n)}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} className="w-full">
            আপডেট করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
