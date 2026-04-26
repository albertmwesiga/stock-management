'use client';
import { Sidebar } from '@/components/layout/sidebar';
import { Car, Fuel, Wrench, AlertTriangle, DollarSign } from 'lucide-react';

const navItems = [
  { href: '/driver/journey', label: 'Journey', icon: <Car size={18} /> },
  { href: '/driver/fuel', label: 'Fuel Refills', icon: <Fuel size={18} /> },
  { href: '/driver/service', label: 'Service', icon: <Wrench size={18} /> },
  { href: '/driver/mechanical', label: 'Mechanical Issues', icon: <AlertTriangle size={18} /> },
  { href: '/driver/allowances', label: 'Allowances', icon: <DollarSign size={18} /> },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar items={navItems} title="Driver Portal" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
