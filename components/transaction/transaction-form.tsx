'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, Check } from 'lucide-react'
import { Screen } from '@/components/screen'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStore } from '@/lib/store'
import { bdt, toBn } from '@/lib/format'
import type { PartyType, SaleItem, TxnType } from '@/lib/types'

export function TransactionForm({ type }: { type: TxnType }) {
  const router = useRouter()
  const { products, parties, addTransaction } = useStore()

  const isSale = type === 'বিক্রি'
  const partyTypes: PartyType[] = isSale ? ['কাস্টমার', 'SR/DSR'] : ['সাপ্লায়ার']
  const eligibleParties = parties.filter((p) => partyTypes.includes(p.type))

  const [partyId, setPartyId] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [paid, setPaid] = useState('')
  const [note, setNote] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.price, 0), [items])
  const due = Math.max(0, total - (Number(paid) || 0))

  function addItem(productId: string) {
    const prod = products.find((p) => p.id === productId)
    if (!prod) return
    setItems((prev) => {
      if (prev.some((i) => i.productId === productId)) return prev
      return [
        ...prev,
        {
          productId,
          name: prod.name,
          unit: prod.unit,
          qty: 1,
          price: isSale ? prod.sellPrice : prod.buyPrice,
        },
      ]
    })
    setPickerOpen(false)
  }

  function updateQty(productId: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    )
  }

  function updatePrice(productId: string, price: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, price } : i)),
    )
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function submit() {
    if (!partyId || items.length === 0) return
    addTransaction({
      type,
      partyId,
      items,
      paid: Number(paid) || 0,
      note: note.trim() || undefined,
    })
    router.push(`/parties/${partyId}`)
  }

  const available = products.filter((p) => !items.some((i) => i.productId === p.id))

  return (
    <Screen
      title={isSale ? 'নতুন বিক্রি' : 'নতুন কেনা'}
      back
      showNav={false}
      headerTone="primary"
    >
      <div className="space-y-4">
        {/* Party select */}
        <div className="space-y-1.5">
          <Label>{isSale ? 'কাস্টমার / SR' : 'সাপ্লায়ার'}</Label>
          <Select value={partyId} onValueChange={setPartyId}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="পার্টি নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              {eligibleParties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <Label>পণ্যসমূহ</Label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-1"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              পণ্য যোগ
            </Button>
          </div>

          {items.map((i) => (
            <div key={i.productId} className="rounded-2xl bg-card p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-sm font-medium text-card-foreground">{i.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(i.productId)}
                  aria-label="সরান"
                  className="text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(i.productId, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground"
                    aria-label="কমান"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {toBn(i.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(i.productId, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary"
                    aria-label="বাড়ান"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground">{i.unit}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">৳</span>
                  <Input
                    inputMode="numeric"
                    value={String(i.price)}
                    onChange={(e) => updatePrice(i.productId, Number(e.target.value) || 0)}
                    className="h-8 w-20 text-right text-sm"
                  />
                </div>
              </div>
              <p className="mt-2 text-right text-xs text-muted-foreground">
                সাবটোটাল: <span className="font-semibold text-foreground">{bdt(i.qty * i.price)}</span>
              </p>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
              এখনো কোনো পণ্য যোগ করা হয়নি
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="space-y-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">মোট বিল</span>
            <span className="font-bold text-card-foreground">{bdt(total)}</span>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paid">{isSale ? 'নগদ জমা' : 'পরিশোধ'} (৳)</Label>
            <Input
              id="paid"
              inputMode="numeric"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">বাকি</span>
            <span className="font-bold text-destructive">{bdt(due)}</span>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note">নোট (ঐচ্ছিক)</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="মন্তব্য..."
            className="bg-card"
          />
        </div>

        <Button
          onClick={submit}
          disabled={!partyId || items.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          <Check className="h-5 w-5" />
          {isSale ? 'বিক্রি সম্পন্ন করুন' : 'কেনা সম্পন্ন করুন'}
        </Button>
      </div>

      {/* Product picker */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>পণ্য নির্বাচন করুন</DialogTitle>
          </DialogHeader>
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {available.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addItem(p.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-muted p-3 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      স্টক: {toBn(p.stock)} {p.unit}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {bdt(isSale ? p.sellPrice : p.buyPrice)}
                  </span>
                </button>
              </li>
            ))}
            {available.length === 0 && (
              <li className="p-4 text-center text-sm text-muted-foreground">
                সব পণ্য যোগ করা হয়েছে
              </li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </Screen>
  )
}
