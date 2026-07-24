'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'
import { Screen } from '@/components/screen'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddPartyDialog } from '@/components/parties/add-party-dialog'
import { useStore } from '@/lib/store'
import { bdt } from '@/lib/format'
import type { PartyType } from '@/lib/types'

type Filter = 'সব' | PartyType

const filters: Filter[] = ['সব', 'কাস্টমার', 'সাপ্লায়ার', 'SR/DSR']

export default function PartiesPage() {
  const { parties } = useStore()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('সব')

  const filtered = useMemo(
    () =>
      parties.filter(
        (p) =>
          (filter === 'সব' || p.type === filter) &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.phone.includes(query)),
      ),
    [parties, filter, query],
  )

  const receivable = parties.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0)
  const payable = parties
    .filter((p) => p.balance < 0)
    .reduce((s, p) => s + Math.abs(p.balance), 0)

  return (
    <Screen title="পার্টি খাতা" headerRight={<AddPartyDialog />}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">পাবো (বাকি)</p>
            <p className="mt-1 text-lg font-bold text-primary">{bdt(receivable)}</p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">দিবো</p>
            <p className="mt-1 text-lg font-bold text-destructive">{bdt(payable)}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="bg-card pl-9"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="w-full">
            {filters.map((f) => (
              <TabsTrigger key={f} value={f} className="flex-1 text-xs">
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ul className="space-y-2.5">
          {filtered.map((p) => {
            const owes = p.balance > 0
            const settled = p.balance === 0
            return (
              <li key={p.id}>
                <Link
                  href={`/parties/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm transition-transform active:scale-[0.99]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {p.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-card-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.type}
                      {p.phone && ` · ${p.phone}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        settled
                          ? 'text-muted-foreground'
                          : owes
                            ? 'text-primary'
                            : 'text-destructive'
                      }`}
                    >
                      {settled ? 'পরিশোধিত' : bdt(Math.abs(p.balance))}
                    </p>
                    {!settled && (
                      <p className="text-[11px] text-muted-foreground">
                        {owes ? 'পাবো' : 'দিবো'}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
              কোনো পার্টি পাওয়া যায়নি
            </li>
          )}
        </ul>
      </div>
    </Screen>
  )
}
