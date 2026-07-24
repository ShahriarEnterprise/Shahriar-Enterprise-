'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  ShoppingBag,
  Wallet,
  Package,
  Users,
  Truck,
  BarChart3,
  Settings,
} from 'lucide-react'

const actions = [
  { href: '/sales/new', label: 'বিক্রি', icon: ShoppingCart, tone: 'text-primary bg-secondary' },
  { href: '/purchase/new', label: 'কেনা', icon: ShoppingBag, tone: 'text-chart-4 bg-blue-50' },
  { href: '/expenses', label: 'খরচ', icon: Wallet, tone: 'text-destructive bg-red-50' },
  { href: '/products', label: 'স্টক', icon: Package, tone: 'text-chart-2 bg-amber-50' },
  { href: '/parties', label: 'পার্টি খাতা', icon: Users, tone: 'text-primary bg-secondary' },
  { href: '/sr', label: 'SR/DSR', icon: Truck, tone: 'text-chart-4 bg-blue-50' },
  { href: '/reports', label: 'রিপোর্ট', icon: BarChart3, tone: 'text-chart-2 bg-amber-50' },
  { href: '/more', label: 'আরও', icon: Settings, tone: 'text-muted-foreground bg-muted' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(({ href, label, icon: Icon, tone }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-1.5 rounded-xl bg-card p-2.5 text-center shadow-sm transition-transform active:scale-95"
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-[11px] font-medium leading-tight text-card-foreground">
            {label}
          </span>
        </Link>
      ))}
    </div>
  )
}
