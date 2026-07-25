'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { bdt, bnRelative, toBn } from '@/lib/format'
import { QuickActions } from '@/components/home/quick-actions'
import { BottomNav } from '@/components/bottom-nav'

function isToday(iso: string) {
  const d = new Date(iso)
  const n = new Date()
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  )
}

export default function HomePage() {
  const { products, parties, transactions, expenses } = useStore()

  const todaySales = transactions
    .filter((t) => t.type === 'বিক্রি' && isToday(t.date))
    .reduce((s, t) => s + t.total, 0)
  const todayPurchase = transactions
    .filter((t) => t.type === 'কেনা' && isToday(t.date))
    .reduce((s, t) => s + t.total, 0)
  const todayExpense = expenses
    .filter((e) => isToday(e.date))
    .reduce((s, e) => s + e.amount, 0)

  const receivable = parties
    .filter((p) => p.balance > 0)
    .reduce((s, p) => s + p.balance, 0)
  const payable = parties
    .filter((p) => p.balance < 0)
    .reduce((s, p) => s + Math.abs(p.balance), 0)

  const stockValue = products.reduce((s, p) => s + p.stock * p.buyPrice, 0)
  const lowStock = products.filter((p) => p.stock <= p.lowStockAlert)

  const recent = transactions.slice(0, 5)

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted">
      {/* Header + hero */}
      <div className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-4 pb-16 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">স্বাগতম</p>
            <h1 className="text-lg font-semibold text-[#D4AF37]">Shahriar Enterprise</h1>
          </div>
          <Link
            href="/more"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0A0A] border border-[#D4AF37]/60 overflow-hidden shadow-md shadow-[#D4AF37]/20"
          >
            <img src="/icon.svg" alt="Logo" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>

      <div className="-mt-12 flex-1 space-y-4 px-4 pb-28">
        {/* Balance card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-primary">
              <ArrowDownLeft className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                মোট বাকি আদায়যোগ্য
              </span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-primary">{bdt(receivable)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-destructive">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium text-muted-foreground">
                মোট পরিশোধযোগ্য
              </span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-destructive">{bdt(payable)}</p>
          </div>
        </div>

        {/* Today summary */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">আজকের হিসাব</h2>
            <span className="text-xs text-muted-foreground">আজ</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-secondary py-3">
              <TrendingUp className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-sm font-bold text-card-foreground">{bdt(todaySales)}</p>
              <p className="text-[11px] text-muted-foreground">বিক্রি</p>
            </div>
            <div className="rounded-xl bg-blue-50 py-3">
              <TrendingDown className="mx-auto h-5 w-5 text-chart-4" />
              <p className="mt-1 text-sm font-bold text-card-foreground">{bdt(todayPurchase)}</p>
              <p className="text-[11px] text-muted-foreground">কেনা</p>
            </div>
            <div className="rounded-xl bg-red-50 py-3">
              <TrendingDown className="mx-auto h-5 w-5 text-destructive" />
              <p className="mt-1 text-sm font-bold text-card-foreground">{bdt(todayExpense)}</p>
              <p className="text-[11px] text-muted-foreground">খরচ</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">দ্রুত অ্যাকশন</h2>
          <QuickActions />
        </div>

        {/* Stock value + low stock */}
        <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground">বর্তমান স্টক মূল্য</p>
            <p className="text-lg font-bold text-card-foreground">{bdt(stockValue)}</p>
          </div>
          <Link
            href="/products"
            className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary"
          >
            স্টক দেখুন
          </Link>
        </div>

        {lowStock.length > 0 && (
          <Link
            href="/products"
            className="flex items-center gap-3 rounded-2xl border border-chart-2/30 bg-amber-50 p-3.5"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-chart-2" />
            <p className="flex-1 text-xs font-medium text-foreground">
              {toBn(lowStock.length)}টি পণ্যের স্টক কমে গেছে — শীঘ্রই রিস্টক করুন
            </p>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}

        {/* Recent transactions */}
        <div className="rounded-2xl bg-card shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 className="text-sm font-semibold text-card-foreground">সাম্প্রতিক লেনদেন</h2>
            <Link href="/reports" className="text-xs font-medium text-primary">
              সব দেখুন
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {recent.map((t) => {
              const sale = t.type === 'বিক্রি'
              return (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
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
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {t.partyName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.type} · {bnRelative(t.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-card-foreground">{bdt(t.total)}</p>
                    {t.due > 0 && (
                      <p className="text-[11px] text-destructive">বাকি {bdt(t.due)}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
