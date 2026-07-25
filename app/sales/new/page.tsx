'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Party, TransactionItem } from '@/lib/types';
import { bdt, toBn } from '@/lib/format';
import { ShoppingCart, Search, CheckCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [cart, setCart] = useState<(TransactionItem & { name: string; unit: string })[]>([]);
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, partyRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('parties').select('*').eq('type', 'customer').order('name'),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (partyRes.error) throw partyRes.error;

      setProducts(prodRes.data || []);
      setParties(partyRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error.message);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product_id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          unit: product.unit,
          quantity: 1,
          unit_price: product.selling_price,
          total: product.selling_price,
        },
      ]);
    }
  };

  const updateQuantity = (product_id: string, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.product_id !== product_id));
    } else {
      setCart(
        cart.map((item) =>
          item.product_id === product_id
            ? { ...item, quantity: qty, total: qty * item.unit_price }
            : item
        )
      );
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const parsedPaid = parseFloat(paidAmount) || 0;
  const paymentStatus = parsedPaid >= totalAmount ? 'completed' : parsedPaid > 0 ? 'partial' : 'pending';

  const handleCheckout = async () => {
    if (!selectedPartyId) {
      alert('দয়া করে একজন কাস্টমার সিলেক্ট করুন।');
      return;
    }
    if (cart.length === 0) {
      alert('কার্টে কোনো পণ্য নেই।');
      return;
    }

    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const userId = userData.user.id;

      // 1. Insert Transaction
      const { data: txnData, error: txnError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            party_id: selectedPartyId,
            type: 'sale',
            total_amount: totalAmount,
            paid_amount: parsedPaid,
            payment_status: paymentStatus,
            notes,
          },
        ])
        .select()
        .single();

      if (txnError) throw txnError;

      // 2. Update Stock Quantities
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) {
          const newStock = prod.current_stock - item.quantity;
          await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', prod.id);
        }
      }

      // 3. Update Party Balance & Insert Ledger Entry
      const dueAmount = totalAmount - parsedPaid;
      const targetParty = parties.find((p) => p.id === selectedPartyId);
      if (targetParty) {
        const newBalance = targetParty.balance + dueAmount;
        await supabase
          .from('parties')
          .update({ balance: newBalance })
          .eq('id', selectedPartyId);

        await supabase.from('ledger_entries').insert([
          {
            user_id: userId,
            party_id: selectedPartyId,
            transaction_id: txnData.id,
            type: 'debit',
            amount: totalAmount,
            balance: newBalance,
            description: `পাইকারি বিক্রয় চালান (Invoice #${txnData.id.slice(-6)})`,
          },
        ]);
      }

      alert('বিক্রয় সফলভাবে সম্পন্ন হয়েছে!');
      setCart([]);
      setSelectedPartyId('');
      setPaidAmount('');
      setNotes('');
      fetchData();
    } catch (error: any) {
      alert('বিক্রয়ে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted pb-24">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-4 py-5 text-white flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#D4AF37]">পাইকারি বিক্রয় (Sales)</h1>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Customer Select */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">গ্রাহক নির্বাচন করুন</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none text-card-foreground shadow-sm"
          >
            <option value="">-- কাস্টমার বা দোকান সিলেক্ট করুন --</option>
            {parties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Summary */}
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border space-y-3">
          <h2 className="text-sm font-bold text-card-foreground flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-[#D4AF37]" /> নির্বাচিত পণ্যসমূহ ({toBn(cart.length)})
          </h2>
          {cart.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">নিচের তালিকা থেকে পণ্য যোগ করুন</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between gap-2 border-b border-border pb-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-card-foreground truncate">{item.name}</p>
                    <p className="text-muted-foreground">
                      ৳{item.unit_price} × {toBn(item.quantity)} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{bdt(item.total)}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="h-6 w-6 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-semibold">{toBn(item.quantity)}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="h-6 w-6 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between font-bold">
              <span>মোট পরিমাণ:</span>
              <span className="text-primary">{bdt(totalAmount)}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="প্রদত্ত টাকা (Paid amount)"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none text-card-foreground"
              />
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-xl bg-[#D4AF37] py-3 text-xs font-bold text-black shadow-md hover:bg-[#c49f30] transition disabled:opacity-50"
          >
            {loading ? 'প্রসেসিং হচ্ছে...' : 'বিক্রয় নিশ্চিত করুন ও চালান তৈরি করুন'}
          </button>
        </div>

        {/* Product Selection List */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="পণ্য সার্চ করুন..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full rounded-2xl bg-card py-2 pl-10 pr-4 text-xs outline-none border border-border shadow-sm text-card-foreground"
            />
          </div>

          <div className="space-y-2">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl bg-card p-3 shadow-sm flex items-center justify-between gap-2 border border-border"
              >
                <div>
                  <h4 className="text-xs font-semibold text-card-foreground">{p.name}</h4>
                  <p className="text-[10px] text-muted-foreground">
                    মূল্য: {bdt(p.selling_price)} · স্টক: {toBn(p.current_stock)} {p.unit}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition"
                >
                  যোগ করুন
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
