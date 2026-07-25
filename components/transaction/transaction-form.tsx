'use client'

import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

interface TransactionFormProps {
  partyId?: string
  onClose?: () => void
  defaultType?: 'বিক্রি' | 'ক্রয়'
}

export default function TransactionForm({ partyId: initialPartyId, onClose, defaultType = 'বিক্রি' }: TransactionFormProps) {
  const { parties, products, addTransaction } = useStore()
  const router = useRouter()

  const [selectedPartyId, setSelectedPartyId] = useState(initialPartyId || parties[0]?.id || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({})
  const [paid, setPaid] = useState<number>(0)
  const [note, setNote] = useState('')

  const memoNo = useMemo(() => {
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    return `#SE-${new Date().getFullYear()}-${randomNum}`
  }, [])

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const currentTime = new Date().toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const selectedParty = parties.find((p) => p.id === selectedPartyId)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleQtyChange = (productId: string, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, qty),
    }))
  }

  const selectedItems = useMemo(() => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const prod = products.find((p) => p.id === productId)
        return {
          productId,
          name: prod?.name || '',
          unit: prod?.unit || 'পিস',
          price: Number(prod?.price || prod?.sellPrice || prod?.buyingPrice || 0),
          qty,
        }
      })
  }, [quantities, products])

  const grandTotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const dueAmount = Math.max(0, grandTotal - Number(paid || 0))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.length === 0) {
      alert('দয়া করে অন্তত একটি পণ্য নির্বাচন করুন!')
      return
    }

    addTransaction({
      type: defaultType,
      partyId: selectedPartyId,
      partyName: selectedParty?.name,
      items: selectedItems,
      paid: Number(paid || 0),
      note: `${memoNo} | ${note}`,
    })

    alert('সফলভাবে মেমো তৈরি এবং অর্ডার সম্পন্ন হয়েছে!')
    if (onClose) onClose()
    router.push(selectedPartyId ? `/parties/${selectedPartyId}` : '/')
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 my-4">
      {/* হেডার সেকশন */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-wide">🏬 Shahriar Enterprise</h2>
            <p className="text-xs text-emerald-200 mt-1">হোলসেল ও পাইকারি ব্যবসা ব্যবস্থাপনা</p>
          </div>
          <div className="text-right bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-semibold text-emerald-100">{memoNo}</p>
            <p className="text-[11px] text-gray-200">📅 {currentDate}</p>
            <p className="text-[11px] text-gray-200">⏰ {currentTime}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* কাস্টমার তথ্য সেকশন */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span>👤</span> কাস্টমারের তথ্য (Customer Details)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">কাস্টমার নির্বাচন</label>
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full p-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              >
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-600 space-y-1 bg-white p-2.5 rounded-lg border border-gray-200">
              <p><strong className="text-gray-700">দোকানের নাম:</strong> {selectedParty?.name || 'প্রযোজ্য নয়'}</p>
              <p><strong className="text-gray-700">মোবাইল:</strong> {selectedParty?.phone || 'নেই'}</p>
              <p><strong className="text-gray-700">ঠিকানা:</strong> {selectedParty?.address || 'নেই'}</p>
            </div>
          </div>
        </div>

        {/* স্টক প্রোডাক্ট ক্যাটালগ ও সার্চ */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span>📦</span> স্টক প্রোডাক্ট ক্যাটালগ (Stock Catalog)
          </h3>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="পণ্য সার্চ করুন (যেমন: চিনি, চাল)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
            />
          </div>

          {/* প্রোডাক্ট লিস্ট */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-4">কোনো পণ্য পাওয়া যায়নি</p>
            ) : (
              filteredProducts.map((prod) => {
                const currentQty = quantities[prod.id] || 0
                const isSelected = currentQty > 0
                const price = Number(prod.price || prod.sellPrice || prod.buyingPrice || 0)

                return (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-emerald-50/60 border-emerald-300 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleQtyChange(prod.id, e.target.checked ? 1 : 0)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{prod.name}</p>
                        <p className="text-xs text-gray-500">
                          স্টক: <span className="font-medium text-gray-700">{prod.stock} {prod.unit}</span> | দর: <span className="font-medium text-emerald-700">৳ {price}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">পরিমাণ:</span>
                      <input
                        type="number"
                        min="0"
                        value={currentQty}
                        onChange={(e) => handleQtyChange(prod.id, Number(e.target.value))}
                        className="w-16 p-1.5 text-center text-sm font-bold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
                      />
                      <span className="text-xs text-gray-500 w-8">{prod.unit}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* হিসাবের সারসংক্ষেপ */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span>📊</span> হিসাবের সারসংক্ষেপ (Summary)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>নির্বাচিত আইটেম সংখ্যা:</span>
              <span className="font-semibold text-gray-800">{selectedItems.length} টি</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 border-t border-gray-200 pt-2">
              <span>সর্বমোট মূল্য (Grand Total):</span>
              <span className="text-emerald-700">৳ {grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-600 font-medium">নগদ প্রদান (টাকা):</span>
              <input
                type="number"
                value={paid || ''}
                onChange={(e) => setPaid(Number(e.target.value))}
                placeholder="০"
                className="w-32 p-2 text-right text-sm font-bold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
              />
            </div>
            <div className="flex justify-between text-sm font-bold text-red-600 border-t border-gray-200 pt-2">
              <span>বর্তমান বকেয়া (Due Amount):</span>
              <span>৳ {dueAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* নোট */}
        <div>
          <input
            type="text"
            placeholder="বিশেষ নোট বা মন্তব্য (ঐচ্ছিক)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
          />
        </div>

        {/* সাবমিট বাটন */}
        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center justify-center gap-2 text-base"
        >
          <span>✓</span> মেমো তৈরি ও প্রিন্ট করুন
        </button>
      </form>
    </div>
  )
}

// উভয় ফরম্যাটের ইম্পোর্ট নিশ্চিত করার জন্য (Fixes Build Import Error)
export { TransactionForm }
