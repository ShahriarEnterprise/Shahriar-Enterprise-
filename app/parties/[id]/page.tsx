'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Phone, MessageSquare, Coins, ArrowDownLeft, ArrowUpRight, ShoppingCart, Gift, Plus, Minus, Search, Trash2, Printer, AlertCircle } from 'lucide-react'
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
  params: { id: string } | Promise<{ id: string }>
}) {
  const [resolvedId, setResolvedId] = useState<string>('')

  useEffect(() => {
    Promise.resolve(params).then((p) => {
      setResolvedId(p?.id)
    })
  }, [params])

  const router = useRouter()
  const store = useStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const parties = Array.isArray(store?.parties) ? store.parties : []
  const transactions = Array.isArray(store?.transactions) ? store.transactions : []
  const products = Array.isArray(store?.products) ? store.products : [
    { id: 'p1', name: 'চিনি (প্রতি বস্তা)', stock: 15, price: 3200 },
    { id: 'p2', name: 'নাজিরশাইল চাল (৫০ কেজি)', stock: 8, price: 3400 },
    { id: 'p3', name: 'চিনির প্যাকেট (১ কেজি)', stock: 0, price: 135 },
    { id: 'p4', name: 'সয়াবিন তেল (৫ লিটার)', stock: 25, price: 850 },
  ]

  const collectDue = store?.collectDue
  const addTransaction = store?.addTransaction
  const updateStock = store?.updateStock

  const [collectOpen, setCollectOpen] = useState(false)
  const [amount, setAmount] = useState('')

  // Multi-item Cart Order Modal State
  const [orderOpen, setOrderOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartItems, setCartItems] = useState<Array<{ id: string, name: string, price: number, qty: number, stock: number }>>([])
  const [cashPaid, setCashPaid] = useState('')
  
  // Memo View State after order
  const [recentOrder, setRecentOrder] = useState<any>(null)
  const [memoModalOpen, setMemoModalOpen] = useState(false)

  if (!mounted || !resolvedId) {
    return (
      <Screen title="লোড হচ্ছে..." back showNav={false}>
        <div className="p-8 text-center text-sm text-muted-foreground">তথ্য লোড হচ্ছে...</div>
      </Screen>
    )
  }

  const party = parties.find((p) => p?.id === resolvedId)
  if (!party) {
    return (
      <Screen title="পাওয়া যায়নি" back showNav={false}>
        <div className="p-8 text-center text-sm text-muted-foreground">কাঙ্ক্ষিত পার্টিটি পাওয়া যায়নি</div>
      </Screen>
    )
  }

  const ledger = transactions.filter((t) => t?.partyId === resolvedId)
  const balance = Number(party.balance ?? 0)
  const owes = balance > 0
  const settled = balance === 0

  const totalSaleAmount = ledger
    .filter((t) => t?.type === 'বিক্রি')
    .reduce((acc, t) => acc + Number(t?.total ?? 0), 0)

  // Reward & Milestone Logic
  let rewardTitle = "শুরু হয়েছে"
  let rewardDesc = "১০,০০০ টাকার মাল নিলে 'রাইস কুকার' উপহার!"
  let progressPercent = Math.min(100, (totalSaleAmount / 100000) * 100)

  if (totalSaleAmount >= 100000) {
    rewardTitle = "🏆 ১ লাখ টাকার মেগা উপহার বিজয়ী!"
    rewardDesc = "অভিনন্দন! আপনি ১ লাখ টাকার মেগা পুরস্কার অর্জন করেছেন।"
  } else if (totalSaleAmount >= 50000) {
    rewardTitle = "🥈 ব্লেন্ডার উপহার অর্জিত!"
    rewardDesc = `পরবর্তী লক্ষ্য: ১,০০,০০০ টাকা (মেগা উপহারের জন্য বাকি ${bdt(Math.max(0, 100000 - totalSaleAmount))})`
  } else if (totalSaleAmount >= 10000) {
    rewardTitle = "🎁 রাইস কুকার উপহার অর্জিত!"
    rewardDesc = `পরবর্তী লক্ষ্য: ৫০,০০০ টাকা (ব্লেন্ডারের জন্য বাকি ${bdt(Math.max(0, 50000 - totalSaleAmount))})`
  } else {
    rewardDesc = `রাইস কুকার পেতে আরও বাকি ${bdt(Math.max(0, 10000 - totalSaleAmount))}`
  }

  function handleCollect() {
    const val = Number(amount) || 0
    if (val > 0 && collectDue && party?.id) {
      collectDue(party.id, val)
    }
    setAmount('')
    setCollectOpen(false)
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (product: any) => {
    const existingIndex = cartItems.findIndex(item => item.id === product.id)
    if (existingIndex > -1) {
      const updated = [...cartItems]
      updated[existingIndex].qty += 1
      setCartItems(updated)
    } else {
      setCartItems([...cartItems, { id: product.id, name: product.name, price: Number(product.price) || 0, qty: 1, stock: Number(product.stock) || 0 }])
    }
    setSearchTerm('')
  }

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta)
        return { ...item, qty: newQty }
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const grandTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const cashNum = Number(cashPaid) || 0
  const calculatedDue = Math.max(0, grandTotal - cashNum)

  const hasStockError = cartItems.some(item => item.qty > item.stock)

  function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault()
    if (cartItems.length === 0 || hasStockError) return

    const newTxn = {
      id: 'txn_' + Date.now(),
      partyId: party.id,
      type: 'বিক্রি',
      date: new Date().toISOString().split('T')[0],
      total: grandTotal,
      cashPaid: cashNum,
      due: calculatedDue,
      items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
    }

    if (addTransaction) {
      addTransaction(newTxn)
    } else {
      transactions.unshift(newTxn)
    }

    cartItems.forEach(item => {
      if (updateStock) {
        updateStock(item.id, item.qty)
      } else {
        const p = products.find(prod => prod.id === item.id)
        if (p) p.stock = Math.max(0, p.stock - item.qty)
      }
    })

    if (party.balance !== undefined) {
      party.balance = Number(party.balance) + calculatedDue
    }

    setRecentOrder({
      ...newTxn,
      partyName: party.name,
      partyPhone: party.phone,
      partyAddress: party.address,
      previousBalance: balance,
      newBalance: Number(balance) + calculatedDue
    })

    setCartItems([])
    setCashPaid('')
    setOrderOpen(false)
    setMemoModalOpen(true)
  }

  const safeBdt = (val: any) => {
    const num = Number(val)
    if (isNaN(num)) return '০ টাকা'
    try { return bdt(num) } catch { return `${num} টাকা` }
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
              <Coins className="h-4 w-4" />
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

      {/* Professional Multi-Item Order Modal */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>নতুন অর্ডার ও মেমো তৈরি (হোলসেল)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            {/* Product Search */}
            <div className="space-y-2">
              <Label>পণ্য সার্চ করে কার্টে যোগ করুন</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="পণ্যের নাম লিখুন (যেমন: চিনি, চাল)..."
                />
              </div>
              {searchTerm && (
                <div className="max-h-36 overflow-y-auto space-y-1 border border-border rounded-xl p-1 bg-muted/50">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddToCart(p)}
                      className="flex items-center justify-between p-2 rounded-lg bg-card hover:bg-secondary cursor-pointer text-xs"
                    >
                      <span className="font-semibold text-foreground">{p.name}</span>
                      <span className="text-primary font-medium">{safeBdt(p.price)} (স্টক: {toBn(p.stock)})</span>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="p-2 text-center text-xs text-muted-foreground">পণ্য পাওয়া যায়নি</p>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items Table */}
            <div className="space-y-2">
              <Label>নির্বাচিত পণ্যসমূহ ({toBn(cartItems.length)} টি)</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item) => {
                  const itemTotal = item.price * item.qty
                  const isOverStock = item.qty > item.stock
                  return (
                    <div key={item.id} className="p-2.5 rounded-xl bg-card border border-border flex flex-col gap-1.5 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">{item.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">দর: {safeBdt(item.price)}</span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCartQty(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold w-6 text-center">{toBn(item.qty)}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCartQty(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">{safeBdt(itemTotal)}</span>
                      </div>
                      {isOverStock && (
                        <p className="text-[10px] text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> স্টকে আছে মাত্র {toBn(item.stock)} টি!
                        </p>
                      )}
                    </div>
                  )
                })}
                {cartItems.length === 0 && (
                  <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                    এখনো কোনো পণ্য যোগ করা হয়নি। ওপর থেকে সার্চ করে যোগ করুন।
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Calculation */}
            {cartItems.length > 0 && (
              <div className="rounded-xl bg-secondary/50 p-3 space-y-2 border border-border text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">সর্বমোট মূল্য:</span>
                  <span className="font-bold text-foreground text-sm">{safeBdt(grandTotal)}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <Label htmlFor="cash-paid" className="text-muted-foreground whitespace-nowrap">নগদ প্রদান (টাকা):</Label>
                  <Input
                    id="cash-paid"
                    inputMode="numeric"
                    className="h-8 w-28 text-right font-bold"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(e.target.value)}
                    placeholder="০"
                  />
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                  <span className="text-destructive">বর্তমান বকেয়া:</span>
                  <span className="text-destructive">{safeBdt(calculatedDue)}</span>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={cartItems.length === 0 || hasStockError}
              >
                {hasStockError ? 'স্টক অপর্যাপ্ত' : 'অর্ডার নিশ্চিত করুন ও মেমো তৈরি করুন'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PDF / Printable Memo Modal */}
      <Dialog open={memoModalOpen} onOpenChange={setMemoModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>ক্যাশ মেমো / ইনভয়েস</span>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {recentOrder && (
            <div id="printable-memo" className="space-y-4 p-4 rounded-xl bg-card border border-border text-xs">
              <div className="text-center border-b border-border pb-3">
                <h2 className="text-base font-bold text-primary">Shahriar Enterprise</h2>
                <p className="text-[11px] text-muted-foreground">Govt. Enlisted ABC Contractor Builders, Suppliers</p>
                <p className="text-[11px] font-semibold mt-1">ক্যাশ মেমো / চালান কপি</p>
              </div>

              <div className="flex justify-between text-[11px]">
                <div>
                  <p><span className="text-muted-foreground">গ্রাহক:</span> <strong className="text-foreground">{recentOrder.partyName}</strong></p>
                  <p><span className="text-muted-foreground">ঠিকানা:</span> {recentOrder.partyAddress || 'প্রযোজ্য নয়'}</p>
                  <p><span className="text-muted-foreground">মোবাইল:</span> {recentOrder.partyPhone}</p>
                </div>
                <div className="text-right">
                  <p><span className="text-muted-foreground">তারিখ:</span> {bnDate(recentOrder.date)}</p>
                  <p><span className="text-muted-foreground">মেমো আইডি:</span> #{recentOrder.id.slice(-6)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-secondary/70 border-b border-border text-foreground">
                      <th className="p-2">পণ্যের নাম</th>
                      <th className="p-2 text-center">পরিমাণ</th>
                      <th className="p-2 text-right">দর</th>
                      <th className="p-2 text-right">মোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrder.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2 text-center">{toBn(item.qty)}</td>
                        <td className="p-2 text-right">{safeBdt(item.price)}</td>
                        <td className="p-2 text-right font-semibold">{safeBdt(item.price * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bill Calculation */}
              <div className="space-y-1.5 pt-2 border-t border-border text-right text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">সর্বমোট বিল:</span>
                  <span className="font-bold">{safeBdt(recentOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">নগদ প্রদান:</span>
                  <span className="font-semibold">{safeBdt(recentOrder.cashPaid)}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>বর্তমান ক্রয়ের বকেয়া:</span>
                  <span className="font-bold">{safeBdt(recentOrder.due)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                  <span>পূর্বের বকেয়া সহ মোট বকেয়া:</span>
                  <span>{safeBdt(recentOrder.newBalance)}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-border text-[10px] text-muted-foreground">
                <p>পণ্য বিক্রয়ের পর ফেরত নেওয়া হয় না। আমাদের সাথে থাকার জন্য ধন্যবাদ।</p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setMemoModalOpen(false)} className="w-full">
              সম্পন্ন করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Screen>
  )
}
