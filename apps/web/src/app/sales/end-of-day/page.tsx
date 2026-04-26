'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { FileText, CheckCircle } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface DayReport {
  journeys: number;
  fuel: { totalCost: number; litres: number };
  sales: { totalCash: number };
  mileage: { total: number };
}

export default function EndOfDayPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reportData, setReportData] = useState<DayReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    totalFuelCost: '',
    totalMileage: '',
    totalCashCollected: '',
    cashHandedOver: '',
    handoverRecipient: '',
    notes: '',
  });

  useEffect(() => {
    api.get<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {});
  }, []);

  async function loadSummary() {
    if (!form.vehicleId) return;
    try {
      const data = await api.get<DayReport>(
        `/reports/end-of-day/${form.vehicleId}/${form.date}`,
      );
      setReportData(data);
      setForm((f) => ({
        ...f,
        totalFuelCost: data.fuel.totalCost.toString(),
        totalMileage: data.mileage.total.toString(),
        totalCashCollected: data.sales.totalCash.toString(),
      }));
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/reports/end-of-day', {
        vehicleId: form.vehicleId || undefined,
        date: form.date,
        totalFuelCost: parseFloat(form.totalFuelCost),
        totalMileage: parseFloat(form.totalMileage),
        totalCashCollected: parseFloat(form.totalCashCollected),
        cashHandedOver: parseFloat(form.cashHandedOver),
        handoverRecipient: form.handoverRecipient,
        notes: form.notes,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div>
        <Topbar title="End of Day Report" />
        <div className="p-6 flex flex-col items-center justify-center min-h-96">
          <CheckCircle size={48} className="text-green-400 mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Report Submitted!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your end-of-day report has been saved successfully.
          </p>
          <Button onClick={() => { setSubmitted(false); setReportData(null); }}>
            Submit Another Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar title="End of Day Report" subtitle="Submit your daily summary" />
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} className="text-gold-400" />
              Daily Summary Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Vehicle"
                  options={vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.plateNumber} — ${v.make} ${v.model}`,
                  }))}
                  value={form.vehicleId}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                />
                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <Button type="button" variant="outline" size="sm" onClick={loadSummary}>
                Auto-fill from recorded data
              </Button>

              {reportData && (
                <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 space-y-1 border border-white/10">
                  <p className="text-white font-medium mb-2">Auto-filled summary:</p>
                  <p>Journeys completed: {reportData.journeys}</p>
                  <p>
                    Fuel cost: {formatCurrency(reportData.fuel.totalCost)} (
                    {reportData.fuel.litres}L)
                  </p>
                  <p>Sales collected: {formatCurrency(reportData.sales.totalCash)}</p>
                  <p>Total mileage: {reportData.mileage.total} km</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Total Fuel Cost (UGX)"
                  type="number"
                  value={form.totalFuelCost}
                  onChange={(e) => setForm({ ...form, totalFuelCost: e.target.value })}
                  required
                />
                <Input
                  label="Total Mileage (km)"
                  type="number"
                  value={form.totalMileage}
                  onChange={(e) => setForm({ ...form, totalMileage: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Cash Collected (UGX)"
                  type="number"
                  value={form.totalCashCollected}
                  onChange={(e) => setForm({ ...form, totalCashCollected: e.target.value })}
                  required
                />
                <Input
                  label="Cash Handed Over (UGX)"
                  type="number"
                  value={form.cashHandedOver}
                  onChange={(e) => setForm({ ...form, cashHandedOver: e.target.value })}
                  required
                />
              </div>
              <Input
                label="Handover Recipient"
                value={form.handoverRecipient}
                onChange={(e) => setForm({ ...form, handoverRecipient: e.target.value })}
                placeholder="Name of person receiving the cash"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-300">Notes / Remarks</label>
                <textarea
                  className="bg-navy-950/50 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 min-h-[80px] resize-none"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any incidents, delays, or remarks for today..."
                />
              </div>
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Submit End of Day Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
