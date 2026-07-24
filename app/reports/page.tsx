"use client"

import { useMemo, type ComponentType } from "react"
import { Screen } from "@/components/screen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { bdt, bnDate } from "@/lib/format"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, ShoppingCart, Wallet, Package } from "lucide-react"

export default function ReportsPage() {
  const { transactions, expenses, products } = useStore()

  const costByProductId = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) map.set(p.id, p.buyPrice)
    return map
  }, [products])

  const stats = useMemo(() => {
    const sales = transactions.filter((t) => t.type === "বিক্রি")
    const purchases = transactions.filter((t) => t.type === "কেনা")
    const totalSales = sales.reduce((s, t) => s + t.total, 0)
    const totalPurchase = purchases.reduce((s, t) => s + t.total, 0)
    const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)
    // gross profit = sale revenue - cost of goods sold (using each product's current buy price)
    const grossProfit = sales.reduce((s, t) => {
      const cost = t.items.reduce(
        (c, i) => c + i.qty * (costByProductId.get(i.productId) ?? i.price),
        0,
      )
      return s + (t.total - cost)
    }, 0)
    const netProfit = grossProfit - totalExpense
    const totalDue = transactions.reduce((s, t) => s + t.due, 0)
    return { totalSales, totalPurchase, totalExpense, grossProfit, netProfit, totalDue }
  }, [transactions, expenses, costByProductId])

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; sale: number; purchase: number; expense: number }>()
    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { month: key, sale: 0, purchase: 0, expense: 0 })
      return map.get(key)!
    }
    for (const t of transactions) {
      const d = new Date(t.date)
      const key = d.toLocaleDateString("bn-BD", { month: "short" })
      const row = ensure(key)
      if (t.type === "বিক্রি") row.sale += t.total
      else row.purchase += t.total
    }
    for (const e of expenses) {
      const d = new Date(e.date)
      const key = d.toLocaleDateString("bn-BD", { month: "short" })
      ensure(key).expense += e.amount
    }
    return Array.from(map.values())
  }, [transactions, expenses])

  return (
    <Screen title="রিপোর্ট" subtitle="লাভ-ক্ষতি ও ব্যবসার হিসাব">
      <div className="space-y-4">
        {/* Net profit hero */}
        <Card className="border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm opacity-90">নিট লাভ (মোট)</p>
            <p className="mt-1 text-3xl font-bold">{bdt(stats.netProfit)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-sm opacity-90">
              {stats.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>গ্রস লাভ {bdt(stats.grossProfit)} − খরচ {bdt(stats.totalExpense)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="মোট বিক্রি" value={bdt(stats.totalSales)} icon={TrendingUp} tone="primary" />
          <StatCard label="মোট কেনা" value={bdt(stats.totalPurchase)} icon={ShoppingCart} tone="muted" />
          <StatCard label="মোট খরচ" value={bdt(stats.totalExpense)} icon={Wallet} tone="destructive" />
          <StatCard label="বাকি আছে" value={bdt(stats.totalDue)} icon={Package} tone="muted" />
        </div>

        {/* Monthly chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">মাসিক তুলনা</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                sale: { label: "বিক্রি", color: "var(--chart-1)" },
                purchase: { label: "কেনা", color: "var(--chart-2)" },
                expense: { label: "খরচ", color: "var(--chart-3)" },
              }}
              className="h-[240px] w-full"
            >
              <BarChart data={monthly}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sale" fill="var(--color-sale)" radius={4} />
                <Bar dataKey="purchase" fill="var(--color-purchase)" radius={4} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          সর্বশেষ হালনাগাদ: {bnDate(new Date().toISOString())}
        </p>
      </div>
    </Screen>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  tone: "primary" | "muted" | "destructive"
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary bg-primary/10"
      : tone === "destructive"
        ? "text-destructive bg-destructive/10"
        : "text-muted-foreground bg-muted"
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  )
}
