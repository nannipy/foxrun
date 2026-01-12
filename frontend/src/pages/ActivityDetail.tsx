import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService, Activity } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { formatDistance, formatDuration, formatPace, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { MapContainer, TileLayer, Polyline as LeafletPolyline } from "react-leaflet";
import polyline from "@mapbox/polyline";
import { ChartCard } from "@/components/ChartCard";
import {
  ChartContainer
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import { gpx as toGeoJSON } from "@tmcw/togeojson";
import { LatLngExpression } from "leaflet";

// Funzione per formattare il ritmo in mm:ss/km
function formatPaceMinutes(pace: number) {
  if (!pace || pace === Infinity) return "-";
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

// Config per ChartContainer (stile dashboard)
const chartConfig = {
  quota: { label: "Altitudine", color: "hsl(var(--primary))" },
  velocita: { label: "Velocità (km/h)", color: "#43a047" },
  ritmo: { label: "Ritmo (min/km)", color: "#1976d2" },
};

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id;

  const [track, setTrack] = useState<[number, number][]>([]);
  const [streams, setStreams] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [gpxError, setGpxError] = useState<string | null>(null);

  const handleGpxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGpxError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("File selezionato", file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parser = new window.DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const geojson = toGeoJSON(xml);
        console.log("GeoJSON", geojson);
        console.log("Feature", geojson.features[0]);
        console.log("Coordinates", geojson.features[0]?.geometry?.coordinates);
        if (!geojson.features || geojson.features.length === 0) {
          setGpxError("Nessun tracciato trovato nel file GPX.");
          return;
        }
        const coordinates = geojson.features[0]?.geometry?.coordinates || [];
        if (!coordinates.length) {
          setGpxError("Tracciato GPX non valido.");
          return;
        }
        const trackFromGpx = coordinates.map((c: number[]) => [c[1], c[0]]).filter(pt => pt[0] && pt[1]);
        setTrack(trackFromGpx);

        // Estrai altitudine, tempo e distanza
        const altitudes: (number|null)[] = [];
        const times: (number|null)[] = [];
        const distances: (number|null)[] = [];
        let startTime: number | null = null;
        let lastLat: number | null = null;
        let lastLng: number | null = null;
        let totalDistance = 0;
        coordinates.forEach((c: any, i: number) => {
          altitudes.push(c[2] || null);
          let t = null;
          if (geojson.features[0]?.properties?.coordTimes && geojson.features[0].properties.coordTimes[i]) {
            t = new Date(geojson.features[0].properties.coordTimes[i]).getTime() / 1000;
            if (startTime === null) startTime = t;
            times.push(t - (startTime ?? 0));
          } else {
            times.push(null);
          }
          if (i > 0 && lastLat !== null && lastLng !== null) {
            const R = 6371000;
            const dLat = (c[1] - lastLat) * Math.PI / 180;
            const dLng = (c[0] - lastLng) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lastLat * Math.PI/180) * Math.cos(c[1] * Math.PI/180) * Math.sin(dLng/2) * Math.sin(dLng/2);
            const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            totalDistance += d;
          }
          distances.push(totalDistance);
          lastLat = c[1];
          lastLng = c[0];
        });

        // Estrai heart rate, cadenza, velocità, potenza
        const trkpts = Array.from(xml.getElementsByTagName("trkpt"));
        const heartRates: (number|null)[] = [];
        const cadences: (number|null)[] = [];
        const speeds: (number|null)[] = [];
        const powers: (number|null)[] = [];
        trkpts.forEach((pt, i) => {
          // Cerca sia <hr> che <gpxtpx:hr>
          let hr = null;
          const hrEl = pt.getElementsByTagNameNS("*", "hr")[0];
          if (hrEl) {
            hr = Number(hrEl.textContent);
          } else {
            // Cerca anche altri possibili tag
            const ext = pt.getElementsByTagName("extensions")[0];
            if (ext) {
              // Prova vari selettori
              const hrAlt = ext.querySelector("hr, gpxtpx\\:hr, ns3\\:hr, ns2\\:hr, heartrate");
              if (hrAlt) hr = Number(hrAlt.textContent);
            }
          }
          heartRates.push(hr);

          // Cadence (spm)
          const cadEl = pt.getElementsByTagNameNS("*", "cad")[0];
          cadences.push(cadEl ? Number(cadEl.textContent) : null);

          // Speed (m/s)
          const speedEl = pt.getElementsByTagNameNS("*", "speed")[0];
          speeds.push(speedEl ? Number(speedEl.textContent) : null);

          // Power (W)
          const powerEl = pt.getElementsByTagNameNS("*", "power")[0];
          powers.push(powerEl ? Number(powerEl.textContent) : null);
        });

        console.log("Heart rates estratti:", heartRates);

        setStreams((prev: any) => ({
          ...prev,
          altitude: { data: altitudes },
          time: { data: times },
          distance: { data: distances },
          heartrate: { data: heartRates },
          cadence: { data: cadences },
          velocity_smooth: { data: speeds },
          watts: { data: powers },
        }));
      } catch (err) {
        setGpxError("Errore durante il parsing del file GPX.");
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("ID attività non valido");
        if (!userId) throw new Error("Utente non autenticato");
        const data = await apiService.getActivityDetail(userId, Number(id));
        setActivity(data);
        if (data.map_polyline) {
          setTrack(polyline.decode(data.map_polyline));
        } else if (data.summary_polyline) {
          setTrack(polyline.decode(data.summary_polyline));
        }
        if (data.detailed_data) {
          try {
            setStreams(JSON.parse(data.detailed_data));
          } catch (e) {
            setStreams(null);
          }
        }
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dell'attività");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id, userId]);

  const chartData = useMemo(() => {
    const arr: any[] = [];
    if (streams && streams.distance && streams.distance.data) {
      const n = streams.distance.data.length;
      for (let i = 0; i < n; i++) {
        // Normalizza la velocità: se è in m/s (GPX), converti in km/h
        let velocita = streams.velocity_smooth?.data?.[i];
        if (velocita != null && !isNaN(velocita)) {
          // Se la velocità è troppo bassa (< 20), probabilmente è in m/s (GPX)
          if (velocita < 20) {
            velocita = velocita * 3.6;
          }
        } else {
          velocita = null;
        }
        // Calcola il ritmo in min/km solo se la velocità è valida
        let ritmo = null;
        if (velocita && velocita > 0.5) {
          ritmo = 60 / velocita;
        }
        // Quota
        let quota = streams.altitude?.data?.[i];
        if (quota == null || isNaN(quota)) quota = null;
        arr.push({
          distanza: streams.distance?.data?.[i] ?? null,
          quota,
          velocita,
          ritmo,
          fc: streams.heartrate?.data?.[i] ?? null,
          cadenza: streams.cadence?.data?.[i] ?? null,
          potenza: streams.watts?.data?.[i] ?? null,
          tempo: streams.time?.data?.[i] ?? null,
        });
      }
    }
    // Filtra punti completamente nulli o senza distanza
    return arr.filter(d => d.distanza != null && !isNaN(d.distanza));
  }, [streams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <span>Caricamento attività...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <span>{error}</span>
        <Button onClick={() => navigate(-1)} className="mt-4"><ArrowLeft className="mr-2" /> Torna indietro</Button>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center"><ArrowLeft className="mr-2" /> Torna alle attività</Button>
      <div className="mb-4">
        <Button onClick={() => fileInputRef.current?.click()}>Importa GPX</Button>
        <input
          type="file"
          accept=".gpx"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleGpxUpload}
        />
        {gpxError && <div className="text-red-500 mt-2">{gpxError}</div>}
      </div>
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>{activity.name}</CardTitle>
          <div className="text-muted-foreground text-sm">{formatDate(activity.start_date)} - {activity.type}</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <b>Distanza:</b> {formatDistance(activity.distance)} km
            </div>
            <div>
              <b>Tempo:</b> {formatDuration(activity.moving_time)}
            </div>
            <div>
              <b>Ritmo:</b> {activity.average_speed ? formatPaceMinutes((1000 / activity.average_speed) / 60) : "-"}
            </div>
            <div>
              <b>Dislivello:</b> {activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)} m` : "-"}
            </div>
            <div>
              <b>Frequenza cardiaca media:</b> {activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "-"}
            </div>
            <div>
              <b>Velocità max:</b> {activity.max_speed ? `${activity.max_speed.toFixed(2)} m/s` : "-"}
            </div>
            <div>
              <b>Tipo:</b> {activity.type}
            </div>
            <div>
              <b>Data:</b> {formatDate(activity.start_date)}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📍 Tracciato su mappa</CardTitle>
        </CardHeader>
        <CardContent>
          {track.length > 0 ? (
            <MapContainer
              center={track[0] as LatLngExpression}
              zoom={14}
              style={{ height: 300, width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LeafletPolyline positions={track} pathOptions={{ color: "#1976d2", weight: 4 }} />
            </MapContainer>
          ) : (
            <div className="text-muted-foreground">Nessun tracciato disponibile</div>
          )}
        </CardContent>
      </Card>
      
      {/* Tabella riepilogativa dettagliata */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Riepilogo attività</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <tbody>
              <tr>
                <td className="font-semibold pr-2">Tipo attività</td>
                <td>{activity.type || "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Inizio</td>
                <td>{activity.start_date ? formatDate(activity.start_date) : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Fine</td>
                <td>
                  {activity.start_date && activity.elapsed_time
                    ? formatDate(new Date(new Date(activity.start_date).getTime() + activity.elapsed_time * 1000).toISOString())
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Tempo totale</td>
                <td>{activity.elapsed_time ? formatDuration(activity.elapsed_time) : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Distanza</td>
                <td>{formatDistance(activity.distance)} km</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Dislivello</td>
                <td>{activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)} m` : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Velocità media</td>
                <td>{activity.average_speed ? (activity.average_speed * 3.6).toFixed(2) + " km/h" : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Velocità max</td>
                <td>{activity.max_speed ? (activity.max_speed * 3.6).toFixed(2) + " km/h" : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">FC media</td>
                <td>{activity.average_heartrate ? `${Math.round(activity.average_heartrate)} bpm` : "-"}</td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">FC max</td>
                <td>
                  {streams?.heartrate?.data
                    ? Math.max(...streams.heartrate.data).toFixed(0) + " bpm"
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Cadenza media</td>
                <td>
                  {streams?.cadence?.data
                    ? (
                        streams.cadence.data.reduce((a: number, b: number) => a + b, 0) /
                        streams.cadence.data.length
                      ).toFixed(0) + " spm"
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Cadenza max</td>
                <td>
                  {streams?.cadence?.data
                    ? Math.max(...streams.cadence.data).toFixed(0) + " spm"
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Potenza media</td>
                <td>
                  {streams?.watts?.data
                    ? (
                        streams.watts.data.reduce((a: number, b: number) => a + b, 0) /
                        streams.watts.data.length
                      ).toFixed(0) + " W"
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-semibold pr-2">Potenza max</td>
                <td>
                  {streams?.watts?.data
                    ? Math.max(...streams.watts.data).toFixed(0) + " W"
                    : "-"}
                </td>
              </tr>
              {/* Tempi migliori su distanze, se disponibili */}
              {streams?.bests && (
                <>
                  <tr>
                    <td className="font-semibold pr-2">Best 1K</td>
                    <td>
                      {streams.bests["Best 1K"]
                        ? formatDuration(streams.bests["Best 1K"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best Mile</td>
                    <td>
                      {streams.bests["Best Mile"]
                        ? formatDuration(streams.bests["Best Mile"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best 5K</td>
                    <td>
                      {streams.bests["Best 5K"]
                        ? formatDuration(streams.bests["Best 5K"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best 10K</td>
                    <td>
                      {streams.bests["Best 10K"]
                        ? formatDuration(streams.bests["Best 10K"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best 15K</td>
                    <td>
                      {streams.bests["Best 15K"]
                        ? formatDuration(streams.bests["Best 15K"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best Half Marathon</td>
                    <td>
                      {streams.bests["Best Half Marathon"]
                        ? formatDuration(streams.bests["Best Half Marathon"])
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2">Best Marathon</td>
                    <td>
                      {streams.bests["Best Marathon"]
                        ? formatDuration(streams.bests["Best Marathon"])
                        : "-"}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="⛰️ Altimetria" description="Profilo altimetrico (quota vs distanza)">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            {chartData.length > 0 && chartData.some(d => d.quota !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="distanza" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v ? (v/1000).toFixed(1) + ' km' : ''} 
                  />
                  <YAxis 
                    dataKey="quota" 
                    unit=" m" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip formatter={(v: any) => v !== null ? v.toFixed(1) : "-"} labelFormatter={v => `Distanza: ${(v/1000).toFixed(2)} km`} />
                  <Area
                    type="monotone"
                    dataKey="quota"
                    stroke="#ff9800"
                    fillOpacity={1}
                    fill="url(#altitudeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="text-muted-foreground">Dati altimetrici non disponibili</div>}
          </ChartContainer>
        </ChartCard>
        <ChartCard title="🚀 Velocità" description="Andamento velocità (km/h) su distanza">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            {chartData.length > 0 && chartData.some(d => d.velocita !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocitaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#43a047" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#43a047" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="distanza" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v ? (v/1000).toFixed(1) + ' km' : ''} 
                  />
                  <YAxis 
                    dataKey="velocita" 
                    unit=" km/h" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip formatter={(v: any) => v !== null ? v.toFixed(2) : "-"} labelFormatter={v => `Distanza: ${(v/1000).toFixed(2)} km`} />
                  <Area
                    type="monotone"
                    dataKey="velocita"
                    stroke="#43a047"
                    fillOpacity={1}
                    fill="url(#velocitaGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="text-muted-foreground">Dati velocità non disponibili</div>}
          </ChartContainer>
        </ChartCard>
        <ChartCard title="⏱️ Passo" description="Andamento passo (min/km) su distanza">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            {chartData.length > 0 && chartData.some(d => d.ritmo !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ritmoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="distanza" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v ? (v/1000).toFixed(1) + ' km' : ''} 
                  />
                  <YAxis 
                    dataKey="ritmo" 
                    unit=" min/km" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip 
                    formatter={(v: any) => v && v > 0 ? formatPaceMinutes(v) : "-"} 
                    labelFormatter={v => `Distanza: ${(v/1000).toFixed(2)} km`} 
                  />
                  <Area
                    type="monotone"
                    dataKey="ritmo"
                    stroke="#1976d2"
                    fillOpacity={1}
                    fill="url(#ritmoGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="text-muted-foreground">Dati passo non disponibili</div>}
          </ChartContainer>
        </ChartCard>
        <ChartCard title="❤️ Frequenza cardiaca" description="Battito cardiaco vs distanza">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            {chartData.length > 0 && chartData.some(d => d.fc !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fcGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e53935" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e53935" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="distanza" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v ? (v/1000).toFixed(1) + ' km' : ''} 
                  />
                  <YAxis 
                    dataKey="fc" 
                    unit=" bpm" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip formatter={(v: any) => v !== null ? v.toFixed(0) : "-"} labelFormatter={v => `Distanza: ${(v/1000).toFixed(2)} km`} />
                  <Area
                    type="monotone"
                    dataKey="fc"
                    stroke="#e53935"
                    fillOpacity={1}
                    fill="url(#fcGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="text-muted-foreground">Dati frequenza cardiaca non disponibili</div>}
          </ChartContainer>
        </ChartCard>
        <ChartCard title="🔋 Potenza" description="Watt vs distanza">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            {chartData.length > 0 && chartData.some(d => d.potenza !== null) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="potenzaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="distanza" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => v ? (v/1000).toFixed(1) + ' km' : ''} 
                  />
                  <YAxis 
                    dataKey="potenza" 
                    unit=" W" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip formatter={(v: any) => v !== null ? v.toFixed(0) : "-"} labelFormatter={v => `Distanza: ${(v/1000).toFixed(2)} km`} />
                  <Area
                    type="monotone"
                    dataKey="potenza"
                    stroke="#1976d2"
                    fillOpacity={1}
                    fill="url(#potenzaGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="text-muted-foreground">Dati potenza non disponibili</div>}
          </ChartContainer>
        </ChartCard>
      </div>
    </div>
  );
} 