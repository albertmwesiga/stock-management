'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { ShoppingCart, FileText, DollarSign } from 'lucide-react';

const navItems = [
  { href: '/sales/collections', label: 'Collections', icon: <ShoppingCart size={18} /> },
  { href: '/sales/end-of-day', label: 'End of Day', icon: <FileText size={18} /> },
  { href: '/sales/allowances', label: 'Allowances', icon: <DollarSign size={18} /> },
];

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar items={navItems} title="Sales Manager" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
