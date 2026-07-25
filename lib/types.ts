export type Unit = 'পিস' | 'ডজন' | 'কেস' | 'কেজি' | 'বস্তা'

export type PartyType = 'কাস্টমার' | 'সাপ্লায়ার' | 'SR/DSR'

export type TxnType = 'বিক্রি' | 'কেনা'

export interface Product {
  id: string
  name: string
  category: string
  unit: Unit
  buyPrice: number
  sellPrice: number
  stock: number
  lowStockAlert: number
  createdAt: string
}

export interface Party {
  id: string
  name: string
  phone: string
  type: PartyType
  address?: string
  /** positive = party owes you (বাকি/receivable), negative = you owe party */
  balance: number
  createdAt: string
}

export interface SaleItem {
  productId: string
  name: string
  unit: Unit
  qty: number
  price: number
}

export interface Transaction {
  id: string
  type: TxnType
  partyId: string
  partyName: string
  items: SaleItem[]
  total: number
  paid: number
  due: number
  date: string
  note?: string
}

export interface Expense {
  id: string
  category: string
  amount: number
  date: string
  note?: string
}

export interface Chalan {
  id: string
  srId: string
  srName: string
  items: SaleItem[]
  total: number
  returned: number
  collected: number
  status: 'পেন্ডিং' | 'সম্পন্ন'
  date: string
}

export interface Employee {
  id: string
  name: string
  phone: string
  role: 'মালিক' | 'পার্টনার' | 'ম্যানেজার' | 'কর্মচারী' | 'স্টাফ' | 'ডেলিভারি'
  permissions?: string[]
  active: boolean
}
