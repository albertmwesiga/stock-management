'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatDateTime, formatNumber } from '@/lib/utils';
import { PackageMinus, Plus } from 'lucide-react';

interface StockType {
  id: string;
  name: string;
  unit: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface StockEntry {
  id: string;
  quantity: number;
  weightKgs?: number;
  location?: string;
  notes?: string;
  timestamp: string;
  stockType?: StockType;
  vehicle?: Vehicle;
}

export default function ReleaseStockPage() {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [stockTypes, setStockTypes] = useState<StockType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    stockTypeId: '',
    vehicleId: '',
    quantity: '',
    weightKgs: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [e, s, v] = await Promise.all([
        api.get<StockEntry[]>('/stock/entries?type=RELEASED').catch(() => [] as StockEntry[]),
        api.get<StockType[]>('/stock/types').catch(() => [] as StockType[]),
        api.get<Vehicle[]>('/vehicles').catch(() => [] as Vehicle[]),
      ]);
      setEntries(e);
      setStockTypes(s);
      setVehicles(v);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/stock/entries', {
        type: 'RELEASED',
        stockTypeId: form.stockTypeId,
        vehicleId: form.vehicleId || undefined,
        quantity: parseFloat(form.quantity),
        weightKgs: form.weightKgs ? parseFloat(form.weightKgs) : undefined,
        location: form.location,
        notes: form.notes,
      });
      setShowModal(false);
      setForm({ stockTypeId: '', vehicleId: '', quantity: '', weightKgs: '', location: '', notes: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to release stock');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar title="Release Stock" subtitle="Log outgoing stock releases" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Release Stock
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Released Stock History</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No released stock entries</p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/5 flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <PackageMinus size={14} className="text-orange-400" />
                        <span className="text-white font-medium">
                          {entry.stockType?.name}
                        </span>
                        {entry.vehicle && (
                          <span className="text-slate-400 text-sm">
                            — {entry.vehicle.plateNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {entry.location || 'No destination specified'}
                      </p>
                      {entry.notes && (
                        <p className="text-slate-500 text-xs">{entry.notes}</p>
                      )}
                      <p className="text-slate-500 text-xs">
                        {formatDateTime(entry.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-400 font-semibold">
                        -{formatNumber(entry.quantity)} {entry.stockType?.unit}
                      </div>
                      {entry.weightKgs && (
                        <div className="text-slate-400 text-sm">
                          {formatNumber(entry.weightKgs)} kg
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Release Stock">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
          )}
          <Select
            label="Stock Type"
            options={stockTypes.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.unit})`,
            }))}
            value={form.stockTypeId}
            onChange={(e) => setForm({ ...form, stockTypeId: e.target.value })}
            required
          />
          <Select
            label="Vehicle (optional)"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.plateNumber} — ${v.make} ${v.model}`,
            }))}
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <Input
              label="Weight (kg)"
              type="number"
              step="0.01"
              value={form.weightKgs}
              onChange={(e) => setForm({ ...form, weightKgs: e.target.value })}
            />
          </div>
          <Input
            label="Destination / Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Customer name, delivery point..."
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional notes..."
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
              Release Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
