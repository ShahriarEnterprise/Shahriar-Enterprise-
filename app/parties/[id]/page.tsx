'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Phone, MessageSquare, HandCoins, ArrowDownLeft, ArrowUpRight, ShoppingCart, Gift, Award } from 'lucide-react'
import { Screen } from '@/components/screen'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { bdt, bnDate, toBn } from '@/lib/format'

export default function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = params && typeof (params as any).then === 'function' 
    ? use(params as Promise<{ id: string }>) 
    : (params as { id: string })
  
  const id = resolvedParams?.id

  const router = useRouter()
  const store = useStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const parties = Array.isArray(store?.parties) ? store.parties : []
  const transactions = Array.isArray(store?.transactions) ? store.transactions : []
  const collectDue = store?.collectDue
  const addTransaction = store?.addTransaction

  const [collectOpen, setCollectOpen] = useState(false)
  const [amount, setAmount] = useState('')

  // New Order Modal state
  const [orderOpen, setOrderOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [itemTotal, setItemTotal] = useState('')
  const [itemDue, setItemDue] = useState('')

  if (!mounted) {
    return (
      <Screen title="লোড হচ্ছে..." back showNav={false}>
        <div className="p-8 text-center text-sm text-muted-foreground">তথ্য লোড হচ্ছে...</div>
      </Screen>
    )
  }

  const party = parties.find((p) => p?.id === id)
  if (!party) {
    return (
      <Screen title="পাওয়া যায়নি" back showNav={false}>
        <div className="p-8 text-center text-sm text-muted-foreground">কাঙ্ক্ষিত পার্টিটি পাওয়া যায়নি</div>
      </Screen>
    )
  }

  const ledger = transactions.filter((t) => t?.partyId === id)
  const balance = party.balance ?? 0
  const owes = balance > 0
  const settled = balance === 0

  const totalSaleAmount = ledger
    .filter((t) => t?.type === 'বিক্রি')
    .reduce((acc, t) => acc + (t?.total ?? 0), 0)

  // Reward & Milestone Logic
  let rewardTitle = "শুরু হয়েছে"
  let rewardDesc = "১০,০০০ টাকার মাল নিলে 'রাইস কুকার' উপহার!"
  let progressPercent = Math.min(100, (totalSaleAmount / 100000) * 100)

  if (totalSaleAmount >= 100000) {
    rewardTitle = "🏆 ১ লাখ টাকার মেগা উপহার বিজয়ী!"
    rewardDesc = "অভিনন্দন! আপনি ১ লাখ টাকার মেগা পুরস্কার অর্জন করেছেন।"
  } else if (totalSaleAmount >= 50000) {
    rewardTitle = "🥈 ব্লেন্ডার উপহার অর্জিত!"
    rewardDesc = `পরবর্তী লক্ষ্য: ১,০০,০০০ টাকা (মেগা উপহারের জন্য বাকি ${bdt(100000 - totalSaleAmount)})`
  } else if (totalSaleAmount >= 10000) {
    rewardTitle = "🎁 রাইস কুকার উপহার অর্জিত!"
    rewardDesc = `পরবর্তী লক্ষ্য: ৫০,০০০ টাকা (ব্লেন্ডারের জন্য বাকি ${bdt(50000 - totalSaleAmount)})`
  } else {
    rewardDesc = `রাইস কুকার পেতে আরও বাকি ${bdt(10000 - totalSaleAmount)}`
  }

  function handleCollect() {
    const val = Number(amount)
    if (val > 0 && collectDue && party?.id) {
      collectDue(party.id, val)
    }
    setAmount('')
    setCollectOpen(false)
  }

  function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    const totalVal = Number(itemTotal) || 0
    const dueVal = Number(itemDue) || 0
    const qtyVal = Number(itemQty) || 1

    if (totalVal > 0) {
      const newTxn = {
        id: 'txn_' + Date.now(),
        partyId: party.id,
        type: 'বিক্রি',
        date: new Date().toISOString().split('T')[0],
        total: totalVal,
        due: dueVal,
        items: [{ name: itemName || 'সাধারণ পণ্য', qty: qtyVal, price: totalVal / qtyVal }]
      }

      if (addTransaction) {
        addTransaction(newTxn)
      } else {
        // Fallback if store method name differs
        transactions.unshift(newTxn)
      }
    }

    setItemName('')
    setItemQty('1')
    setItemTotal('')
    setItemDue('')
    setOrderOpen(false)
  }

  const safeBdt = (val: any) => {
    try { return bdt(val ?? 0) } catch { return `${val ?? 0} টাকা` }
  }

  const reminderText = `প্রিয় ${party.name ?? ''}, আমাদের কাছে আপনার ${safeBdt(
    Math.abs(balance),
  )} টাকা বাকি রয়েছে। অনুগ্রহ করে পরিশোধ করুন। — Shahriar Enterprise`

  return (
    <Screen title={party.name ?? 'পার্টি'} subtitle={party.type ?? ''} back showNav={false}>
      <div className="space-y-4">
        {/* Balance & Stats hero */}
        <div className="rounded-2xl bg-card p-5 text-center shadow-sm">
          <p className="text-xs text-muted-foreground">
            {settled ? 'কোনো বাকি নেই' : owes ? 'পার্টির কাছে পাবো' : 'পার্টিকে দিবো'}
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              settled ? 'text-foreground' : owes ? 'text-primary' : 'text-destructive'
            }`}
          >
            {safeBdt(Math.abs(balance))}
          </p>
          
          <div className="mt-3 flex justify-around border-t border-border pt-3 text-xs text-muted-foreground">
            <div>
              <span>মোট মাল নেওয়া: </span>
              <span className="font-semibold text-foreground">{safeBdt(totalSaleAmount)}</span>
            </div>
            {party.address && (
              <div>
                <span>ঠিকানা: </span>
                <span className="font-semibold text-foreground">{party.address}</span>
              </div>
            )}
          </div>

          {/* Reward & Gift Tracker Box */}
          <div className="mt-4 rounded-xl bg-secondary/50 p-3 text-left border border-border">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <Gift className="h-4 w-4" />
              <span>উপহার ও রিওয়ার্ড স্ট্যাটাস:</span>
            </div>
            <p className="text-sm font-bold text-foreground">{rewardTitle}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{rewardDesc}</p>
            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <Button
              variant="secondary"
              className="flex-col gap-1 h-auto py-2.5 px-1"
              asChild
            >
              <a href={`tel:${party.phone ?? ''}`}>
                <Phone className="h-4 w-4" />
                <span className="text-[11px]">কল</span>
              </a>
            </Button>
            <Button
              variant="secondary"
              className="flex-col gap-1 h-auto py-2.5 px-1"
              asChild
            >
              <a
                href={`sms:${party.phone ?? ''}?body=${encodeURIComponent(reminderText)}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-[11px]">তাগাদা</span>
              </a>
            </Button>
            <Button
              variant="secondary"
              className="flex-col gap-1 h-auto py-2.5 px-1"
              onClick={() => setCollectOpen(true)}
            >
              <HandCoins className="h-4 w-4" />
              <span className="text-[11px]">আদায়</span>
            </Button>
            <Button
              className="flex-col gap-1 h-auto py-2.5 px-1"
              onClick={() => setOrderOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-[11px]">নতুন অর্ডার</span>
            </Button>
          </div>
        </div>

        {/* Ledger */}
        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            লেনদেনের খতিয়ান ও মেমোসমূহ
          </h2>
          <ul className="space-y-2.5">
            {ledger.map((t) => {
              if (!t) return null
              const sale = t.type === 'বিক্রি'
              const txnItems = Array.isArray(t.items) ? t.items : []
              return (
                <li key={t.id ?? Math.random()} className="rounded-2xl bg-card p-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        sale ? 'bg-secondary text-primary' : 'bg-blue-50 text-chart-4'
                      }`}
                    >
                      {sale ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        {t.type ?? 'লেনদেন'} · {toBn(txnItems.length)} আইটেম
                      </p>
                      <p className="text-xs text-muted-foreground">{bnDate(t.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-card-foreground">
                        {safeBdt(t.total ?? 0)}
                      </p>
                      {(t.due ?? 0) > 0 && (
                        <p className="text-[11px] text-destructive">বাকি {safeBdt(t.due)}</p>
                      )}
                    </div>
                  </div>
                  {txnItems.length > 0 && (
                    <p className="mt-2 truncate border-t border-border pt-2 text-xs text-muted-foreground">
                      {txnItems.map((i) => `${i?.name ?? ''} (${toBn(i?.qty ?? 0)})`).join(', ')}
                    </p>
                  )}
                </li>
              )
            })}
            {ledger.length === 0 && (
              <li className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
                এখনো কোনো লেনদেন বা মেমো নেই
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Collect Due Modal */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>বাকি আদায়</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="collect-amount">টাকার পরিমাণ</Label>
            <Input
              id="collect-amount"
              inputMode="numeric"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCollect} className="w-full">
              জমা করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Order Modal */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>নতুন অর্ডার / বিক্রি</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="item-name">পণ্যের নাম</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="যেমন: সয়াবিন তেল / চাল"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-qty">পরিমাণ</Label>
              <Input
                id="item-qty"
                type="number"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                placeholder="১"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-total">মোট মূল্য (টাকা)</Label>
              <Input
                id="item-total"
                inputMode="numeric"
                value={itemTotal}
                onChange={(e) => setItemTotal(e.target.value)}
                placeholder="০"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="item-due">বাকি টাকা (যদি থাকে)</Label>
              <Input
                id="item-due"
                inputMode="numeric"
                value={itemDue}
                onChange={(e) => setItemDue(e.target.value)}
                placeholder="০"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full">
                অর্ডার নিশ্চিত করুন
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Screen>
  )
}
