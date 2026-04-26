'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { Users, Plus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  DIRECTOR: 'info',
  DRIVER: 'default',
  STOCK_MANAGER: 'success',
  SALES_MANAGER: 'warning',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'DRIVER' });

  useEffect(() => {
    api.get<User[]>('/users').then(setUsers).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ email: '', password: '', name: '', role: 'DRIVER' });
      api.get<User[]>('/users').then(setUsers).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
    } catch {}
  }

  return (
    <div>
      <Topbar title="User Management" subtitle="Manage system users and roles" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-gold-400" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No users found</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 text-sm font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{u.name}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={roleBadgeVariant[u.role] ?? 'default'}>
                        {u.role.replace('_', ' ')}
                      </Badge>
                      <span className="text-slate-500 text-xs hidden sm:block">
                        {formatDate(u.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
          )}
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="john@fleet.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 8 characters"
            required
          />
          <Select
            label="Role"
            options={[
              { value: 'DRIVER', label: 'Driver' },
              { value: 'STOCK_MANAGER', label: 'Stock Manager' },
              { value: 'SALES_MANAGER', label: 'Sales Manager' },
              { value: 'DIRECTOR', label: 'Director' },
            ]}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
