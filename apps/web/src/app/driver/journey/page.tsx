'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDateTime } from '@/lib/utils';
import { Play, Square, MapPin, Clock, Truck } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  currentMileage: number;
}

interface JourneyStop {
  id: string;
  location: string;
  purpose: string;
  notes?: string;
}

interface Journey {
  id: string;
  vehicleId: string;
  driverId?: string;
  vehicle: Vehicle;
  startTime: string;
  endTime?: string;
  startMileage: number;
  endMileage?: number;
  status: 'ACTIVE' | 'COMPLETED';
  notes?: string;
  stops: JourneyStop[];
}

export default function JourneyPage() {
  const user = getUser();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showStopAddModal, setShowStopAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [startForm, setStartForm] = useState({ vehicleId: '', startMileage: '', notes: '' });
  const [stopForm, setStopForm] = useState({ endMileage: '', notes: '' });
  const [stopAddForm, setStopAddForm] = useState({ location: '', purpose: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [v, active, all] = await Promise.all([
        api.get<Vehicle[]>('/vehicles'),
        api.get<Journey[]>('/journeys/active').catch(() => [] as Journey[]),
        api.get<Journey[]>('/journeys').catch(() => [] as Journey[]),
      ]);
      setVehicles(v);
      const myActive = (Array.isArray(active) ? active : []).find(
        (j) => !user || j.driverId === user.id,
      ) || (Array.isArray(active) ? active[0] : null);
      setActiveJourney(myActive || null);
      setJourneys((Array.isArray(all) ? all : []).slice(0, 10));
    } catch {}
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/journeys/start', {
        vehicleId: startForm.vehicleId,
        startMileage: parseFloat(startForm.startMileage),
        notes: startForm.notes,
      });
      setShowStartModal(false);
      setStartForm({ vehicleId: '', startMileage: '', notes: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start journey');
    } finally {
      setLoading(false);
    }
  }

  async function handleStop(e: React.FormEvent) {
    e.preventDefault();
    if (!activeJourney) return;
    setLoading(true);
    setError('');
    try {
      await api.post(`/journeys/${activeJourney.id}/stop`, {
        endMileage: parseFloat(stopForm.endMileage),
        notes: stopForm.notes,
      });
      setShowStopModal(false);
      setStopForm({ endMileage: '', notes: '' });
      setActiveJourney(null);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to end journey');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStop(e: React.FormEvent) {
    e.preventDefault();
    if (!activeJourney) return;
    setLoading(true);
    setError('');
    try {
      await api.post(`/journeys/${activeJourney.id}/stops`, stopAddForm);
      setShowStopAddModal(false);
      setStopAddForm({ location: '', purpose: '', notes: '' });
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add stop');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Topbar title="Journey Management" subtitle="Track your active journey" />

      <div className="p-6 space-y-6">
        {/* Active Journey Banner */}
        {activeJourney ? (
          <Card className="border-gold-500/30 bg-gold-500/5">
            <CardContent>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success">ACTIVE</Badge>
                    <span className="text-white font-semibold">
                      {activeJourney.vehicle?.plateNumber} —{' '}
                      {activeJourney.vehicle?.make} {activeJourney.vehicle?.model}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Started {formatDateTime(activeJourney.startTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={14} />
                      Start: {activeJourney.startMileage.toLocaleString()} km
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {activeJourney.stops?.length ?? 0} stops
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowStopAddModal(true)}>
                    <MapPin size={14} />
                    Add Stop
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setShowStopModal(true)}>
                    <Square size={14} />
                    End Journey
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">No Active Journey</p>
                  <p className="text-slate-400 text-sm">Start a journey to begin tracking</p>
                </div>
                <Button onClick={() => setShowStartModal(true)}>
                  <Play size={16} />
                  Start Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Journeys */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Journeys</CardTitle>
          </CardHeader>
          <CardContent>
            {journeys.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No journeys yet</p>
            ) : (
              <div className="space-y-3">
                {journeys.map((j) => (
                  <div
                    key={j.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                          {j.vehicle?.plateNumber}
                        </span>
                        <Badge variant={j.status === 'ACTIVE' ? 'success' : 'default'}>
                          {j.status}
                        </Badge>
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {formatDateTime(j.startTime)}
                        {j.endTime && ` → ${formatDateTime(j.endTime)}`}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {j.endMileage ? (
                        <span className="text-white">
                          {(j.endMileage - j.startMileage).toLocaleString()} km
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {j.startMileage.toLocaleString()} km start
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Journey Modal */}
      <Modal open={showStartModal} onClose={() => setShowStartModal(false)} title="Start Journey">
        <form onSubmit={handleStart} className="space-y-4">
          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>}
          <Select
            label="Vehicle"
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.plateNumber} — ${v.make} ${v.model}`,
            }))}
            value={startForm.vehicleId}
            onChange={(e) => setStartForm({ ...startForm, vehicleId: e.target.value })}
            required
          />
          <Input
            label="Start Mileage (km)"
            type="number"
            value={startForm.startMileage}
            onChange={(e) => setStartForm({ ...startForm, startMileage: e.target.value })}
            placeholder="45000"
            required
          />
          <Input
            label="Notes (optional)"
            value={startForm.notes}
            onChange={(e) => setStartForm({ ...startForm, notes: e.target.value })}
            placeholder="Purpose of journey..."
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowStartModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Start Journey
            </Button>
          </div>
        </form>
      </Modal>

      {/* End Journey Modal */}
      <Modal open={showStopModal} onClose={() => setShowStopModal(false)} title="End Journey">
        <form onSubmit={handleStop} className="space-y-4">
          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>}
          <Input
            label="End Mileage (km)"
            type="number"
            value={stopForm.endMileage}
            onChange={(e) => setStopForm({ ...stopForm, endMileage: e.target.value })}
            placeholder="45350"
            required
          />
          <Input
            label="Notes (optional)"
            value={stopForm.notes}
            onChange={(e) => setStopForm({ ...stopForm, notes: e.target.value })}
            placeholder="Journey summary..."
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowStopModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" className="flex-1" loading={loading}>
              End Journey
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Stop Modal */}
      <Modal
        open={showStopAddModal}
        onClose={() => setShowStopAddModal(false)}
        title="Add Journey Stop"
      >
        <form onSubmit={handleAddStop} className="space-y-4">
          {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">{error}</div>}
          <Input
            label="Location"
            value={stopAddForm.location}
            onChange={(e) => setStopAddForm({ ...stopAddForm, location: e.target.value })}
            placeholder="Nakasero Market, Kampala"
            required
          />
          <Input
            label="Purpose"
            value={stopAddForm.purpose}
            onChange={(e) => setStopAddForm({ ...stopAddForm, purpose: e.target.value })}
            placeholder="Delivery, Pickup, Refuel..."
            required
          />
          <Input
            label="Notes (optional)"
            value={stopAddForm.notes}
            onChange={(e) => setStopAddForm({ ...stopAddForm, notes: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowStopAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={loading}>
              Add Stop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
