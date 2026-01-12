import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Clock,
  MapPin,
  Zap,
  Trophy,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDistance, formatDuration, formatPace, haversine, formatRecordTime, getBestTimeForDistance } from "@/lib/utils"
import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import React, { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import * as toGeoJSON from "@tmcw/togeojson";
import { geojsonToStreams } from "@/lib/geojsonToStreams";

const chartConfig = {
  distance: {
    label: "Distanza",
    color: "hsl(var(--primary))",
  },
  activities: {
    label: "Corse",
    color: "hsl(var(--secondary))",
  },
};

export default function Dashboard() {
  const { user, isLoadingUser, userError, isAutoSyncing, lastSyncError, performSync } = useAuth();
  const { 
    activities, 
    statsRun,
    isLoadingStatsRun,
    trendsRun,
    isLoadingTrendsRun,
    syncActivities,
    isSyncing,
    syncError
  } = useActivities(user?.id || null, 'year');
  

  const handleSyncAll = async () => {
    try {
      // Sincronizza tutte le attività disponibili (senza limite di data)
      await syncActivities();
    } catch (error) {
      console.error('Error syncing all activities:', error);
    }
  };

  // Funzione per sincronizzare manualmente
  const handleManualSync = async () => {
    if (user?.id) {
      await performSync(user.id, 'manual');
    }
  };

  // Raggruppa i trends per mese (YYYY-MM)
  const monthlyTrends: Record<string, { distance: number; time: number; activities: number; elevation: number }> = {};

  if (trendsRun?.trends) {
    Object.entries(trendsRun.trends).forEach(([key, value]) => {
      const month = key.slice(0, 7); // Prendi solo YYYY-MM
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { distance: 0, time: 0, activities: 0, elevation: 0 };
      }
      monthlyTrends[month].distance += value.distance;
      monthlyTrends[month].time += value.time;
      monthlyTrends[month].activities += value.activities;
      monthlyTrends[month].elevation += value.elevation;
    });
  }

  // Ora prendi i 12 mesi più recenti
  let last12MonthsKeys: string[] = Object.keys(monthlyTrends)
    .filter(k => /^\d{4}-\d{2}$/.test(k))
    .sort((a, b) => new Date(a + '-01').getTime() - new Date(b + '-01').getTime())
    .slice(-12);

  // Prepara i dati per i grafici
  const chartData = last12MonthsKeys.map((month) => {
    const data = monthlyTrends[month];
    let d = new Date(month + '-01');
    if (isNaN(d.getTime())) return null;
    return {
      date: month,
      monthLabel: format(d, 'MMM', { locale: it }),
      distance: data ? data.distance / 1000 : 0,
      time: data ? data.time / 60 : 0,
      activities: data ? data.activities : 0,
      elevation: data ? data.elevation : 0,
    };
  }).filter(Boolean);

  // --- RECORD PERSONALI ---
  // Miglior tempo su distanze classiche
  const prDistances = [
    { label: "1 km", value: 1000 },
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "21 km", value: 21097 },
    { label: "42 km", value: 42195 },
  ];

  const personalBests = prDistances.map(d => {
    const best = getBestTimeForDistance(activities, d.value);
    return best
      ? {
          label: d.label,
          time: formatDuration(best.moving_time),
          date: best.start_date ? format(new Date(best.start_date), 'dd/MM/yyyy') : '',
          activity: best,
        }
      : null;
  }).filter(Boolean);

  // Distanza più lunga
  const longestRun = activities.filter(a => a.type === "Run").reduce((max, a) => (a.distance > (max?.distance || 0) ? a : max), null);
  // Maggior dislivello
  const maxElevation = activities.filter(a => a.type === "Run").reduce((max, a) => ((a.total_elevation_gain || 0) > ((max?.total_elevation_gain) || 0) ? a : max), null);

  // --- RECORD PERSONALI ALL TIME ---
  // Distanze standard (metri)
  const allTimeDistances = [
    { label: "400 m", value: 400 },
    { label: "Mezzo miglio", value: 804.67 },
    { label: "1 KM", value: 1000 },
    { label: "1 miglio", value: 1609.34 },
    { label: "2 miglia", value: 3218.68 },
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "15 KM", value: 15000 },
    { label: "10 miglia", value: 16093.4 },
    { label: "20 KM", value: 20000 },
    { label: "Mezza maratona", value: 21097 },
  ];

  // Nuova lista record all time con logica "smart"
  const allTimeRecords = allTimeDistances.map(d => {
    const best = getBestTimeForDistance(activities, d.value);
    return best
      ? {
          label: d.label,
          time: formatRecordTime(best.moving_time),
          date: best.start_date ? format(new Date(best.start_date), 'dd/MM/yyyy') : '',
          activity: best.activity,
          fromLap: best.fromLap
        }
      : { label: d.label, time: "–", date: "", activity: null, fromLap: false };
  });

  // Mostra avviso se almeno un record non è stato calcolato da lap
  const hasApproxRecords = allTimeRecords.some(r => r.time !== "–" && !r.fromLap);

  const fileInputRef = useRef(null);
  const [importLoading, setImportLoading] = React.useState(false);

  // Funzione di utilità per calcolare distanza totale da una traccia GeoJSON
  function getTotalDistance(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) {
      dist += haversine(coords[i - 1], coords[i]);
    }
    return dist;
  }

  // Handler per importazione GPX
  const handleImportGpx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImportLoading(true);
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const geojson = toGeoJSON.gpx(xml);
      if (!geojson.features.length) throw new Error("GPX non valido o senza traccia");
      const track = geojson.features[0];
      const coords = track.geometry.coordinates;
      const totalDistance = getTotalDistance(coords);
      const times = track.properties.coordTimes || [];
      const startDate = times[0] ? new Date(times[0]) : null;
      const endDate = times[times.length - 1] ? new Date(times[times.length - 1]) : null;
      const movingTime = startDate && endDate ? Math.round((endDate.getTime() - startDate.getTime()) / 1000) : null;
      // Conversione in streams
      const streams = geojsonToStreams(geojson);
      // Riepilogo dati trovati
      const info: Record<string, boolean> = streams?._info || {};
      const infoMsg = `Dati importati: ` +
        `${info["quota"] ? '✓ Quota' : '✗ Quota'} ` +
        `${info["fc"] ? '✓ FC' : '✗ FC'} ` +
        `${info["cadenza"] ? '✓ Cadenza' : '✗ Cadenza'} ` +
        `${info["potenza"] ? '✓ Potenza' : '✗ Potenza'}`;
      // Matching: cerca attività esistente per data e distanza simile
      const match = activities.find(a => {
        if (!a.start_date) return false;
        const aDate = new Date(a.start_date);
        const sameDay = Math.abs(Number(aDate) - Number(startDate ? startDate : 0)) < 1000 * 60 * 60 * 12; // 12h tolleranza
        const distClose = Math.abs(Number(a.distance || 0) - Number(totalDistance)) < 200; // 200m tolleranza
        return sameDay && distClose;
      });
      if (match) {
        // Se il GPX ha più dati (es. traccia, lap), aggiorna l'attività
        let updated = false;
        if (!match.detailed_data && coords.length > 10) {
          if (streams) {
            match.detailed_data = JSON.stringify(streams);
            updated = true;
          }
        }
        if (!match.moving_time && movingTime) {
          match.moving_time = movingTime;
          updated = true;
        }
        if (updated) {
          toast({ title: "Attività aggiornata", description: infoMsg });
        } else {
          toast({ title: "Nessuna modifica", description: "L'attività era già completa o identica." });
        }
      } else {
        // Nuova attività
        const newActivity = {
          id: Date.now(),
          strava_activity_id: null,
          user_id: null,
          name: file.name.replace(/\.gpx$/i, ""),
          distance: totalDistance,
          moving_time: movingTime,
          elapsed_time: movingTime,
          type: "Run",
          start_date: startDate ? startDate.toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          detailed_data: JSON.stringify(streams),
        };
        activities.push(newActivity);
        toast({ title: "Nuova attività importata", description: infoMsg });
      }
    } catch (e) {
      toast({ title: "Errore importazione GPX", description: e.message || "Errore sconosciuto", variant: "destructive" });
    }
    setImportLoading(false);
    event.target.value = null;
  };

  if (isLoadingUser) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Caricamento dati utente...</p>
      </div>
    );
  }

  if (userError && !user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>
        <p>Errore nel caricamento dei dati utente. Riprova più tardi.</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoadingStatsRun || isLoadingTrendsRun) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Le tue analisi di corsa e insight sulle performance
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Le tue analisi di corsa e insight sulle performance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Button 
            onClick={handleSyncAll} 
            disabled={isSyncing || isAutoSyncing || (lastSyncError && lastSyncError.includes('Rate limit'))}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizzazione...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Strava
              </>
            )}
          </Button>
          {isAutoSyncing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sincronizzazione automatica in corso...</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={importLoading}
          >
            {importLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importazione...
              </>
            ) : (
              <>Importa GPX</>
            )}
          </Button>
          <input
            type="file"
            accept=".gpx"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportGpx}
          />
        </div>
      </div>

      {/* Error Messages */}
      {(lastSyncError || syncError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore di Sincronizzazione</AlertTitle>
          <AlertDescription>
            {lastSyncError || syncError?.message || 'Errore durante la sincronizzazione'}
            {lastSyncError && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualSync}
                  disabled={isSyncing || isAutoSyncing}
                >
                  Riprova
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Distanza Totale"
          value={statsRun ? formatDistance(statsRun.total_distance) : "0"}
          unit="km"
          change={12.5}
          icon={MapPin}
          variant="primary"
        />
        <MetricCard
          title="Tempo Totale"
          value={statsRun ? formatDuration(statsRun.total_time) : "0"}
          unit="ore"
          change={8.2}
          icon={Clock}
          variant="secondary"
        />
        <MetricCard
          title="Ritmo Medio"
          value={statsRun ? formatPace(statsRun.average_pace) : "0"}
          unit="min/km"
          change={-2.1}
          icon={Activity}
          variant="success"
        />
        <MetricCard
          title="Attività"
          value={statsRun?.total_activities.toString() || "0"}
          unit="corse"
          change={15.0}
          icon={Zap}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      {chartData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard 
            title="Distanza Mensile (solo corse)" 
            description="Distanza percorsa per mese negli ultimi 12 mesi"
          >
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#distanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          <ChartCard 
            title="Corse mensili" 
            description="Numero di corse per mese (ultimi 12 mesi)"
          >
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fontSize: 14 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                    domain={[0, 30]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="activities"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </div>
      ) : (
        <ChartCard title="Grafici" description="I grafici appariranno qui dopo la sincronizzazione">
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun dato per i grafici</p>
            <p className="text-sm">Sincronizza con Strava per vedere i tuoi progressi</p>
          </div>
        </ChartCard>
      )}

      {/* Recent Achievements & Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        <ChartCard title="Record Personali Recenti" className="md:col-span-2">
          <div className="space-y-4">
            {statsRun && statsRun.total_activities > 0 ? (
              <div>
                {personalBests.length === 0 && !longestRun && !maxElevation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun record personale trovato</p>
                    <p className="text-sm">Continua a correre per sbloccare i tuoi PR!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {personalBests.map((pr, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">{pr.label}</span>
                          <div>
                            <p className="font-medium">{pr.time}</p>
                            <p className="text-xs text-muted-foreground">{pr.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {longestRun && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">Lungh.</span>
                          <div>
                            <p className="font-medium">{formatDistance(longestRun.distance)} km</p>
                            <p className="text-xs text-muted-foreground">{longestRun.start_date ? format(new Date(longestRun.start_date), 'dd/MM/yyyy') : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {maxElevation && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">Disl.</span>
                          <div>
                            <p className="font-medium">{maxElevation.total_elevation_gain} m</p>
                            <p className="text-xs text-muted-foreground">{maxElevation.start_date ? format(new Date(maxElevation.start_date), 'dd/MM/yyyy') : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna attività ancora</p>
                <p className="text-sm">Sincronizza con Strava per iniziare</p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Migliori Prestazioni (All Time)" className="md:col-span-2">
          <div className="overflow-x-auto">
            {hasApproxRecords && (
              <div className="text-xs text-warning mb-2">Alcuni record sono calcolati in modo approssimativo (attività intera, non split/lap come su Strava).</div>
            )}
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Distanza</th>
                  <th className="text-left py-2 px-2">Tempo</th>
                  <th className="text-left py-2 px-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {allTimeRecords.map((rec, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{rec.label}</td>
                    <td className="py-2 px-2">{rec.time}</td>
                    <td className="py-2 px-2 text-muted-foreground">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}