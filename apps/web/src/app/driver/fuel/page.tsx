'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { Fuel, Plus } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface Journey {
  id: string;
  startTime: string;
  vehicle?: Vehicle;
}

interface FuelRefill {
  id: string;
  stationName: string;
  stationLocation?: string;
  litres: number;
  costPerLitre: number;
  totalCost: number;
  paymentMethod: string;
  timestamp: string;
  vehicle?: Vehicle;
}

export default function FuelPage() {
  const [refills, setRefills] = useState<FuelRefill[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    journeyId: '',
    stationName: '',
    stationLocation: '',
    litres: '',
    costPerLitre: '',
    amountPaid: '',
    paymentMethod: 'CASH',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [r, v, j] = await Promise.all([
        api.get<FuelRefill[]>('/fuel/refills').catch(() => [] as FuelRefill[]),
        api.get<Vehicle[]>('/vehicles').catch(() => [] as Vehicle[]),
        api.get<Journey[]>('/journeys/active').catch(() => [] as Journey[]),
      ]);
      setRefills(r);
      setVehicles(v);
      setJourneys(Array.isArray(j) ? j : []);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/fuel/refills', {
        vehicleId: form.vehicleId,
        journeyId: form.journeyId || undefined,
        stationName: form.stationName,
        stationLocation: form.stationLocation,
        litres: parseFloat(form.litres),
        costPerLitre: parseFloat(form.costPerLitre),
        amountPaid: parseFloat(form.amountPaid),
        paymentMethod: form.paymentMethod,
      });
      setShowModal(false);
      setForm({
        vehicleId: '',
        journeyId: '',
        stationName: '',
        stationLocation: '',
        litres: '',
        costPerLitre: '',
        amountPaid: '',
        paymentMethod: 'CASH',
      });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to log refill');
    } finally {
      setLoading(false);
    }
  }

  const calculatedTotal =
    form.litres && form.costPerLitre
      ? parseFloat(form.litres) * parseFloat(form.costPerLitre)
      : null;

  return (
    <div>
      <Topbar title="Fuel Refills" subtitle="Log and track fuel usage" />
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Log Refill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Refill History</CardTitle>
          </CardHeader>
          <CardContent>
            {refills.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No fuel refills logged yet</p>
            ) : (
              <div className="space-y-3">
                {refills.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Fuel size={14} className="text-gold-400" />
                          <span className="text-white font-medium">{r.stationName}</span>
                          {r.vehicle && (
                            <span className="text-slate-400 text-sm">— {r.vehicle.plateNumber}</span>
                          )}
                        </div>
                        <div className="text-slate-400 text-sm">
                          {r.litres}L @ {formatCurrency(r.costPerLitre)}/L
                        </div>
                        {r.stationLocation && (
                          <div className="text-slate-500 text-xs">{r.stationLocation}</div>
                        )}
                        <div className="text-slate-500 text-xs mt-1">
                          {formatDateTime(r.timestamp)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gold-400 font-semibold">
                          {formatCurrency(r.totalCost)}
                        </div>
                        <div className="text-slate-500 text-xs">{r.paymentMethod}</div>
                      </div>
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
        title="Log Fuel Refill"
        className="max-w-lg"
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
          <Select
            label="Journey (optional)"
            options={journeys.map((j) => ({
              value: j.id,
              label: `${j.vehicle?.plateNumber ?? 'Unknown'} - Started ${formatDateTime(j.startTime)}`,
            }))}
            value={form.journeyId}
            onChange={(e) => setForm({ ...form, journeyId: e.target.value })}
          />
          <Input
            label="Station Name"
            value={form.stationName}
            onChange={(e) => setForm({ ...form, stationName: e.target.value })}
            placeholder="Total Energies Kampala"
            required
          />
          <Input
            label="Station Location"
            value={form.stationLocation}
            onChange={(e) => setForm({ ...form, stationLocation: e.target.value })}
            placeholder="Kampala Road"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Litres"
              type="number"
              step="0.1"
              value={form.litres}
              onChange={(e) => setForm({ ...form, litres: e.target.value })}
              placeholder="45"
              required
            />
            <Input
              label="Cost per Litre (UGX)"
              type="number"
              value={form.costPerLitre}
              onChange={(e) => setForm({ ...form, costPerLitre: e.target.value })}
              placeholder="4800"
              required
            />
          </div>
          <Input
            label="Amount Paid (UGX)"
            type="number"
            value={form.amountPaid}
            onChange={(e) => setForm({ ...form, amountPaid: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            options={[
              { value: 'CASH', label: 'Cash' },
              { value: 'MOBILE_MONEY', label: 'Mobile Money' },
              { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
              { value: 'FUEL_CARD', label: 'Fuel Card' },
            ]}
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          />
          {calculatedTotal !== null && (
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-lg p-3 text-sm">
              <span className="text-slate-400">Calculated Total: </span>
              <span className="text-gold-400 font-semibold">
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
          )}
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
              Log Refill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
