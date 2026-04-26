'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, getRoleRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(getRoleRedirect(user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-500 rounded-2xl mb-4 shadow-lg shadow-gold-500/25">
            <span className="text-navy-950 font-black text-2xl">FS</span>
          </div>
          <h1 className="text-3xl font-bold text-white">FleetStock</h1>
          <p className="text-slate-400 mt-1">Fleet Management System</p>
        </div>

        {/* Login form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fleet.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500 mb-3">Demo accounts (password: password123)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { email: 'director@fleet.com', role: 'Director' },
                { email: 'driver@fleet.com', role: 'Driver' },
                { email: 'stock@fleet.com', role: 'Stock Mgr' },
                { email: 'sales@fleet.com', role: 'Sales Mgr' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('password123'); }}
                  className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <div className="text-gold-400 text-xs font-medium">{acc.role}</div>
                  <div className="text-slate-500 text-xs truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
