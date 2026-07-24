"use client"

import { useMemo, useState } from "react"
import { Screen } from "@/components/screen"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { bdt, bnDate } from "@/lib/format"
import type { Chalan, SaleItem } from "@/lib/types"
import { Plus, Truck, RotateCcw, CheckCircle2, Trash2 } from "lucide-react"

export default function SRPage() {
  const { chalans, parties, products, addChalan, settleChalan } = useStore()
  const srList = parties.filter((p) => p.type === "SR/DSR")

  const pending = chalans.filter((c) => c.status === "পেন্ডিং")
  const done = chalans.filter((c) => c.status === "সম্পন্ন")

  return (
    <Screen
      title="SR / DSR"
      subtitle="মাল হ্যান্ডওভার ও রিটার্ন হিসাব"
      headerRight={<NewChalanDialog srList={srList} products={products} onAdd={addChalan} />}
    >
      <div className="space-y-5">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">চলমান চালান ({pending.length})</h2>
          {pending.length === 0 ? (
            <EmptyState text="কোনো পেন্ডিং চালান নেই" />
          ) : (
            pending.map((c) => (
              <ChalanCard key={c.id} chalan={c} onSettle={settleChalan} />
            ))
          )}
        </section>

        {done.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">সম্পন্ন চালান ({done.length})</h2>
            {done.map((c) => (
              <ChalanCard key={c.id} chalan={c} onSettle={settleChalan} />
            ))}
          </section>
        )}
      </div>
    </Screen>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}

function ChalanCard({
  chalan,
  onSettle,
}: {
  chalan: Chalan
  onSettle: (id: string, returned: number, collected: number) => void
}) {
  const sold = chalan.total - chalan.returned
  const dueField = sold - chalan.collected
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </span>
            <div>
              <p className="font-medium text-foreground">{chalan.srName}</p>
              <p className="text-xs text-muted-foreground">{bnDate(chalan.date)}</p>
            </div>
          </div>
          <Badge variant={chalan.status === "পেন্ডিং" ? "secondary" : "default"}>
            {chalan.status}
          </Badge>
        </div>

        <div className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          {chalan.items.map((it) => (
            <div key={it.productId} className="flex justify-between">
              <span className="text-muted-foreground">
                {it.name} × {it.qty} {it.unit}
              </span>
              <span className="font-medium text-foreground">{bdt(it.qty * it.price)}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-xs text-muted-foreground">হ্যান্ডওভার</p>
            <p className="font-semibold text-foreground">{bdt(chalan.total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">রিটার্ন</p>
            <p className="font-semibold text-foreground">{bdt(chalan.returned)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">আদায়</p>
            <p className="font-semibold text-primary">{bdt(chalan.collected)}</p>
          </div>
        </div>

        {chalan.status === "সম্পন্ন" && dueField > 0 && (
          <p className="mt-2 text-center text-xs text-destructive">
            বকেয়া (SR এর কাছে): {bdt(dueField)}
          </p>
        )}

        {chalan.status === "পেন্ডিং" && (
          <SettleDialog chalan={chalan} onSettle={onSettle} />
        )}
      </CardContent>
    </Card>
  )
}

function SettleDialog({
  chalan,
  onSettle,
}: {
  chalan: Chalan
  onSettle: (id: string, returned: number, collected: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [returned, setReturned] = useState("")
  const [collected, setCollected] = useState("")

  const handle = () => {
    onSettle(chalan.id, Number(returned) || 0, Number(collected) || 0)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full gap-1.5" variant="outline">
          <RotateCcw className="h-4 w-4" /> রিটার্ন ও আদায় হিসাব
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>চালান সেটেলমেন্ট — {chalan.srName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            মোট হ্যান্ডওভার: <span className="font-semibold text-foreground">{bdt(chalan.total)}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="returned">ফেরত মালের মূল্য (রিটার্ন)</Label>
            <Input
              id="returned"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={returned}
              onChange={(e) => setReturned(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="collected">আদায়কৃত টাকা</Label>
            <Input
              id="collected"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={collected}
              onChange={(e) => setCollected(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handle} className="w-full gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> সেটেলমেন্ট সম্পন্ন করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewChalanDialog({
  srList,
  products,
  onAdd,
}: {
  srList: ReturnType<typeof useStore>["parties"]
  products: ReturnType<typeof useStore>["products"]
  onAdd: (c: { srId: string; items: SaleItem[] }) => void
}) {
  const [open, setOpen] = useState(false)
  const [srId, setSrId] = useState("")
  const [lines, setLines] = useState<SaleItem[]>([])

  const addLine = (productId: string) => {
    const p = products.find((x) => x.id === productId)
    if (!p || lines.some((l) => l.productId === productId)) return
    setLines((prev) => [
      ...prev,
      { productId: p.id, name: p.name, unit: p.unit, qty: 1, price: p.sellPrice },
    ])
  }

  const setQty = (id: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.productId === id ? { ...l, qty } : l)))

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.productId !== id))

  const total = useMemo(() => lines.reduce((s, l) => s + l.qty * l.price, 0), [lines])

  const submit = () => {
    if (!srId || lines.length === 0) return
    onAdd({ srId, items: lines })
    setSrId("")
    setLines([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> নতুন চালান
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন মাল হ্যান্ডওভার</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>SR / DSR নির্বাচন করুন</Label>
            <Select value={srId} onValueChange={setSrId}>
              <SelectTrigger>
                <SelectValue placeholder="SR/DSR বাছাই করুন" />
              </SelectTrigger>
              <SelectContent>
                {srList.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>পণ্য যোগ করুন</Label>
            <Select value="" onValueChange={addLine}>
              <SelectTrigger>
                <SelectValue placeholder="পণ্য বাছাই করুন" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (স্টক {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lines.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{bdt(l.price)} / {l.unit}</p>
                  </div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="h-9 w-16"
                    value={l.qty}
                    min={1}
                    onChange={(e) => setQty(l.productId, Number(e.target.value) || 1)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive"
                    onClick={() => removeLine(l.productId)}
                    aria-label="সরান"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-sm font-semibold">
                <span>মোট</span>
                <span>{bdt(total)}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={submit}
            className="w-full"
            disabled={!srId || lines.length === 0}
          >
            হ্যান্ডওভার নিশ্চিত করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
