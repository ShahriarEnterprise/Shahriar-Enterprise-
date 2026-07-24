'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Chalan,
  Employee,
  Expense,
  Party,
  Product,
  SaleItem,
  Transaction,
  TxnType,
} from './types'

const uid = () => Math.random().toString(36).slice(2, 10)
const today = new Date()
const iso = (d: Date) => d.toISOString()
const daysAgo = (n: number) => iso(new Date(today.getTime() - n * 86400000))

const seedProducts: Product[] = [
  { id: 'p1', name: 'তীর সয়াবিন তেল ৫ লিটার', category: 'ভোজ্য তেল', unit: 'কেস', buyPrice: 820, sellPrice: 865, stock: 46, lowStockAlert: 10, createdAt: daysAgo(40) },
  { id: 'p2', name: 'ফ্রেশ চিনি ১ কেজি', category: 'মুদি', unit: 'বস্তা', buyPrice: 118, sellPrice: 128, stock: 8, lowStockAlert: 15, createdAt: daysAgo(38) },
  { id: 'p3', name: 'রূপচাঁদা সরিষার তেল ১ লিটার', category: 'ভোজ্য তেল', unit: 'ডজন', buyPrice: 195, sellPrice: 215, stock: 120, lowStockAlert: 24, createdAt: daysAgo(30) },
  { id: 'p4', name: 'প্রাণ চানাচুর ৩০০ গ্রাম', category: 'স্ন্যাকস', unit: 'কেস', buyPrice: 45, sellPrice: 55, stock: 210, lowStockAlert: 30, createdAt: daysAgo(25) },
  { id: 'p5', name: 'ইস্পাহানি চা ৪০০ গ্রাম', category: 'পানীয়', unit: 'পিস', buyPrice: 210, sellPrice: 240, stock: 64, lowStockAlert: 20, createdAt: daysAgo(20) },
  { id: 'p6', name: 'ড্যানো গুঁড়া দুধ ৫০০ গ্রাম', category: 'ডেইরি', unit: 'পিস', buyPrice: 375, sellPrice: 410, stock: 5, lowStockAlert: 12, createdAt: daysAgo(15) },
  { id: 'p7', name: 'কোকাকোলা ২৫০ মিলি', category: 'পানীয়', unit: 'কেস', buyPrice: 240, sellPrice: 280, stock: 88, lowStockAlert: 15, createdAt: daysAgo(10) },
  { id: 'p8', name: 'ফ্রেশ আটা ২ কেজি', category: 'মুদি', unit: 'বস্তা', buyPrice: 105, sellPrice: 118, stock: 32, lowStockAlert: 10, createdAt: daysAgo(6) },
]

const seedParties: Party[] = [
  { id: 'c1', name: 'আল-আমিন স্টোর', phone: '01711223344', type: 'কাস্টমার', address: 'নিউমার্কেট, ঢাকা', balance: 12500, createdAt: daysAgo(50) },
  { id: 'c2', name: 'ভাই ভাই এন্টারপ্রাইজ', phone: '01822334455', type: 'কাস্টমার', address: 'মিরপুর ১০', balance: 8200, createdAt: daysAgo(45) },
  { id: 'c3', name: 'মায়ের দোয়া জেনারেল স্টোর', phone: '01933445566', type: 'কাস্টমার', address: 'সাভার', balance: 0, createdAt: daysAgo(40) },
  { id: 's1', name: 'সিটি গ্রুপ ডিস্ট্রিবিউশন', phone: '01611112233', type: 'সাপ্লায়ার', address: 'তেজগাঁও', balance: -45000, createdAt: daysAgo(60) },
  { id: 's2', name: 'প্রাণ-আরএফএল সাপ্লাই', phone: '01599887766', type: 'সাপ্লায়ার', address: 'নারায়ণগঞ্জ', balance: -18000, createdAt: daysAgo(55) },
  { id: 'sr1', name: 'করিম (SR - উত্তর জোন)', phone: '01744556677', type: 'SR/DSR', address: 'উত্তরা', balance: 6500, createdAt: daysAgo(35) },
  { id: 'sr2', name: 'রফিক (DSR - দক্ষিণ জোন)', phone: '01855667788', type: 'SR/DSR', address: 'যাত্রাবাড়ী', balance: 3200, createdAt: daysAgo(30) },
]

