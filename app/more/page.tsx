"use client"

import Link from "next/link"
import { Screen } from "@/components/screen"
import { Card } from "@/components/ui/card"
import {
  ShoppingCart,
  Wallet,
  BarChart3,
  Truck,
  Users2,
  Settings,
  Package,
  FileText,
} from "lucide-react"

const groups = [
  {
    title: "লেনদেন",
    items: [
      { href: "/sales/new", label: "নতুন বিক্রি", icon: FileText, tone: "primary" },
      { href: "/purchase/new", label: "নতুন কেনা", icon: ShoppingCart, tone: "muted" },
      { href: "/products", label: "স্টক / পণ্য", icon: Package, tone: "muted" },
    ],
  },
  {
    title: "হিসাব",
    items: [
      { href: "/expenses", label: "খরচের খাতা", icon: Wallet, tone: "destructive" },
      { href: "/reports", label: "লাভ-ক্ষতি রিপোর্ট", icon: BarChart3, tone: "primary" },
      { href: "/parties", label: "পার্টি খাতা", icon: Users2, tone: "muted" },
    ],
  },
  {
    title: "ব্যবস্থাপনা",
    items: [
      { href: "/sr", label: "SR / DSR চালান", icon: Truck, tone: "primary" },
      { href: "/settings", label: "সেটিংস ও এক্সেস", icon: Settings, tone: "muted" },
    ],
  },
]

const toneClass: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

export default function MorePage() {
  return (
    <Screen title="আরও" subtitle="সব ফিচার ও সেটিংস">
      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.title} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">{g.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              {g.items.map((it) => (
                <Link key={it.href} href={it.href}>
                  <Card className="flex h-full flex-col gap-3 p-4 transition-colors active:bg-accent">
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${toneClass[it.tone]}`}
                    >
                      <it.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground text-pretty">
                      {it.label}
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  )
}
