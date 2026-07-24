'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import type { Unit } from '@/lib/types'

const units: Unit[] = ['পিস', 'ডজন', 'কেস', 'কেজি', 'বস্তা']

export function AddProductDialog() {
  const { addProduct } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [unit, setUnit] = useState<Unit>('পিস')
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [stock, setStock] = useState('')
  const [lowStockAlert, setLowStockAlert] = useState('')

  function reset() {
    setName('')
    setCategory('')
    setUnit('পিস')
    setBuyPrice('')
    setSellPrice('')
    setStock('')
    setLowStockAlert('')
  }

  function submit() {
    if (!name.trim()) return
    addProduct({
      name: name.trim(),
      category: category.trim() || 'সাধারণ',
      unit,
      buyPrice: Number(buyPrice) || 0,
      sellPrice: Number(sellPrice) || 0,
      stock: Number(stock) || 0,
      lowStockAlert: Number(lowStockAlert) || 5,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          নতুন পণ্য
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন পণ্য যোগ করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pname">পণ্যের নাম</Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: তীর সয়াবিন তেল ৫ লিটার"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pcat">ক্যাটাগরি</Label>
              <Input
                id="pcat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="মুদি"
              />
            </div>
            <div className="space-y-1.5">
              <Label>একক</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pbuy">ক্রয় মূল্য (৳)</Label>
              <Input
                id="pbuy"
                inputMode="numeric"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="psell">বিক্রয় মূল্য (৳)</Label>
              <Input
                id="psell"
                inputMode="numeric"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pstock">বর্তমান স্টক</Label>
              <Input
                id="pstock"
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="palert">লো-স্টক এলার্ট</Label>
              <Input
                id="palert"
                inputMode="numeric"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="w-full">
            সংরক্ষণ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
