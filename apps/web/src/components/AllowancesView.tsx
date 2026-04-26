'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { DollarSign, Plus, CheckCircle, XCircle, Banknote } from 'lucide-react';

type AllowanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

interface Allowance {
  id: string;
  amount: number;
  reason: string;
  status: AllowanceStatus;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
  requester?: { id: string; name: string; role: string };
}

interface AllowancesViewProps {
  isDirector?: boolean;
}

const statusVariant: Record<AllowanceStatus, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  PAID: 'info',
};

export function AllowancesView({ isDirector = false }: AllowancesViewProps) {
  const user = getUser();
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ amount: '', reason: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get<Allowance[]>('/allowances').catch(() => [] as Allowance[]);
      setAllowances(data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/allowances/request', {
        amount: parseFloat(form.amount),
        reason: form.reason,
      });
      setShowModal(false);
      setForm({ amount: '', reason: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    try {
      await api.put(`/allowances/${id}/approve`, {});
      loadData();
    } catch {}
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.put(`/allowances/${selectedId}/reject`, { reason: rejectionReason });
      setShowRejectModal(false);
      setRejectionReason('');
      loadData();
    } catch {}
  }

  async function handlePayout(id: string) {
    try {
      await api.put(`/allowances/${id}/payout`, {});
      loadData();
    } catch {}
  }

  const pendingCount = allowances.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-semibold">
            {isDirector ? 'All Allowance Requests' : 'My Allowance Requests'}
          </h2>
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pending</Badge>
          )}
        </div>
        {!isDirector && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Request
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={18} className="text-gold-400" />
            {isDirector ? 'Requests Requiring Action' : 'Your Requests'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allowances.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No allowance requests</p>
          ) : (
            <div className="space-y-3">
              {allowances.map((a) => (
                <div key={a.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{a.reason}</span>
                        <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                      </div>
                      {isDirector && a.requester && (
                        <p className="text-slate-400 text-xs mb-1">
                          Requested by: {a.requester.name} ({a.requester.role.replace('_', ' ')})
                        </p>
                      )}
                      <p className="text-slate-500 text-xs mt-1">
                        {formatDateTime(a.createdAt)}
                        {a.approvedAt && ` · Approved ${formatDateTime(a.approvedAt)}`}
                        {a.paidAt && ` · Paid ${formatDateTime(a.paidAt)}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-gold-400 font-semibold text-lg">
                        {formatCurrency(a.amount)}
                      </div>
                      {isDirector && a.status === 'PENDING' && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-400 hover:bg-green-400/10"
                            onClick={() => handleApprove(a.id)}
                          >
                            <CheckCircle size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-400/10"
                            onClick={() => {
                              setSelectedId(a.id);
                              setShowRejectModal(true);
                            }}
                          >
                            <XCircle size={14} />
                          </Button>
                        </div>
                      )}
                      {isDirector && a.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-blue-400 hover:bg-blue-400/10"
                          onClick={() => handlePayout(a.id)}
                        >
                          <Banknote size={14} /> Pay Out
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Request Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Allowance Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
          )}
          <Input
            label="Amount (UGX)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="50000"
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Reason / Justification</label>
            <textarea
              className="bg-navy-950/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors min-h-[80px] resize-none"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Explain the purpose and necessity of this allowance..."
              required
            />
          </div>
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
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Allowance"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Rejection Reason</label>
            <textarea
              className="bg-navy-950/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors min-h-[80px] resize-none"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" className="flex-1">
              Reject Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
