'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import {
  Phone,
  MessageSquare,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
} from 'lucide-react'
import { Screen } from '@/components/screen'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { bdt, bnDate, toBn } from '@/lib/format'

export default function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const store = useStore()
  
  const parties = Array.isArray(store?.parties) ? store.parties : []
  const transactions = Array.isArray(store?.transactions) ? store.transactions : []
  const collectDue = store?.collectDue

  const [collectOpen, setCollectOpen] = useState(false)
  const [amount, setAmount] = useState('')

  const party = parties.find((p) => p?.id === id)
  if (!party) notFound()

  const ledger = transactions.filter((t) => t?.partyId === id)
  const balance = party.balance ?? 0
  const owes = balance > 0
  const settled = balance === 0

  const totalSaleAmount = ledger
    .filter((t) => t?.type === 'বিক্রি')
    .reduce((acc, t) => acc + (t?.total ?? 0), 0)

  function handleCollect() {
    const val = Number(amount)
    if (val > 0 && collectDue) {
      collectDue(party!.id, val)
    }
    setAmount('')
    setCollectOpen(false)
  }

  const reminderText = `প্রিয় ${party.name ?? ''}, আমাদের কাছে আপনার ${bdt(
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
            {bdt(Math.abs(balance))}
          </p>
          
          <div className="mt-3 flex justify-around border-t border-border pt-3 text-xs text-muted-foreground">
            <div>
              <span>মোট মাল নেওয়া: </span>
              <span className="font-semibold text-foreground">{bdt(totalSaleAmount)}</span>
            </div>
            {party.address && (
              <div>
                <span>ঠিকানা: </span>
                <span className="font-semibold text-foreground">{party.address}</span>
              </div>
            )}
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
              onClick={() => router.push(`/transactions/new?partyId=${party.id}`)}
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
                        {bdt(t.total ?? 0)}
                      </p>
                      {(t.due ?? 0) > 0 && (
                        <p className="text-[11px] text-destructive">বাকি {bdt(t.due)}</p>
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
    </Screen>
  )
}
