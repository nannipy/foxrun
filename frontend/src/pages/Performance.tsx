import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Target,
  Zap,
  Heart,
  Activity,
  Clock,
  TrendingUp,
  Award,
  Timer,
  Gauge,
  Brain,
  Flame,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { formatPace } from "@/lib/utils";

// Mock data per analisi performance
const performanceZones = [
  { zone: "Zone 1", label: "Recovery", percentage: 45, color: "#22c55e", bpm: "< 142" },
  { zone: "Zone 2", label: "Aerobic", percentage: 30, color: "#3b82f6", bpm: "142-162" },
  { zone: "Zone 3", label: "Tempo", percentage: 15, color: "#f59e0b", bpm: "162-174" },
  { zone: "Zone 4", label: "Threshold", percentage: 8, color: "#f97316", bpm: "174-184" },
  { zone: "Zone 5", label: "VO2 Max", percentage: 2, color: "#ef4444", bpm: "> 184" },
];

const paceZones = [
  { zone: "Easy", percentage: 60, color: "#22c55e", pace: "5:00-5:30" },
  { zone: "Moderate", percentage: 25, color: "#f59e0b", pace: "4:30-5:00" },
  { zone: "Tempo", percentage: 10, color: "#f97316", pace: "4:00-4:30" },
  { zone: "Hard", percentage: 5, color: "#ef4444", pace: "< 4:00" },
];

const weeklyLoad = [
  { week: "W1", load: 320, fatigue: 280, fitness: 45, form: -15 },
  { week: "W2", load: 380, fatigue: 320, fitness: 52, form: -8 },
  { week: "W3", load: 420, fatigue: 360, fitness: 58, form: -2 },
  { week: "W4", load: 450, fatigue: 380, fitness: 65, form: 5 },
  { week: "W5", load: 480, fatigue: 400, fitness: 72, form: 12 },
  { week: "W6", load: 460, fatigue: 390, fitness: 75, form: 15 },
];

const radarData = [
  { metric: "Endurance", value: 85, max: 100 },
  { metric: "Speed", value: 72, max: 100 },
  { metric: "VO2 Max", value: 78, max: 100 },
  { metric: "Recovery", value: 68, max: 100 },
  { metric: "Consistency", value: 92, max: 100 },
  { metric: "Efficiency", value: 76, max: 100 },
];

const chartConfig = {
  load: { label: "Training Load", color: "hsl(var(--primary))" },
  fatigue: { label: "Fatigue", color: "hsl(var(--destructive))" },
  fitness: { label: "Fitness", color: "hsl(var(--success))" },
  form: { label: "Form", color: "hsl(var(--secondary))" },
};

