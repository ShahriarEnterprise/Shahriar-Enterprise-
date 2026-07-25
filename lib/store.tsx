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
  { 
    id: 'p1', 
    name: 'তীর সয়াবিন তেল ৫ লিটার', 
    category: 'ভোজ্য তেল', 
    unit: 'কেস', 
    buyingPrice: 820, 
    buyPrice: 820, 
    price: 865, 
    sellPrice: 865, 
    stock: 46, 
    lowStockAlert: 5, 
    createdAt: iso(today) 
  },
  { 
    id: 'p2', 
    name: 'ফ্রেশ চিনি ১ কেজি', 
    category: 'মুদি', 
    unit: 'বস্তা', 
    buyingPrice: 130, 
    buyPrice: 130, 
    price: 140, 
    sellPrice: 140, 
    stock: 8, 
    lowStockAlert: 2, 
    createdAt: iso(today) 
  },
  { 
    id: 'p3', 
    name: 'রূপচাঁদা সরিষার তেল ১ লিটার', 
    category: 'ভোজ্য তেল', 
    unit: 'ডজন', 
    buyingPrice: 180, 
    buyPrice: 180, 
    price: 195, 
    sellPrice: 195, 
    stock: 114, 
    lowStockAlert: 10, 
    createdAt: iso(today) 
  },
  { 
    id: 'p4', 
    name: 'প্রাণ চানাচুর ৩০০ গ্রাম', 
    category: 'স্ন্যাক্স', 
    unit: 'কেস', 
    buyingPrice: 50, 
    buyPrice: 50, 
    price: 60, 
    sellPrice: 60, 
    stock: 210, 
    lowStockAlert: 15, 
    createdAt: iso(today) 
  },
  { 
    id: 'p5', 
    name: 'ইস্পাহানি চা ৪০০ গ্রাম', 
    category: 'পানীয়', 
    unit: 'পিস', 
    buyingPrice: 220, 
    buyPrice: 220, 
    price: 240, 
    sellPrice: 240, 
    stock: 62, 
    lowStockAlert: 10, 
    createdAt: iso(today) 
  },
  { 
    id: 'p6', 
    name: 'ডানো গুঁড়া দুধ ৫০০ গ্রাম', 
    category: 'মুদি', 
    unit: 'পিস', 
    buyingPrice: 450, 
    buyPrice: 450, 
    price: 480, 
    sellPrice: 480, 
    stock: 30, 
    lowStockAlert: 5, 
    createdAt: iso(today) 
  },
]

const seedParties: Party[] = [
  { id: 'c1', name: 'আল-আমীন স্টোর', type: 'কাস্টমার', phone: '01711223344', address: 'নিউমারকেট, ঢাকা', balance: 612500, createdAt: iso(today) },
  { id: 'c2', name: 'ভাই ভাই এন্টারপ্রাইজ', type: 'কাস্টমার', phone: '01811223344', address: 'চকবাজার, চট্টগ্রাম', balance: 0, createdAt: iso(today) },
  { id: 's1', name: 'সিটি গ্রুপ ডিস্ট্রিবিউশন', type: 'সাপ্লায়ার', phone: '01611223344', address: 'তেজগাঁও, ঢাকা', balance: 0, createdAt: iso(today) },
]

const seedTransactions: Transaction[] = [
  { id: 't1', type: 'বিক্রি', partyId: 'c1', partyName: 'আল-আমীন স্টোর', items: [{ productId: 'p3', name: 'রূপচাঁদা সরিষার তেল ১ লিটার', unit: 'ডজন', qty: 6, price: 195 }], total: 1170, paid: 1000, due: 170, date: iso(today) },
]

const seedExpenses: Expense[] = [
  { id: 'e1', category: 'পরিবহন', amount: 1500, date: iso(today), note: 'মাল আনা-বওয়া' },
  { id: 'e2', category: 'দোকান ভাড়া', amount: 12000, date: iso(today) },
]

const seedChalans: Chalan[] = []

const seedEmployees: Employee[] = [
  { id: 'em1', name: 'শাহরিয়ার (মালিক)', phone: '01711223344', role: 'মালিক', active: true },
]

export interface StoreValue {
  products: Product[]
  parties: Party[]
  transactions: Transaction[]
  expenses: Expense[]
  chalans: Chalan[]
  employees: Employee[]
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, p: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addParty: (p: Omit<Party, 'id' | 'balance' | 'createdAt'> & { balance?: number }) => void
  addTransaction: (t: { type: TxnType; partyId: string; items: SaleItem[]; paid: number; note?: string }) => void
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

