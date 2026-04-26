'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { BarChart3, Download, TrendingUp, Fuel, Car, DollarSign } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
}

interface ReportSummary {
  totalFuelCost: number;
  totalFuelLitres: number;
  totalMileage: number;
  totalSalesCash: number;
  journeyCount: number;
  fuelRefillCount: number;
  salesCount: number;
}

interface VehicleReport {
  vehicle: Vehicle;
  mileage: number;
  fuelLitres: number;
  fuelCost: number;
  journeyCount: number;
}

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [vehicleReports, setVehicleReports] = useState<VehicleReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    vehicleId: '',
  });

  useEffect(() => {
    api.get<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {});
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
      });
      const [sum, vReports] = await Promise.all([
        api.get<ReportSummary>(`/reports/summary?${params}`).catch(() => null),
        api.get<VehicleReport[]>(`/reports/by-vehicle?${params}`).catch(() => [] as VehicleReport[]),
      ]);
      setSummary(sum);
      setVehicleReports(vReports);
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <div>
      <Topbar title="Reports & Analytics" subtitle="Fleet performance overview" />
      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              <Select
                label="Vehicle (optional)"
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.plateNumber} — ${v.make} ${v.model}`,
                }))}
                value={filters.vehicleId}
                onChange={(e) => setFilters({ ...filters, vehicleId: e.target.value })}
              />
              <Button onClick={loadReports} loading={loading}>
                <BarChart3 size={16} /> Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary KPIs */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gold-500/20 rounded-lg">
                    <DollarSign size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Total Sales Cash</p>
                    <p className="text-white font-bold">{formatCurrency(summary.totalSalesCash)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Fuel size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Total Fuel Cost</p>
                    <p className="text-white font-bold">{formatCurrency(summary.totalFuelCost)}</p>
                    <p className="text-slate-500 text-xs">{summary.totalFuelLitres.toFixed(1)}L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Car size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Total Mileage</p>
                    <p className="text-white font-bold">{formatNumber(summary.totalMileage)} km</p>
                    <p className="text-slate-500 text-xs">{summary.journeyCount} journeys</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp size={18} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Cost per km</p>
                    <p className="text-white font-bold">
                      {summary.totalMileage > 0
                        ? formatCurrency(summary.totalFuelCost / summary.totalMileage)
                        : '—'}
                    </p>
                    <p className="text-slate-500 text-xs">fuel efficiency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vehicle breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Car size={18} className="text-gold-400" />
                Vehicle Performance Breakdown
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {vehicleReports.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                No vehicle data for selected period
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-slate-400 pb-3 font-medium">Vehicle</th>
                      <th className="text-right text-slate-400 pb-3 font-medium">Journeys</th>
                      <th className="text-right text-slate-400 pb-3 font-medium">Mileage</th>
                      <th className="text-right text-slate-400 pb-3 font-medium">Fuel (L)</th>
                      <th className="text-right text-slate-400 pb-3 font-medium">Fuel Cost</th>
                      <th className="text-right text-slate-400 pb-3 font-medium">Cost/km</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {vehicleReports.map((vr) => (
                      <tr key={vr.vehicle.id} className="hover:bg-white/5">
                        <td className="py-3">
                          <div className="text-white font-medium">
                            {vr.vehicle.plateNumber}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {vr.vehicle.make} {vr.vehicle.model}
                          </div>
                        </td>
                        <td className="py-3 text-right text-slate-300">{vr.journeyCount}</td>
                        <td className="py-3 text-right text-slate-300">
                          {formatNumber(vr.mileage)} km
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {vr.fuelLitres.toFixed(1)}L
                        </td>
                        <td className="py-3 text-right text-gold-400">
                          {formatCurrency(vr.fuelCost)}
                        </td>
                        <td className="py-3 text-right text-slate-400">
                          {vr.mileage > 0
                            ? formatCurrency(vr.fuelCost / vr.mileage)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
