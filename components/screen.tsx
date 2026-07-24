'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { BottomNav } from './bottom-nav'
import { cn } from '@/lib/utils'

export function Screen({
  title,
  subtitle,
  back,
  headerRight,
  showNav = true,
  headerTone = 'default',
  children,
}: {
  title: string
  subtitle?: string
  back?: boolean
  headerRight?: ReactNode
  showNav?: boolean
  headerTone?: 'default' | 'primary'
  children: ReactNode
}) {
  const router = useRouter()
  const primary = headerTone === 'primary'

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted">
      <header
        className={cn(
          'sticky top-0 z-30 flex items-center gap-3 px-4 py-3.5',
          primary
            ? 'bg-primary text-primary-foreground'
            : 'border-b border-border bg-card text-card-foreground',
        )}
      >
        {back && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="ফিরে যান"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
              primary ? 'hover:bg-white/15' : 'hover:bg-muted',
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight text-balance">
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                'truncate text-xs',
                primary ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {headerRight}
      </header>

      <main className={cn('flex-1 px-4 py-4', showNav && 'pb-28')}>{children}</main>

      {showNav && <BottomNav />}
    </div>
  )
}
