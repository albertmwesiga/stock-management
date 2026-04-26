'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatDateTime, formatCurrency, formatNumber } from '@/lib/utils';
import { ShoppingCart, Plus, TrendingUp } from 'lucide-react';

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

interface SalesRecord {
  id: string;
  deliveryPoint: string;
  quantity: number;
  weightKgs?: number;
  cashReceived: number;
  notes?: string;
  timestamp: string;
  stockType?: StockType;
  vehicle?: Vehicle;
  salesManager?: { name: string };
}

interface SalesSummary {
  totalCash: number;
  totalQuantity: number;
  recordCount: number;
}

export default function CollectionsPage() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [stockTypes, setStockTypes] = useState<StockType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    stockTypeId: '',
    deliveryPoint: '',
    quantity: '',
    weightKgs: '',
    cashReceived: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, st, v, sum] = await Promise.all([
        api.get<SalesRecord[]>('/sales/records').catch(() => [] as SalesRecord[]),
        api.get<StockType[]>('/stock/types').catch(() => [] as StockType[]),
        api.get<Vehicle[]>('/vehicles').catch(() => [] as Vehicle[]),
        api.get<SalesSummary>('/sales/summary').catch(() => null),
      ]);
      setSales(s);
      setStockTypes(st);
      setVehicles(v);
      setSummary(sum);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/sales/records', {
        stockTypeId: form.stockTypeId,
        vehicleId: form.vehicleId || undefined,
        deliveryPoint: form.deliveryPoint,
        quantity: parseFloat(form.quantity),
        weightKgs: form.weightKgs ? parseFloat(form.weightKgs) : undefined,
        cashReceived: parseFloat(form.cashReceived),
        notes: form.notes,
      });
      setShowModal(false);
      setForm({
        vehicleId: '',
        stockTypeId: '',
        deliveryPoint: '',
        quantity: '',
        weightKgs: '',
        cashReceived: '',
        notes: '',
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar title="Sales Collections" subtitle="Record cash collections from deliveries" />
      <div className="p-6 space-y-6">
        {/* Today's summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold-500/20 rounded-lg">
                    <TrendingUp size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Today&apos;s Cash</p>
                    <p className="text-white text-xl font-bold">
                      {formatCurrency(summary.totalCash)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div>
                  <p className="text-slate-400 text-xs">Total Quantity</p>
                  <p className="text-white text-xl font-bold">
                    {formatNumber(summary.totalQuantity)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div>
                  <p className="text-slate-400 text-xs">Records Today</p>
                  <p className="text-white text-xl font-bold">{summary.recordCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Record Sale
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Records</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No sales records yet</p>
            ) : (
              <div className="space-y-3">
                {sales.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/5 flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart size={14} className="text-gold-400" />
                        <span className="text-white font-medium">{s.stockType?.name}</span>
                        <span className="text-slate-400 text-sm">→ {s.deliveryPoint}</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {formatNumber(s.quantity)} {s.stockType?.unit}
                        {s.weightKgs ? ` / ${formatNumber(s.weightKgs)} kg` : ''}
                      </p>
                      {s.notes && <p className="text-slate-500 text-xs">{s.notes}</p>}
                      <p className="text-slate-500 text-xs">{formatDateTime(s.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-gold-400 font-semibold">
                        {formatCurrency(s.cashReceived)}
                      </div>
                      {s.salesManager && (
                        <div className="text-slate-500 text-xs">{s.salesManager.name}</div>
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
        title="Record Sale"
        className="max-w-lg"
      >
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
          <Input
            label="Delivery Point"
            value={form.deliveryPoint}
            onChange={(e) => setForm({ ...form, deliveryPoint: e.target.value })}
            placeholder="Nakasero Market, Owino..."
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
            label="Cash Received (UGX)"
            type="number"
            value={form.cashReceived}
            onChange={(e) => setForm({ ...form, cashReceived: e.target.value })}
            required
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
              Record Sale
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
