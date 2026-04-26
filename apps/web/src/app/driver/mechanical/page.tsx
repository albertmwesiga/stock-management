'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDateTime } from '@/lib/utils';
import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface MechanicalIssue {
  id: string;
  description: string;
  repairDetails?: string;
  reportedAt: string;
  resolvedAt?: string;
  vehicle?: Vehicle;
}

export default function MechanicalPage() {
  const [issues, setIssues] = useState<MechanicalIssue[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ vehicleId: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [i, v] = await Promise.all([
        api.get<MechanicalIssue[]>('/mechanical/issues').catch(() => [] as MechanicalIssue[]),
        api.get<Vehicle[]>('/vehicles').catch(() => [] as Vehicle[]),
      ]);
      setIssues(i);
      setVehicles(v);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/mechanical/issues', form);
      setShowModal(false);
      setForm({ vehicleId: '', description: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id: string) {
    try {
      await api.put(`/mechanical/issues/${id}/resolve`, {});
      loadData();
    } catch {}
  }

  return (
    <div>
      <Topbar title="Mechanical Issues" subtitle="Report and track vehicle problems" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Report Issue
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Issues Log</CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No mechanical issues reported
              </p>
            ) : (
              <div className="space-y-3">
                {issues.map((issue) => (
                  <div key={issue.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle
                            size={14}
                            className={issue.resolvedAt ? 'text-green-400' : 'text-yellow-400'}
                          />
                          <span className="text-white font-medium">
                            {issue.vehicle?.plateNumber}
                          </span>
                          <Badge variant={issue.resolvedAt ? 'success' : 'warning'}>
                            {issue.resolvedAt ? 'Resolved' : 'Open'}
                          </Badge>
                        </div>
                        <p className="text-slate-300 text-sm">{issue.description}</p>
                        {issue.repairDetails && (
                          <p className="text-slate-400 text-sm mt-1">
                            Repair: {issue.repairDetails}
                          </p>
                        )}
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDateTime(issue.reportedAt)}
                        </p>
                      </div>
                      {!issue.resolvedAt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolve(issue.id)}
                        >
                          <CheckCircle size={14} /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Report Mechanical Issue"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
          )}
          <Select
            label="Vehicle"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.plateNumber} — ${v.make} ${v.model}`,
            }))}
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              className="bg-navy-950/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 transition-colors min-h-[80px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the mechanical issue in detail..."
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
              Report Issue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
