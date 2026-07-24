'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import type { PartyType } from '@/lib/types'

const types: PartyType[] = ['কাস্টমার', 'সাপ্লায়ার', 'SR/DSR']

export function AddPartyDialog({ defaultType }: { defaultType?: PartyType }) {
  const { addParty } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState<PartyType>(defaultType ?? 'কাস্টমার')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')

  function submit() {
    if (!name.trim()) return
    addParty({
      name: name.trim(),
      phone: phone.trim(),
      type,
      address: address.trim(),
      balance: Number(balance) || 0,
    })
    setName('')
    setPhone('')
    setAddress('')
    setBalance('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          নতুন পার্টি
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>নতুন পার্টি যোগ করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="party-name">নাম</Label>
            <Input
              id="party-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="পার্টির নাম"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="party-phone">মোবাইল</Label>
              <Input
                id="party-phone"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>ধরন</Label>
              <Select value={type} onValueChange={(v) => setType(v as PartyType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="party-address">ঠিকানা</Label>
            <Input
              id="party-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="এলাকা / বাজার"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="party-balance">শুরুর বাকি (৳)</Label>
            <Input
              id="party-balance"
              inputMode="numeric"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
            />
            <p className="text-[11px] text-muted-foreground">
              পার্টি আপনার কাছে বাকি থাকলে ধনাত্মক, আপনি বাকি থাকলে ঋণাত্মক দিন।
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="w-full">
            সংরক্ষণ করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
