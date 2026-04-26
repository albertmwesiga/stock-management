'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { LayoutDashboard, Car, BarChart3, DollarSign, Users } from 'lucide-react';

const navItems = [
  { href: '/director/dashboard', label: 'Live Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/director/vehicles', label: 'Vehicles', icon: <Car size={18} /> },
  { href: '/director/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { href: '/director/allowances', label: 'Allowances', icon: <DollarSign size={18} /> },
  { href: '/director/users', label: 'Users', icon: <Users size={18} /> },
];

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar items={navItems} title="Director" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
