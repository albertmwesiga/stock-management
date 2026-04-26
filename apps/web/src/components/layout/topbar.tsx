'use client';
import React from 'react';
import { getUser } from '@/lib/auth';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const user = getUser();

  return (
    <header className="h-16 bg-[#0a1628]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-white font-semibold">{title}</h1>
        {subtitle && <p className="text-slate-400 text-xs">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm text-white">{user?.name}</div>
          <div className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
          <span className="text-gold-400 text-xs font-bold">{user?.name?.charAt(0) || 'U'}</span>
        </div>
      </div>
    </header>
  );
}
