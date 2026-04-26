'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Wrench, Plus, AlertTriangle } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  currentMileage: number;
  nextServiceMileage: number;
}

interface ServiceRecord {
  id: string;
  mileageAtService: number;
  nextServiceMileage: number;
  notes?: string;
  createdAt: string;
  vehicle?: Vehicle;
}

export default function ServicePage() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    mileageAtService: '',
    nextServiceMileage: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [r, v] = await Promise.all([
        api.get<ServiceRecord[]>('/service/records').catch(() => [] as ServiceRecord[]),
        api.get<Vehicle[]>('/vehicles').catch(() => [] as Vehicle[]),
      ]);
      setRecords(r);
      setVehicles(v);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/service/records', {
        vehicleId: form.vehicleId,
        mileageAtService: parseFloat(form.mileageAtService),
        nextServiceMileage: parseFloat(form.nextServiceMileage),
        notes: form.notes,
      });
      setShowModal(false);
      setForm({ vehicleId: '', mileageAtService: '', nextServiceMileage: '', notes: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar title="Service Records" subtitle="Track vehicle maintenance" />
      <div className="p-6 space-y-6">
        {/* Vehicle service status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const nearService = v.currentMileage >= v.nextServiceMileage * 0.95;
            return (
              <Card key={v.id} className={nearService ? 'border-yellow-500/30' : ''}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{v.plateNumber}</span>
                        {nearService && (
                          <Badge variant="warning">
                            <AlertTriangle size={10} className="mr-1" />
                            Service Due
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {v.make} {v.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">
                        {v.currentMileage.toLocaleString()} km
                      </div>
                      <div className="text-slate-500 text-xs">
                        Next: {v.nextServiceMileage.toLocaleString()} km
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Log Service
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service History</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No service records yet</p>
            ) : (
              <div className="space-y-3">
                {records.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Wrench size={14} className="text-gold-400" />
                          <span className="text-white">{r.vehicle?.plateNumber}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                          {r.notes || 'Regular service'}
                        </p>
                        <p className="text-slate-500 text-xs">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {r.mileageAtService.toLocaleString()} km
                        </div>
                        <div className="text-slate-500 text-xs">
                          Next: {r.nextServiceMileage.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Service Record">
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
          <Input
            label="Mileage at Service (km)"
            type="number"
            value={form.mileageAtService}
            onChange={(e) => setForm({ ...form, mileageAtService: e.target.value })}
            required
          />
          <Input
            label="Next Service Mileage (km)"
            type="number"
            value={form.nextServiceMileage}
            onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })}
            required
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Oil change, brake check..."
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
              Log Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
