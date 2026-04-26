'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { PackagePlus, PackageMinus, DollarSign } from 'lucide-react';

const navItems = [
  { href: '/stock/receive', label: 'Receive Stock', icon: <PackagePlus size={18} /> },
  { href: '/stock/release', label: 'Release Stock', icon: <PackageMinus size={18} /> },
  { href: '/stock/allowances', label: 'Allowances', icon: <DollarSign size={18} /> },
];

export default function StockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar items={navItems} title="Stock Manager" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
