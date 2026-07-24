"use client"

import { useState, type ComponentType } from "react"
import { Screen } from "@/components/screen"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import type { Employee } from "@/lib/types"
import { Plus, Store, ShieldCheck, UserCog, Bell, Globe } from "lucide-react"

const ALL_PERMISSIONS = ["বিক্রি", "কেনা", "স্টক", "পার্টি খাতা", "খরচ", "রিপোর্ট", "সব"]

export default function SettingsPage() {
  const { employees, addEmployee, toggleEmployee } = useStore()

  return (
    <Screen title="সেটিংস ও এক্সেস" subtitle="ব্যবসা, স্টাফ ও অ্যাপ কনফিগ">
      <div className="space-y-6">
        {/* Business profile */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Store className="h-4 w-4" /> ব্যবসার তথ্য
          </h2>
          <Card>
            <CardContent className="space-y-3 p-4">
              <Field label="ব্যবসার নাম" defaultValue="Shahriar Enterprise" />
              <Field label="মালিকের নাম" defaultValue="শাহরিয়ার" />
              <Field label="মোবাইল" defaultValue="01700000000" />
              <Field label="ঠিকানা" defaultValue="মেইন রোড, ঢাকা" />
              <Button className="w-full">তথ্য সংরক্ষণ করুন</Button>
            </CardContent>
          </Card>
        </section>

        {/* Access management */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> এক্সেস ম্যানেজমেন্ট
            </h2>
            <AddStaffDialog onAdd={addEmployee} />
          </div>
          <div className="space-y-3">
            {employees.map((emp) => (
              <StaffCard key={emp.id} emp={emp} onToggle={toggleEmployee} />
            ))}
          </div>
        </section>

        {/* App preferences */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <UserCog className="h-4 w-4" /> অ্যাপ সেটিংস
          </h2>
          <Card>
            <CardContent className="divide-y p-0">
              <ToggleRow icon={Bell} label="বকেয়া রিমাইন্ডার নোটিফিকেশন" defaultChecked />
              <ToggleRow icon={Bell} label="লো-স্টক অ্যালার্ট" defaultChecked />
              <ToggleRow icon={Globe} label="বাংলা সংখ্যা দেখান" defaultChecked />
            </CardContent>
          </Card>
        </section>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          Shahriar Enterprise • সংস্করণ ১.০.০
        </p>
      </div>
    </Screen>
  )
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  )
}

function ToggleRow({
  icon: Icon,
  label,
  defaultChecked,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

function StaffCard({
  emp,
  onToggle,
}: {
  emp: Employee
  onToggle: (id: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-foreground">{emp.name}</p>
            <p className="text-xs text-muted-foreground">
              {emp.role} • {emp.phone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {emp.active ? "সক্রিয়" : "নিষ্ক্রিয়"}
            </span>
            <Switch checked={emp.active} onCheckedChange={() => onToggle(emp.id)} />
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex flex-wrap gap-1.5">
          {emp.permissions.map((p) => (
            <Badge key={p} variant="secondary" className="font-normal">
              {p}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AddStaffDialog({ onAdd }: { onAdd: (e: Omit<Employee, "id">) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<Employee["role"]>("কর্মচারী")
  const [perms, setPerms] = useState<string[]>([])

  const togglePerm = (p: string) =>
    setPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  const submit = () => {
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      role,
      permissions: perms.length ? perms : ["বিক্রি"],
      active: true,
    })
    setName("")
    setPhone("")
    setRole("কর্মচারী")
    setPerms([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" /> স্টাফ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>নতুন স্টাফ যোগ করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>নাম</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="স্টাফের নাম" />
          </div>
          <div className="space-y-1.5">
            <Label>মোবাইল</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label>পদবি</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Employee["role"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="পার্টনার">পার্টনার</SelectItem>
                <SelectItem value="ম্যানেজার">ম্যানেজার</SelectItem>
                <SelectItem value="কর্মচারী">কর্মচারী</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>এক্সেস অনুমতি</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePerm(p)}
                  className={
                    perms.includes(p)
                      ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      : "rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="w-full" disabled={!name.trim()}>
            স্টাফ যোগ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
