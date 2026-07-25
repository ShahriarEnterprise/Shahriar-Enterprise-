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

const uid = () => Math.random().toString(36).substring(2, 9)
const today = new Date()
const iso = (d: Date) => d.toISOString()

const seedProducts: Product[] = [
  { id: 'p1', name: 'তীর সয়াবিন তেল ৫ লিটার', category: 'ভোজ্য তেল', buyingPrice: 820, price: 865, stock: 46, unit: 'কেস' },
  { id: 'p2', name: 'ফ্রেশ চিনি ১ কেজি', category: 'মুদি', buyingPrice: 130, price: 140, stock: 8, unit: 'বস্তা' },
  { id: 'p3', name: 'রূপচাঁদা সরিষার তেল ১ লিটার', category: 'ভোজ্য তেল', buyingPrice: 180, price: 195, stock: 114, unit: 'ডজন' },
  { id: 'p4', name: 'প্রাণ চানাচুর ৩০০ গ্রাম', category: 'স্ন্যাক্স', buyingPrice: 50, price: 60, stock: 210, unit: 'কেস' },
  { id: 'p5', name: 'ইস্পাহানি চা ৪০০ গ্রাম', category: 'পানীয়', buyingPrice: 220, price: 240, stock: 62, unit: 'পিস' },
  { id: 'p6', name: 'ডানো গুঁড়া দুধ ৫০০ গ্রাম', category: 'মুদি', buyingPrice: 450, price: 480, stock: 30, unit: 'পিস' },
  { id: 'p7', name: 'কোসাকোলা ২৫০ মিলি', category: 'পানীয়', buyingPrice: 20, price: 25, stock: 100, unit: 'পিস' },
  { id: 'p8', name: 'ফ্রেশ আটা ২ কেজি', category: 'মুদি', buyingPrice: 110, price: 125, stock: 50, unit: 'বস্তা' },
]

const seedParties: Party[] = [
  { id: 'c1', name: 'আল-আমীন স্টোর', type: 'কাস্টমার', phone: '01711223344', address: 'নিউমারকেট, ঢাকা', balance: 612500 },
  { id: 'c2', name: 'ভাই ভাই এন্টারপ্রাইজ', type: 'কাস্টমার', phone: '01811223344', address: 'চকবাজার, চট্টগ্রাম', balance: 0 },
  { id: 'c3', name: 'মায়ের দোয়া জেনারেল স্টোর', type: 'কাস্টমার', phone: '01911223344', address: 'খুলনা সদর', balance: 15000 },
  { id: 's1', name: 'সিটি গ্রুপ ডিস্ট্রিবিউশন', type: 'সাপ্লায়ার', phone: '01611223344', address: 'তেজগাঁও, ঢাকা', balance: 0 },
  { id: 's2', name: 'প্রাণ-আরএফএল সাপ্লাই', type: 'সাপ্লায়ার', phone: '01511223344', address: 'বাড্ডা, ঢাকা', balance: 0 },
  { id: 'sr1', name: 'করিম (SR - উত্তর জোন)', type: 'এসআর', phone: '01700000001' },
  { id: 'sr2', name: 'রফিক (DSR - দক্ষিণ জোন)', type: 'এসআর', phone: '01700000002' },
]

const seedTransactions: Transaction[] = [
  { id: 't1', type: 'বিক্রি', partyId: 'c1', partyName: 'আল-আমীন স্টোর', items: [{ name: 'রূপচাঁদা সরিষার তেল ১ লিটার', qty: 6, price: 195 }], total: 1170, paid: 1000, due: 170, date: iso(today) },
]

const seedExpenses: Expense[] = [
  { id: 'e1', category: 'পরিবহন', amount: 1500, date: iso(today), note: 'মাল আনা-বওয়া' },
  { id: 'e2', category: 'দোকান ভাড়া', amount: 12000, date: iso(today) },
  { id: 'e3', category: 'বিদ্যুৎ বিল', amount: 2500, date: iso(today) },
  { id: 'e4', category: 'কর্মচারী বেতন', amount: 25000, date: iso(today) },
  { id: 'e5', category: 'চা-নাস্তা', amount: 300, date: iso(today) },
]

const seedChalans: Chalan[] = [
  { id: 'ch1', srId: 'sr1', srName: 'করিম', items: [], total: 0, returned: 0, collected: 0, status: 'পেন্ডিং', date: iso(today) }
]