const seedTransactions: Transaction[] = [
  { id: 't1', type: 'বিক্রি', partyId: 'c1', partyName: 'আল-আমিন স্টোর', items: [{ productId: 'p1', name: 'তীর সয়াবিন তেল ৫ লিটার', unit: 'কেস', qty: 5, price: 865 }], total: 4325, paid: 2000, due: 2325, date: daysAgo(0), note: 'নগদ আংশিক' },
  { id: 't2', type: 'বিক্রি', partyId: 'c2', partyName: 'ভাই ভাই এন্টারপ্রাইজ', items: [{ productId: 'p4', name: 'প্রাণ চানাচুর ৩০০ গ্রাম', unit: 'কেস', qty: 10, price: 55 }, { productId: 'p7', name: 'কোকাকোলা ২৫০ মিলি', unit: 'কেস', qty: 4, price: 280 }], total: 1670, paid: 1670, due: 0, date: daysAgo(0) },
  { id: 't3', type: 'কেনা', partyId: 's1', partyName: 'সিটি গ্রুপ ডিস্ট্রিবিউশন', items: [{ productId: 'p1', name: 'তীর সয়াবিন তেল ৫ লিটার', unit: 'কেস', qty: 20, price: 820 }], total: 16400, paid: 10000, due: 6400, date: daysAgo(1) },
  { id: 't4', type: 'বিক্রি', partyId: 'c1', partyName: 'আল-আমিন স্টোর', items: [{ productId: 'p3', name: 'রূপচাঁদা সরিষার তেল ১ লিটার', unit: 'ডজন', qty: 6, price: 215 }], total: 1290, paid: 0, due: 1290, date: daysAgo(2) },
  { id: 't5', type: 'বিক্রি', partyId: 'c3', partyName: 'মায়ের দোয়া জেনারেল স্টোর', items: [{ productId: 'p5', name: 'ইস্পাহানি চা ৪০০ গ্রাম', unit: 'পিস', qty: 12, price: 240 }], total: 2880, paid: 2880, due: 0, date: daysAgo(3) },
  { id: 't6', type: 'কেনা', partyId: 's2', partyName: 'প্রাণ-আরএফএল সাপ্লাই', items: [{ productId: 'p4', name: 'প্রাণ চানাচুর ৩০০ গ্রাম', unit: 'কেস', qty: 50, price: 45 }], total: 2250, paid: 2250, due: 0, date: daysAgo(4) },
]

const seedExpenses: Expense[] = [
  { id: 'e1', category: 'পরিবহন', amount: 1200, note: 'ডেলিভারি ভাড়া', date: daysAgo(0) },
  { id: 'e2', category: 'দোকান ভাড়া', amount: 15000, note: 'মাসিক ভাড়া', date: daysAgo(1) },
  { id: 'e3', category: 'বিদ্যুৎ বিল', amount: 2400, date: daysAgo(2) },
  { id: 'e4', category: 'কর্মচারী বেতন', amount: 18000, note: '২ জন', date: daysAgo(3) },
  { id: 'e5', category: 'চা-নাস্তা', amount: 450, date: daysAgo(0) },
]

const seedChalans: Chalan[] = [
  { id: 'ch1', srId: 'sr1', srName: 'করিম (SR - উত্তর জোন)', items: [{ productId: 'p4', name: 'প্রাণ চানাচুর ৩০০ গ্রাম', unit: 'কেস', qty: 30, price: 55 }, { productId: 'p7', name: 'কোকাকোলা ২৫০ মিলি', unit: 'কেস', qty: 15, price: 280 }], total: 5850, returned: 0, collected: 0, status: 'পেন্ডিং', date: daysAgo(0) },
  { id: 'ch2', srId: 'sr2', srName: 'রফিক (DSR - দক্ষিণ জোন)', items: [{ productId: 'p5', name: 'ইস্পাহানি চা ৪০০ গ্রাম', unit: 'পিস', qty: 20, price: 240 }], total: 4800, returned: 800, collected: 3200, status: 'পেন্ডিং', date: daysAgo(1) },
]

const seedEmployees: Employee[] = [
  { id: 'em1', name: 'শাহরিয়ার (মালিক)', phone: '01700000000', role: 'পার্টনার', permissions: ['সব'], active: true },
  { id: 'em2', name: 'জসিম উদ্দিন', phone: '01712345678', role: 'ম্যানেজার', permissions: ['বিক্রি', 'স্টক', 'পার্টি খাতা'], active: true },
  { id: 'em3', name: 'সবুজ মিয়া', phone: '01898765432', role: 'কর্মচারী', permissions: ['বিক্রি'], active: false },
]

