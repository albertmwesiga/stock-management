'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatNumber } from '@/lib/utils';
import { Car, Plus, AlertTriangle } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  tankCapacity: number;
  currentMileage: number;
  nextServiceMileage: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    tankCapacity: '',
    currentMileage: '',
    nextServiceMileage: '',
  });

  useEffect(() => {
    api.get<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/vehicles', {
        plateNumber: form.plateNumber,
        make: form.make,
        model: form.model,
        tankCapacity: parseFloat(form.tankCapacity),
        currentMileage: parseFloat(form.currentMileage),
        nextServiceMileage: parseFloat(form.nextServiceMileage),
      });
      setShowModal(false);
      setForm({
        plateNumber: '',
        make: '',
        model: '',
        tankCapacity: '',
        currentMileage: '',
        nextServiceMileage: '',
      });
      api.get<Vehicle[]>('/vehicles').then(setVehicles).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar title="Fleet Vehicles" subtitle="Manage and monitor all fleet vehicles" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{vehicles.length} vehicles registered</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Vehicle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent>
                  <p className="text-slate-500 text-sm text-center py-8">
                    No vehicles registered yet
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            vehicles.map((v) => {
              const serviceDue = v.currentMileage >= v.nextServiceMileage * 0.95;
              const servicePercent = Math.min(
                100,
                (v.currentMileage / v.nextServiceMileage) * 100,
              );

              return (
                <Card key={v.id} className={serviceDue ? 'border-yellow-500/30' : ''}>
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Car size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{v.plateNumber}</p>
                          <p className="text-slate-400 text-sm">
                            {v.make} {v.model}
                          </p>
                        </div>
                      </div>
                      {serviceDue && (
                        <Badge variant="warning">
                          <AlertTriangle size={10} className="mr-1" />
                          Service Due
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tank Capacity</span>
                        <span className="text-white">{v.tankCapacity}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Mileage</span>
                        <span className="text-white">
                          {formatNumber(v.currentMileage)} km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Service</span>
                        <span className={serviceDue ? 'text-yellow-400' : 'text-white'}>
                          {formatNumber(v.nextServiceMileage)} km
                        </span>
                      </div>
                    </div>

                    {/* Service progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Service progress</span>
                        <span>{servicePercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            servicePercent >= 95
                              ? 'bg-yellow-400'
                              : servicePercent >= 80
                              ? 'bg-orange-400'
                              : 'bg-green-400'
                          }`}
                          style={{ width: `${servicePercent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Vehicle">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>
          )}
          <Input
            label="Plate Number"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            placeholder="UAA 123B"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Make"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              placeholder="Toyota"
              required
            />
            <Input
              label="Model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Land Cruiser"
              required
            />
          </div>
          <Input
            label="Tank Capacity (L)"
            type="number"
            step="0.1"
            value={form.tankCapacity}
            onChange={(e) => setForm({ ...form, tankCapacity: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Current Mileage (km)"
              type="number"
              value={form.currentMileage}
              onChange={(e) => setForm({ ...form, currentMileage: e.target.value })}
              required
            />
            <Input
              label="Next Service At (km)"
              type="number"
              value={form.nextServiceMileage}
              onChange={(e) => setForm({ ...form, nextServiceMileage: e.target.value })}
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
              Add Vehicle
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