  const addProduct = useCallback((p: Omit<Product, 'id' | 'createdAt'>) => {
    const pAny = p as any
    const finalPrice = Number(pAny.price ?? pAny.sellPrice ?? 0) || 0
    const finalBuy = Number(pAny.buyingPrice ?? pAny.buyPrice ?? 0) || 0

    const newProd: Product = {
      id: 'prod_' + uid(),
      ...p,
      price: finalPrice,
      sellPrice: finalPrice,
      buyingPrice: finalBuy,
      buyPrice: finalBuy,
      stock: Number(p.stock ?? 0) || 0,
      createdAt: iso(today),
    }
    setProducts((prev) => [newProd, ...prev])
  }, [])

  const updateProduct = useCallback((id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated } as any
          const finalPrice = Number(merged.price ?? merged.sellPrice ?? p.price ?? 0) || 0
          const finalBuy = Number(merged.buyingPrice ?? merged.buyPrice ?? p.buyingPrice ?? 0) || 0
          return {
            ...merged,
            price: finalPrice,
            sellPrice: finalPrice,
            buyingPrice: finalBuy,
            buyPrice: finalBuy,
            stock: Number(merged.stock ?? p.stock ?? 0) || 0,
          }
        }
        return p
      })
    )
  }, [])

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addParty = useCallback((p: Omit<Party, 'id' | 'balance' | 'createdAt'> & { balance?: number }) => {
    const newParty: Party = {
      id: 'party_' + uid(),
      ...p,
      balance: Number(p.balance ?? 0) || 0,
      createdAt: iso(today),
    }
    setParties((prev) => [newParty, ...prev])
  }, [])

  const addTransaction = useCallback(
    ({ type, partyId, items, paid, note }: { type: TxnType; partyId: string; items: SaleItem[]; paid: number; note?: string }) => {
      const total = items.reduce((s, i) => s + (Number(i.price ?? 0) * Number(i.qty ?? 0)), 0)
      const due = Math.max(0, total - Number(paid ?? 0))
      const party = parties.find((p) => p.id === partyId)

      const txn: Transaction = {
        id: 'txn_' + uid(),
        type,
        partyId,
        partyName: party?.name ?? 'অজানা',
        items,
        total,
        paid: Number(paid ?? 0),
        due,
        date: iso(new Date()),
        note,
      }

      setTransactions((prev) => [txn, ...prev])

      setProducts((prev) =>
        prev.map((prod) => {
          const line = items.find((i) => i.productId === prod.id || i.name === prod.name)
          if (!line) return prod
          const qtyChange = Number(line.qty ?? 0)
          const currentStock = Number(prod.stock ?? 0)
          const newStock = type === 'বিক্রি' 
            ? Math.max(0, currentStock - qtyChange) 
            : currentStock + qtyChange
          return { ...prod, stock: newStock }
        })
      )

      setParties((prev) =>
        prev.map((pt) => {
          if (pt.id !== partyId) return pt
          const delta = type === 'বিক্রি' ? due : -Number(paid ?? 0)
          return { ...pt, balance: Number(pt.balance ?? 0) + delta }
        })
      )
    },
    [parties]
  )

  const collectDue = useCallback((partyId: string, amount: number) => {
    setParties((prev) =>
      prev.map((pt) => {
        if (pt.id !== partyId) return pt
        return { ...pt, balance: Math.max(0, Number(pt.balance ?? 0) - Number(amount ?? 0)) }
      })
    )
  }, [])

  const addExpense = useCallback((e: Omit<Expense, 'id' | 'date'> & { date?: string }) => {
    const newExp: Expense = {
      id: 'exp_' + uid(),
      ...e,
      amount: Number(e.amount ?? 0) || 0,
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
    const total = items.reduce((s, i) => s + (Number(i.price ?? 0) * Number(i.qty ?? 0)), 0)
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
      date: iso(today),
    }
    setChalans((prev) => [chalan, ...prev])
  }, [parties])

  const settleChalan = useCallback((id: string, returned: number, collected: number) => {
    setChalans((prev) =>
      prev.map((c) => (c.id === id ? { ...c, returned: Number(returned ?? 0), collected: Number(collected ?? 0), status: 'সম্পন্ন' } : c))
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
