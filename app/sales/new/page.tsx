'use client'

import TransactionForm from '@/components/transaction/transaction-form'

export default function NewSalePage() {
  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <TransactionForm defaultType="বিক্রি" />
    </div>
  )
}
