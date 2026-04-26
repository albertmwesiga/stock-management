'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getRoleRedirect } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.replace(getRoleRedirect(user.role));
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-gold-500 text-lg animate-pulse">Loading...</div>
    </div>
  );
}