export default function Performance() {
  const { user } = useAuth();
  const { activities, isLoadingActivities } = useActivities(user?.id || null, 'year');
  const [timeRange, setTimeRange] = useState("4weeks");

  // --- AGGREGAZIONE DATI REALI ---
  // Zone di frequenza cardiaca (esempio: 5 zone)
  const hrZones = [
    { label: "Recovery", min: 0, max: 142, color: "#22c55e" },
    { label: "Aerobic", min: 142, max: 162, color: "#3b82f6" },
    { label: "Tempo", min: 162, max: 174, color: "#f59e0b" },
    { label: "Threshold", min: 174, max: 184, color: "#f97316" },
    { label: "VO2 Max", min: 184, max: 300, color: "#ef4444" },
  ];
  const hrZoneCounts = Array(hrZones.length).fill(0);
  let totalHrSamples = 0;
  let allHr = [];
  activities.forEach(a => {
    if (a.detailed_data) {
      try {
        const streams = JSON.parse(a.detailed_data);
        if (streams.heartrate && Array.isArray(streams.heartrate)) {
          allHr = allHr.concat(streams.heartrate);
          streams.heartrate.forEach(hr => {
            for (let i = 0; i < hrZones.length; i++) {
              if (hr >= hrZones[i].min && hr < hrZones[i].max) {
                hrZoneCounts[i]++;
                break;
              }
            }
            totalHrSamples++;
          });
        }
      } catch {}
    }
  });
  const performanceZones = hrZones.map((z, i) => ({
    zone: `Zone ${i+1}`,
    label: z.label,
    percentage: totalHrSamples ? Math.round((hrZoneCounts[i] / totalHrSamples) * 100) : 0,
    color: z.color,
    bpm: i === 0 ? `< ${hrZones[1].min}` : i === hrZones.length-1 ? `> ${hrZones[i].min}` : `${z.min}-${z.max}`
  }));

  // Zone di ritmo (pace)
  const paceZonesDef = [
    { zone: "Easy", min: 5.0, max: 5.5, color: "#22c55e", pace: "5:00-5:30" },
    { zone: "Moderate", min: 4.5, max: 5.0, color: "#f59e0b", pace: "4:30-5:00" },
    { zone: "Tempo", min: 4.0, max: 4.5, color: "#f97316", pace: "4:00-4:30" },
    { zone: "Hard", min: 0, max: 4.0, color: "#ef4444", pace: "< 4:00" },
  ];
  const paceZoneCounts = Array(paceZonesDef.length).fill(0);
  let totalPaceSamples = 0;
  let allPaces = [];
  activities.filter(a => a.type === "Run" && a.moving_time && a.distance).forEach(a => {
    const pace = (a.moving_time / 60) / (a.distance / 1000); // min/km
    allPaces.push(pace);
    for (let i = 0; i < paceZonesDef.length; i++) {
      if (pace >= paceZonesDef[i].min && pace < paceZonesDef[i].max) {
        paceZoneCounts[i]++;
        break;
      }
    }
    totalPaceSamples++;
  });
  const paceZones = paceZonesDef.map((z, i) => ({
    ...z,
    percentage: totalPaceSamples ? Math.round((paceZoneCounts[i] / totalPaceSamples) * 100) : 0
  }));

  // Carico settimanale (esempio: somma distanza, tempo, fitness fittizio)
  const weekly: Record<string, { load: number; fatigue: number; fitness: number; form: number; time: number; distance: number }> = {};
  activities.filter(a => a.type === "Run").forEach(a => {
    const d = new Date(a.start_date);
    const week = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + 6 - d.getDay()) / 7)).padStart(2, "0")}`;
    if (!weekly[week]) weekly[week] = { load: 0, fatigue: 0, fitness: 0, form: 0, time: 0, distance: 0 };
    weekly[week].load += a.distance / 1000;
    weekly[week].fatigue += a.moving_time / 60;
    weekly[week].fitness += (a.distance / 1000) * 0.2 + (a.moving_time / 60) * 0.1; // esempio
    weekly[week].form += (a.distance / 1000) * 0.05;
    weekly[week].time += a.moving_time / 3600;
    weekly[week].distance += a.distance / 1000;
  });
  const weeksOrder = Object.keys(weekly).sort();
  const weeklyLoad = weeksOrder.map(week => ({
    week,
    ...weekly[week]
  })).slice(-6); // ultime 6 settimane

  // Trova la prima settimana di giugno tra i dati disponibili
  const firstJuneWeekKey = weeksOrder.find(week => {
    const [year, w] = week.split('-W');
    const weekNum = parseInt(w, 10);
    const firstDayOfYear = new Date(Number(year), 0, 1);
    const firstDayOfWeek = new Date(firstDayOfYear.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
    return firstDayOfWeek.getMonth() === 5; // Giugno è 5 (0-based)
  });
  const firstJuneWeek = firstJuneWeekKey ? weekly[firstJuneWeekKey] : null;
  // Etichetta "1ª settimana di giugno"
  const juneLabel = firstJuneWeekKey ? "1ª settimana di giugno" : "";

  // Radar chart (esempio: endurance, speed, vo2max, recovery, consistency, efficiency)
  // Endurance: numero attività, Speed: miglior tempo 10K, Consistency: attività/settimana, Efficiency: ritmo medio
  const best10k = activities.filter(a => a.type === "Run" && a.distance >= 10000).reduce((min, a) => a.moving_time < min ? a.moving_time : min, Infinity);
  const avgPace = allPaces.length ? allPaces.reduce((a, b) => a + b, 0) / allPaces.length : 0;
  const radarData = [
    { metric: "Endurance", value: Math.min(100, activities.length * 2), max: 100 },
    { metric: "Speed", value: best10k !== Infinity ? Math.min(100, Math.round(10000 / (best10k / 60))) : 0, max: 100 },
    { metric: "VO2 Max", value: avgPace ? Math.round(15.3 * (10 / avgPace)) : 0, max: 100 }, // stimato
    { metric: "Recovery", value: allHr.length ? Math.round(100 - (allHr.reduce((a, b) => a + b, 0) / allHr.length - 40)) : 60, max: 100 }, // stima grossolana
    { metric: "Consistency", value: Math.min(100, Math.round((activities.length / 42) * 100)), max: 100 },
    { metric: "Efficiency", value: avgPace ? Math.round(100 - (avgPace - 4) * 20) : 75, max: 100 },
  ];

  // METRICHE GLOBALI
  const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000;
  const totalTime = activities.reduce((sum, a) => sum + (a.moving_time || 0), 0) / 3600;
  const totalRuns = activities.length;
  const vo2max = radarData[2].value;
  const trainingLoad = weeklyLoad.reduce((sum, w) => sum + w.load, 0);
  const performanceIndex = Math.round((vo2max + radarData[0].value + radarData[1].value + radarData[4].value + radarData[5].value) / 5);
  const recoveryScore = radarData[3].value;
  const weeklySummary = weeklyLoad.length ? weeklyLoad[weeklyLoad.length-1] : { time: 0, distance: 0 };

  if (isLoadingActivities) {
    return <div className="flex items-center justify-center h-64"><span>Caricamento dati...</span></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Analysis</h1>
          <p className="text-muted-foreground">
            Deep insights into your training zones, load, and athletic performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4weeks">4 Weeks</SelectItem>
              <SelectItem value="8weeks">8 Weeks</SelectItem>
              <SelectItem value="12weeks">12 Weeks</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Generate Report</Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="VO2 Max"
          value={vo2max ? vo2max.toFixed(1) : "-"}
          unit="ml/kg/min"
          change={0}
          icon={Gauge}
          variant="primary"
        />
        <MetricCard
          title="Training Load"
          value={trainingLoad ? trainingLoad.toFixed(0) : "-"}
          unit="km"
          change={0}
          icon={Zap}
          variant="secondary"
        />
        <MetricCard
          title="Performance Index"
          value={performanceIndex ? performanceIndex.toString() : "-"}
          unit="points"
          change={0}
          icon={Trophy}
          variant="success"
        />
        <MetricCard
          title="Recovery Score"
          value={recoveryScore ? `${recoveryScore}%` : "-"}
          change={0}
          icon={Heart}
          variant="warning"
        />
      </div>

      {/* Training Load Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Training Load & Fitness" description="Training stress balance over time">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyLoad} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="fitness"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="form"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Performance Radar" description="Multi-dimensional performance analysis">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Zone Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Heart Rate Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceZones.map((zone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.bpm}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{zone.percentage}%</span>
                  </div>
                  <Progress 
                    value={zone.percentage} 
                    className="h-2"
                    style={{ 
                      background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${zone.percentage}%, hsl(var(--muted)) ${zone.percentage}%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pace Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paceZones.map((zone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.zone}</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.pace}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{zone.percentage}%</span>
                  </div>
                  <Progress 
                    value={zone.percentage} 
                    className="h-2"
                    style={{ 
                      background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${zone.percentage}%, hsl(var(--muted)) ${zone.percentage}%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Training Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Strength</span>
                </div>
                <p className="text-sm">Excellent aerobic base development. Zone 2 training is well-balanced.</p>
              </div>
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Focus Area</span>
                </div>
                <p className="text-sm">Increase high-intensity training for speed development.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Recovery Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Resting HR</span>
                <Badge variant="success">{allHr.length ? Math.round(allHr.reduce((a, b) => a + b, 0) / allHr.length) + " bpm" : "-"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>HRV</span>
                <Badge variant="success">-</Badge> {/* Placeholder, serve dato reale */}
              </div>
              <div className="flex justify-between items-center">
                <span>Sleep Quality</span>
                <Badge variant="warning">-</Badge> {/* Placeholder, serve dato reale */}
              </div>
              <div className="flex justify-between items-center">
                <span>Stress Level</span>
                <Badge variant="success">-</Badge> {/* Placeholder, serve dato reale */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {firstJuneWeek ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{performanceIndex}</div>
                    <div className="text-sm text-muted-foreground">Performance Index</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{firstJuneWeek.time ? firstJuneWeek.time.toFixed(1) : "-"}h</div>
                      <div className="text-xs text-muted-foreground">Tempo totale</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{firstJuneWeek.distance ? firstJuneWeek.distance.toFixed(1) : "-"}km</div>
                      <div className="text-xs text-muted-foreground">Distanza</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <Badge variant="success" className="w-full justify-center">
                      {performanceIndex > 80 ? "Peak Fitness Achieved" : "Keep Improving!"}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">Nessun dato per la 1ª settimana di giugno</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}