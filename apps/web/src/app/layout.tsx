import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FleetStock | Fleet Management System',
  description: 'Fleet stock, fuel and sales management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
