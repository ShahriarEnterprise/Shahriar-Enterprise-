import type { Metadata } from 'next';
import { BarChart3, Package, ShoppingCart, FileText, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shahriar Enterprise - হোলসেল ব্যবসা ব্যবস্থাপনা',
  description: 'সম্পূর্ণ হোলসেল বিজনেস ম্যানেজমেন্ট সিস্টেম',
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
          <div className="w-64 bg-blue-900 text-white shadow-lg">
            <div className="p-6 border-b border-blue-800">
              <h1 className="text-xl font-bold">Shahriar Enterprise</h1>
              <p className="text-blue-200 text-sm">হোলসেল বিজনেস</p>
            </div>

            <nav className="mt-6 space-y-2">
              <NavLink href="/dashboard" icon={<Home size={20} />} label="ড্যাশবোর্ড" />
              <NavLink href="/parties" icon={<BarChart3 size={20} />} label="পার্টি ব্যবস্থাপনা" />
              <NavLink href="/products" icon={<Package size={20} />} label="পণ্য ব্যবস্থাপনা" />
              <NavLink href="/sales" icon={<ShoppingCart size={20} />} label="বিক্রয় লেনদেন" />
              <NavLink href="/reports" icon={<FileText size={20} />} label="রিপোর্ট" />
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-blue-800">
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <LogOut size={20} />
                <span>লগআউট</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow">
              <div className="px-8 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">স্বাগতম Shahriar Enterprise এ</h2>
                <div className="text-sm text-gray-600">আজকের তারিখ: {new Date().toLocaleDateString('bn-BD')}</div>
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
      className="flex items-center gap-3 px-6 py-3 rounded-lg hover:bg-blue-800 transition text-blue-100 hover:text-white"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
