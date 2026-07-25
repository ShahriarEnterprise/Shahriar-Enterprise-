'use client'

import { useStore } from '@/lib/store'
import { useParams, useRouter } from 'next/navigation'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { transactions, parties } = useStore()

  const transaction = transactions.find((t) => t.id === params.id) || transactions[transactions.length - 1]

  if (!transaction) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">কোনো মেমো পাওয়া যায়নি!</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      </div>
    )
  }

  const party = parties.find((p) => p.id === transaction.partyId)
  const grandTotal = transaction.items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const due = Math.max(0, grandTotal - Number(transaction.paid || 0))

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl my-6 border border-gray-100 print:shadow-none print:border-none">
      {/* ইনভয়েস হেডার */}
      <div className="text-center border-b border-gray-200 pb-4 mb-4">
        <h1 className="text-2xl font-black text-emerald-800">🏬 Shahriar Enterprise</h1>
        <p className="text-xs text-gray-500 mt-0.5">হোলসেল ও পাইকারি ব্যবসা ব্যবস্থাপনা</p>
        <div className="mt-3 inline-block bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
          ক্যাশ মেমো / ইনভয়েস
        </div>
      </div>

      {/* মেমো ইনফো */}
      <div className="flex justify-between text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl">
        <div>
          <p><strong className="text-gray-800">কাস্টমার:</strong> {party?.name || transaction.partyName || 'খুচরা কাস্টমার'}</p>
          <p><strong className="text-gray-800">মোবাইল:</strong> {party?.phone || 'প্রযোজ্য নয়'}</p>
        </div>
        <div className="text-right">
          <p><strong className="text-gray-800">তারিখ:</strong> {new Date(transaction.date || Date.now()).toLocaleDateString('bn-BD')}</p>
          <p><strong className="text-gray-800">মেমো নং:</strong> {transaction.note?.split('|')[0] || '#SE-2026'}</p>
        </div>
      </div>

      {/* পণ্যের টেবিল */}
      <table className="w-full text-xs mb-4 border-collapse">
        <thead>
          <tr className="bg-emerald-800 text-white">
            <th className="p-2 text-left rounded-l-lg">পণ্য বিবরণ</th>
            <th className="p-2 text-center">পরিমাণ</th>
            <th className="p-2 text-right">দর (৳)</th>
            <th className="p-2 text-right rounded-r-lg">মোট (৳)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transaction.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="p-2 font-medium text-gray-800">{item.name}</td>
              <td className="p-2 text-center text-gray-600">{item.qty} {item.unit}</td>
              <td className="p-2 text-right text-gray-600">{item.price}</td>
              <td className="p-2 text-right font-bold text-gray-800">{item.price * item.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* হিসাব-নিকাশ */}
      <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>সর্বমোট মূল্য:</span>
          <span className="font-bold text-gray-800">৳ {grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>নগদ প্রদান:</span>
          <span className="font-bold text-emerald-700">৳ {Number(transaction.paid || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-red-600 border-t border-gray-200 pt-2">
          <span>বকেয়া পরিমাণ:</span>
          <span>৳ {due.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* ফুটার ও সিগনেচার */}
      <div className="mt-8 pt-8 border-t border-dashed border-gray-300 flex justify-between items-center text-xs text-gray-500">
        <p>গ্রাহককে পণ্য বুঝে নেওয়ার অনুরোধ করা হলো।</p>
        <div className="text-center">
          <div className="w-32 border-b border-gray-400 mb-1"></div>
          <p>কর্তৃপক্ষের স্বাক্ষর</p>
        </div>
      </div>

      {/* প্রিন্ট ও ব্যাক বাটন */}
      <div className="mt-6 flex gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-all text-sm flex items-center justify-center gap-2"
        >
          <span>🖨️</span> প্রিন্ট / পিডিএফ ডাউনলোড
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
        >
          হোম
        </button>
      </div>
    </div>
  )
}