const seedEmployees: Employee[] = [
  { id: 'em1', name: 'শাহরিয়ার (মালিক)', phone: '01711223344', role: 'মালিক', active: true },
  { id: 'em2', name: 'জসিম উদ্দিন', phone: '01811223344', role: 'স্টাফ', active: true },
  { id: 'em3', name: 'সবুজ মিয়া', phone: '01911223344', role: 'ডেলিভারি', active: true },
]

export interface StoreValue {
  products: Product[]
  parties: Party[]
  transactions: Transaction[]
  expenses: Expense[]
  chalans: Chalan[]
  employees: Employee[]
  addProduct: (p: Omit<Product, 'id'>) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addParty: (p: Omit<Party, 'id' | 'balance'> & { balance?: number }) => void
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

  const addProduct = useCallback((p: Omit<Product, 'id'>) => {
    const newProd: Product = {
      id: 'prod_' + uid(),
      ...p,
      price: Number(p.price ?? (p as any).sellingPrice ?? 150),
      stock: Number(p.stock ?? 10),
    }
    setProducts((prev) => [newProd, ...prev])
  }, [])

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated }
          return {
            ...merged,
            price: Number(merged.price ?? (merged as any).sellingPrice ?? p.price ?? 150),
            stock: Number(merged.stock ?? p.stock ?? 10),
          }
        }
        return p
      })
    )
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addParty = useCallback((p: Omit<Party, 'id' | 'balance'> & { balance?: number }) => {
    const newParty: Party = {
      id: 'party_' + uid(),
      ...p,
      balance: Number(p.balance ?? 0),
    }
    setParties((prev) => [newParty, ...prev])
  }, [])

  const addTransaction = useCallback(
    ({ type, partyId, items, paid, note }: { type: TxnType; partyId: string; items: SaleItem[]; paid: number; note?: string }) => {
      const total = items.reduce((s, i) => s + Number(i.price ?? 0) * Number(i.qty ?? 0), 0)
      const due = Math.max(0, total - paid)
      const party = parties.find((p) => p.id === partyId)

      const txn: Transaction = {
        id: 'txn_' + uid(),
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

      setProducts((prev) =>
        prev.map((prod) => {
          const line = items.find((i) => i.name === prod.name)
          if (!line) return prod
          const qtyChange = Number(line.qty ?? 0)
          const newStock = type === 'বিক্রি' 
            ? Math.max(0, prod.stock - qtyChange) 
            : prod.stock + qtyChange
          return { ...prod, stock: newStock }
        })
      )

      setParties((prev) =>
        prev.map((pt) => {
          if (pt.id !== partyId) return pt
          const delta = type === 'বিক্রি' ? due : -paid
          return { ...pt, balance: pt.balance + delta }
        })
      )
    },
    [parties]
  )

  const collectDue = useCallback((partyId: string, amount: number) => {
    setParties((prev) =>
      prev.map((pt) => {
        if (pt.id !== partyId) return pt
        return { ...pt, balance: Math.max(0, pt.balance - amount) }
      })
    )
  }, [])

  const addExpense = useCallback((e: Omit<Expense, 'id' | 'date'> & { date?: string }) => {
    const newExp: Expense = {
      id: 'exp_' + uid(),
      ...e,
      date: e.date ?? iso(new Date()),
    }
    setExpenses((prev) => [newExp, ...prev])
  }, [])

  const addEmployee = useCallback((e: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      id: 'emp_' + uid(),
      ...e,
    }
    setEmployees((prev) => [newEmp, ...prev])
  }, [])

  const toggleEmployee = useCallback((id: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: !e.active } : e))
    )
  }, [])

  const addChalan = useCallback(({ srId, items }: { srId: string; items: SaleItem[] }) => {
    const total = items.reduce((s, i) => s + Number(i.price ?? 0) * Number(i.qty ?? 0), 0)
    const sr = parties.find((p) => p.id === srId)
    const chalan: Chalan = {
      id: 'ch_' + uid(),
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

    setProducts((prev) =>
      prev.map((prod) => {
        const line = items.find((i) => i.name === prod.name)
        if (!line) return prod
        return { ...prod, stock: Math.max(0, prod.stock - Number(line.qty ?? 0)) }
      })
    )
  }, [parties])

  const settleChalan = useCallback((id: string, returned: number, collected: number) => {
    setChalans((prev) =>
      prev.map((c) => (c.id === id ? { ...c, returned, collected, status: 'সম্পন্ন' } : c))
    )
  }, [])

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
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within a StoreProvider')
  return ctx
}