interface StoreValue {
  products: Product[]
  parties: Party[]
  transactions: Transaction[]
  expenses: Expense[]
  chalans: Chalan[]
  employees: Employee[]
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addParty: (p: Omit<Party, 'id' | 'createdAt' | 'balance'> & { balance?: number }) => void
  addTransaction: (t: {
    type: TxnType
    partyId: string
    items: SaleItem[]
    paid: number
    note?: string
  }) => void
  collectDue: (partyId: string, amount: number) => void
  addExpense: (e: Omit<Expense, 'id' | 'date'> & { date?: string }) => void
  addEmployee: (e: Omit<Employee, 'id'>) => void
  toggleEmployee: (id: string) => void
  addChalan: (c: { srId: string; items: SaleItem[] }) => void
  settleChalan: (id: string, returned: number, collected: number) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [parties, setParties] = useState<Party[]>(seedParties)
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions)
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses)
  const [chalans, setChalans] = useState<Chalan[]>(seedChalans)
  const [employees, setEmployees] = useState<Employee[]>(seedEmployees)

  const addProduct: StoreValue['addProduct'] = useCallback((p) => {
    setProducts((prev) => [
      { ...p, id: uid(), createdAt: iso(new Date()) },
      ...prev,
    ])
  }, [])

  const updateProduct: StoreValue['updateProduct'] = useCallback((id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deleteProduct: StoreValue['deleteProduct'] = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addParty: StoreValue['addParty'] = useCallback((p) => {
    setParties((prev) => [
      { ...p, balance: p.balance ?? 0, id: uid(), createdAt: iso(new Date()) },
      ...prev,
    ])
  }, [])

  const addTransaction: StoreValue['addTransaction'] = useCallback(
    ({ type, partyId, items, paid, note }) => {
      const total = items.reduce((s, i) => s + i.qty * i.price, 0)
      const due = Math.max(0, total - paid)
      const party = parties.find((p) => p.id === partyId)
      const txn: Transaction = {
        id: uid(),
        type,
        partyId,
        partyName: party?.name ?? 'অজানা',
        items,
        total,
        paid,
        due,
        date: iso(new Date()),
        note,
      }
      setTransactions((prev) => [txn, ...prev])

      // stock update
      setProducts((prev) =>
        prev.map((prod) => {
          const line = items.find((i) => i.productId === prod.id)
          if (!line) return prod
          return {
            ...prod,
            stock: type === 'বিক্রি' ? prod.stock - line.qty : prod.stock + line.qty,
          }
        }),
      )

      // party balance update
      setParties((prev) =>
        prev.map((pt) => {
          if (pt.id !== partyId) return pt
          // sale: customer owes due (balance +). purchase: you owe due (balance -)
          const delta = type === 'বিক্রি' ? due : -due
          return { ...pt, balance: pt.balance + delta }
        }),
      )
    },
    [parties],
  )

  const collectDue: StoreValue['collectDue'] = useCallback((partyId, amount) => {
    setParties((prev) =>
      prev.map((pt) => {
        if (pt.id !== partyId) return pt
        const dir = pt.balance >= 0 ? -1 : 1
        return { ...pt, balance: pt.balance + dir * amount }
      }),
    )
  }, [])

  const addExpense: StoreValue['addExpense'] = useCallback((e) => {
    setExpenses((prev) => [
      { ...e, id: uid(), date: e.date ?? iso(new Date()) },
      ...prev,
    ])
  }, [])

  const addEmployee: StoreValue['addEmployee'] = useCallback((e) => {
    setEmployees((prev) => [{ ...e, id: uid() }, ...prev])
  }, [])

  const toggleEmployee: StoreValue['toggleEmployee'] = useCallback((id) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e)),
    )
  }, [])

  const addChalan: StoreValue['addChalan'] = useCallback(
    ({ srId, items }) => {
      const total = items.reduce((s, i) => s + i.qty * i.price, 0)
      const sr = parties.find((p) => p.id === srId)
      const chalan: Chalan = {
        id: uid(),
        srId,
        srName: sr?.name ?? 'অজানা',
        items,
        total,
        returned: 0,
        collected: 0,
        status: 'পেন্ডিং',
        date: iso(new Date()),
      }
      setChalans((prev) => [chalan, ...prev])
      // reduce stock for handed-over goods
      setProducts((prev) =>
        prev.map((prod) => {
          const line = items.find((i) => i.productId === prod.id)
          return line ? { ...prod, stock: prod.stock - line.qty } : prod
        }),
      )
    },
    [parties],
  )

  const settleChalan: StoreValue['settleChalan'] = useCallback(
    (id, returned, collected) => {
      setChalans((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, returned, collected, status: 'সম্পন্ন' as const }
            : c,
        ),
      )
      // returned goods come back to stock (proportional not tracked; add back count)
      setChalans((prev) => {
        const c = prev.find((x) => x.id === id)
        if (c && returned > 0) {
          // add back returned value's worth is approximate; skip stock detail for demo
        }
        return prev
      })
    },
    [],
  )

  const value = useMemo<StoreValue>(
    () => ({
      products,
      parties,
      transactions,
      expenses,
      chalans,
      employees,
      addProduct,
      updateProduct,
      deleteProduct,
      addParty,
      addTransaction,
      collectDue,
      addExpense,
      addEmployee,
      toggleEmployee,
      addChalan,
      settleChalan,
    }),
    [
      products,
      parties,
      transactions,
      expenses,
      chalans,
      employees,
      addProduct,
      updateProduct,
      deleteProduct,
      addParty,
      addTransaction,
      collectDue,
      addExpense,
      addEmployee,
      toggleEmployee,
      addChalan,
      settleChalan,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
