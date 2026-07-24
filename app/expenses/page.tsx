'use client'

import { useMemo, useState } from 'react'
import { Plus, Wallet, Receipt } from 'lucide-react'
import { Screen } from '@/components/screen'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import { bdt, bnRelative } from '@/lib/format'

const categories = [
  'পরিবহন',
  'দোকান ভাড়া',
  'বিদ্যুৎ বিল',
  'কর্মচারী বেতন',
  'চা-নাস্তা',
  'মার্কেটিং',
  'অন্যান্য',
]

export default function ExpensesPage() {
  const { expenses, addExpense } = useStore()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState(categories[0])
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  function submit() {
    const val = Number(amount)
    if (val <= 0) return
    addExpense({ category, amount: val, note: note.trim() || undefined })
    setAmount('')
    setNote('')
    setOpen(false)
  }

  return (
    <Screen
      title="খরচের খাতা"
      headerRight={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              খরচ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>নতুন খরচ যোগ করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>খরচের খাত</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-amount">টাকার পরিমাণ (৳)</Label>
                <Input
                  id="exp-amount"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp-note">বিবরণ (ঐচ্ছিক)</Label>
                <Input
                  id="exp-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="মন্তব্য..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} className="w-full">
                সংরক্ষণ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-destructive">
            <Wallet className="h-4 w-4" />
            <span className="text-xs font-medium text-muted-foreground">মোট খরচ</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-destructive">{bdt(total)}</p>
        </div>

        {byCategory.length > 0 && (
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-card-foreground">
              খাত অনুযায়ী খরচ
            </h2>
            <div className="space-y-2.5">
              {byCategory.map(([cat, amt]) => {
                const pct = total > 0 ? (amt / total) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-foreground">{cat}</span>
                      <span className="font-semibold text-foreground">{bdt(amt)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">সকল খরচ</h2>
          <ul className="space-y-2.5">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-destructive">
                  <Receipt className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-card-foreground">{e.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.note ? `${e.note} · ` : ''}
                    {bnRelative(e.date)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-destructive">{bdt(e.amount)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Screen>
  )
}
