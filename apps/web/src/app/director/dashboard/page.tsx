'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Car, Fuel, ShoppingCart, DollarSign, Activity, Clock } from 'lucide-react';

interface LiveSummary {
  activeJourneys: number;
  todayFuel: { totalCost: number; litres: number };
  todaySales: { totalCash: number };
  pendingAllowances: number;
  timestamp: string;
}

interface LiveEvent {
  type: string;
  data: Record<string, unknown>;
  time: string;
}

interface StockItem {
  stockType: { id: string; name: string; unit: string };
  balance: { quantity: number; weightKgs: number };
}

export default function DirectorDashboard() {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [stockSummary, setStockSummary] = useState<StockItem[]>([]);
  const socketRef = useRef<{ disconnect: () => void } | null>(null);

  useEffect(() => {
    loadSummary();
    loadStock();

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    import('socket.io-client').then(({ io }) => {
      const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join_director', {});
      });

      socket.on('disconnect', () => setConnected(false));

      const eventTypes = [
        'journey:started',
        'journey:completed',
        'journey:stop_added',
        'fuel:refill',
        'stock:update',
        'sales:record',
      ];
      eventTypes.forEach((eventType) => {
        socket.on(eventType, (data: Record<string, unknown>) => {
          setEvents((prev) =>
            [
              {
                type: eventType,
                data,
                time: new Date().toLocaleTimeString(),
              },
              ...prev,
            ].slice(0, 20),
          );
          loadSummary();
        });
      });
    });

    const interval = setInterval(loadSummary, 30000);
    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
    };
  }, []);

  async function loadSummary() {
    try {
      const data = await api.get<LiveSummary>('/reports/director/live-summary');
      setSummary(data);
    } catch {}
  }

  async function loadStock() {
    try {
      const data = await api.get<StockItem[]>('/stock/summary');
      setStockSummary(data);
    } catch {}
  }

  const getEventIcon = (type: string) => {
    if (type.includes('journey')) return <Car size={14} />;
    if (type.includes('fuel')) return <Fuel size={14} />;
    if (type.includes('stock')) return <ShoppingCart size={14} />;
    if (type.includes('sales')) return <DollarSign size={14} />;
    return <Activity size={14} />;
  };

  const getEventLabel = (type: string) => {
    const labels: Record<string, string> = {
      'journey:started': 'Journey Started',
      'journey:completed': 'Journey Completed',
      'journey:stop_added': 'Stop Added',
      'fuel:refill': 'Fuel Refill',
      'stock:update': 'Stock Update',
      'sales:record': 'Sale Recorded',
    };
    return labels[type] || type;
  };

  const getEventDescription = (event: LiveEvent): string => {
    const data = event.data as Record<string, unknown>;
    const vehicle = data.vehicle as Record<string, unknown> | undefined;
    const stockType = data.stockType as Record<string, unknown> | undefined;
    return (vehicle?.plateNumber as string) || (stockType?.name as string) || '—';
  };

  return (
    <div>
      <Topbar
        title="Live Dashboard"
        subtitle={
          summary
            ? `Last updated: ${new Date(summary.timestamp).toLocaleTimeString()}`
            : 'Loading...'
        }
      />
      <div className="p-6 space-y-6">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          <span className="text-sm text-slate-400">
            {connected ? 'Live updates connected' : 'Connecting to live feed...'}
          </span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-500/20">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Car size={20} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Active Journeys</p>
                  <p className="text-white text-2xl font-bold">
                    {summary?.activeJourneys ?? '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Fuel size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Today&apos;s Fuel Cost</p>
                  <p className="text-white text-xl font-bold">
                    {summary ? formatCurrency(summary.todayFuel.totalCost) : '—'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {summary?.todayFuel.litres.toFixed(1)}L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gold-500/20">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-500/20 rounded-xl">
                  <DollarSign size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Today&apos;s Sales</p>
                  <p className="text-white text-xl font-bold">
                    {summary ? formatCurrency(summary.todaySales.totalCash) : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Activity size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Pending Allowances</p>
                  <p className="text-white text-2xl font-bold">
                    {summary?.pendingAllowances ?? '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-gold-400" />
                Current Stock Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stockSummary.length === 0 ? (
                <p className="text-slate-500 text-sm">No stock data available</p>
              ) : (
                <div className="space-y-3">
                  {stockSummary.map((s) => (
                    <div key={s.stockType.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{s.stockType.name}</p>
                        <p className="text-slate-500 text-xs">{s.stockType.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">
                          {s.balance.quantity.toFixed(1)} {s.stockType.unit}
                        </p>
                        {s.balance.weightKgs > 0 && (
                          <p className="text-slate-400 text-xs">
                            {s.balance.weightKgs.toFixed(1)} kg
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Events Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity size={18} className="text-gold-400" />
                Live Activity Feed
                {connected && (
                  <Badge variant="success" className="ml-auto">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">
                  Waiting for real-time events...
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-white/5">
                      <div className="text-gold-400 mt-0.5">{getEventIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium">
                          {getEventLabel(event.type)}
                        </p>
                        <p className="text-slate-400 text-xs truncate">
                          {getEventDescription(event)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs flex-shrink-0">
                        <Clock size={10} />
                        {event.time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
