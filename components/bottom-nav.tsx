'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, Users, Plus, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/', label: 'হোম', icon: Home },
  { href: '/products', label: 'স্টক', icon: Package },
  { href: '/parties', label: 'পার্টি', icon: Users },
  { href: '/more', label: 'আরও', icon: LayoutGrid },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-border bg-card px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
      {items.slice(0, 2).map((it) => (
        <NavLink key={it.href} {...it} active={pathname === it.href} />
      ))}

      <Link
        href="/sales/new"
        aria-label="নতুন বিক্রি"
        className="-mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>

      {items.slice(2).map((it) => (
        <NavLink key={it.href} {...it} active={pathname === it.href} />
      ))}
    </nav>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex w-16 flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-medium transition-colors',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
      {label}
    </Link>
  )
}
