import type { Metadata } from 'next';
import { BarChart3, Package, ShoppingCart, FileText, Home, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shahriar Enterprise - প্রফেশনাল হোলসেল ম্যানেজমেন্ট সফটওয়্যার',
  description: 'সম্পূর্ণ হোলসেল বিজনেস ম্যানেজমেন্ট সিস্টেম - বিল, খাতা, স্টক, রিপোর্ট সব এক জায়গায়',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className="bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg overflow-y-auto">
            <div className="p-6 border-b border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={32} className="text-yellow-400" />
                <div>
                  <h1 className="text-2xl font-bold">SE</h1>
                  <p className="text-xs text-blue-200">Enterprise</p>
                </div>
              </div>
              <p className="text-blue-200 text-xs mt-2">প্রফেশনাল হোলসেল ম্যানেজমেন্ট</p>
            </div>

            <nav className="mt-6 space-y-1 px-3">
              <NavLink href="/dashboard" icon={<Home size={20} />} label="ড্যাশবোর্ড" />
              <NavLink href="/billing" icon={<ShoppingCart size={20} />} label="দ্রুত বিল" />
              <NavLink href="/parties" icon={<BarChart3 size={20} />} label="পার্টি" />
              <NavLink href="/products" icon={<Package size={20} />} label="পণ্য" />
              <NavLink href="/sales" icon={<FileText size={20} />} label="লেনদেন" />
              <NavLink href="/reports" icon={<FileText size={20} />} label="রিপোর্ট" />
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-700 bg-blue-900/50">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-800 transition bg-blue-700 font-semibold">
                <LogOut size={20} />
                <span>লগআউট</span>
              </button>
              <p className="text-xs text-blue-300 text-center mt-3">© 2024 Shahriar Enterprise</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-md border-b-4 border-blue-600">
              <div className="px-8 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Zap size={28} className="text-yellow-500" />
                    Shahriar Enterprise
                  </h2>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                  📅 {new Date().toLocaleDateString('bn-BD')}
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition text-blue-100 hover:text-white font-semibold"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
