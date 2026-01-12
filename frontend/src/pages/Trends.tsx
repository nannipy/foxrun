import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  MapPin,
  Zap,
  Target,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { formatPace, formatRecordTime, getBestTimeForDistance } from "@/lib/utils";

// Mock data per analisi trend approfondite
const performanceData = [
  { month: "Gen", distance: 120, time: 580, avgPace: 4.8, runs: 12, elevation: 850 },
  { month: "Feb", distance: 140, time: 620, avgPace: 4.4, runs: 14, elevation: 920 },
  { month: "Mar", distance: 165, time: 720, avgPace: 4.3, runs: 16, elevation: 1100 },
  { month: "Apr", distance: 180, time: 780, avgPace: 4.2, runs: 18, elevation: 1250 },
  { month: "Mag", distance: 195, time: 810, avgPace: 4.1, runs: 19, elevation: 1380 },
  { month: "Giu", distance: 210, time: 850, avgPace: 4.0, runs: 21, elevation: 1420 },
];

const paceDistribution = [
  { pace: "3:30-4:00", runs: 3, percentage: 12 },
  { pace: "4:00-4:30", runs: 8, percentage: 32 },
  { pace: "4:30-5:00", runs: 10, percentage: 40 },
  { pace: "5:00-5:30", runs: 3, percentage: 12 },
  { pace: "5:30+", runs: 1, percentage: 4 },
];

const weeklyIntensity = [
  { week: "W1", easy: 15, moderate: 8, hard: 2 },
  { week: "W2", easy: 18, moderate: 10, hard: 4 },
  { week: "W3", easy: 16, moderate: 9, hard: 3 },
  { week: "W4", easy: 20, moderate: 12, hard: 5 },
  { week: "W5", easy: 22, moderate: 14, hard: 6 },
  { week: "W6", easy: 19, moderate: 11, hard: 4 },
];

const personalRecords = [
  { distance: "1K", time: "3:25", date: "2024-01-10", trend: "up" },
  { distance: "5K", time: "19:45", date: "2024-01-08", trend: "up" },
  { distance: "10K", time: "42:30", date: "2024-01-05", trend: "up" },
  { distance: "21K", time: "1:35:20", date: "2023-12-15", trend: "down" },
  { distance: "42K", time: "3:25:45", date: "2023-11-12", trend: "down" },
];

const chartConfig = {
  distance: { label: "Distance (km)", color: "hsl(var(--primary))" },
  time: { label: "Time (min)", color: "hsl(var(--secondary))" },
  avgPace: { label: "Avg Pace", color: "hsl(var(--accent))" },
  runs: { label: "Runs", color: "hsl(var(--success))" },
  elevation: { label: "Elevation (m)", color: "hsl(var(--warning))" },
  easy: { label: "Easy", color: "hsl(var(--success))" },
  moderate: { label: "Moderate", color: "hsl(var(--warning))" },
  hard: { label: "Hard", color: "hsl(var(--destructive))" },
};

export default function Trends() {
  const { user } = useAuth();
  const { activities, isLoadingActivities } = useActivities(user?.id || null, 'year');
  const [timeRange, setTimeRange] = useState("6months");
  const [metric, setMetric] = useState("distance");

  // --- AGGREGAZIONE DATI REALI ---
  // Raggruppa per mese (YYYY-MM)
  const monthly: Record<string, { distance: number; time: number; runs: number; elevation: number; paceSum: number; paceCount: number }> = {};
  activities.filter(a => a.type === "Run").forEach(a => {
    const d = new Date(a.start_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
    if (!monthly[key]) monthly[key] = { distance: 0, time: 0, runs: 0, elevation: 0, paceSum: 0, paceCount: 0 };
    monthly[key].distance += a.distance / 1000;
    monthly[key].time += a.moving_time / 60;
    monthly[key].runs += 1;
    monthly[key].elevation += a.total_elevation_gain || 0;
    if (a.moving_time && a.distance) {
      monthly[key].paceSum += a.moving_time / (a.distance / 1000);
      monthly[key].paceCount += 1;
    }
  });
  const monthsOrder = Object.keys(monthly).sort((a, b) => a.localeCompare(b));
  const performanceData = monthsOrder.map(key => {
    const d = new Date(key + "-01");
    return {
      month: format(d, "MMM yyyy", { locale: it }),
      distance: Math.round(monthly[key].distance),
      time: Math.round(monthly[key].time),
      avgPace: monthly[key].paceCount ? (monthly[key].paceSum / monthly[key].paceCount) / 60 : 0,
      runs: monthly[key].runs,
      elevation: Math.round(monthly[key].elevation)
    };
  });

  // --- CALCOLO PERSONAL RECORDS REALI ---
  const prDistances = [
    { label: "1K", meters: 1000 },
    { label: "5K", meters: 5000 },
    { label: "10K", meters: 10000 },
    { label: "21K", meters: 21097 },
    { label: "42K", meters: 42195 },
  ];
  const personalRecords = prDistances.map(pr => {
    const best = getBestTimeForDistance(activities, pr.meters);
    return best
      ? {
          distance: pr.label,
          time: formatRecordTime(best.moving_time),
          date: format(new Date(best.start_date), "yyyy-MM-dd"),
          trend: "up", // TODO: calcolare trend reale se vuoi
        }
      : {
          distance: pr.label,
          time: "-",
          date: "-",
          trend: "down",
        };
  });

  // Distribuzione dei ritmi (pace)
  const paceBuckets = [
    { label: "3:30-4:00", min: 3.5, max: 4.0 },
    { label: "4:00-4:30", min: 4.0, max: 4.5 },
    { label: "4:30-5:00", min: 4.5, max: 5.0 },
    { label: "5:00-5:30", min: 5.0, max: 5.5 },
    { label: "5:30+", min: 5.5, max: 99 }
  ];
  const paceDistribution = paceBuckets.map(b => {
    const runs = activities.filter(a => a.type === "Run" && a.moving_time && a.distance && (a.moving_time / (a.distance / 1000)) / 60 >= b.min && (a.moving_time / (a.distance / 1000)) / 60 < b.max);
    return {
      pace: b.label,
      runs: runs.length,
      percentage: activities.length ? Math.round((runs.length / activities.length) * 100) : 0
    };
  });

  // Intensità settimanale (mock se non ci sono dati sufficienti)
  // TODO: puoi calcolare da activities se hai info su zone/FC
  const weeklyIntensity = [
    { week: "W1", easy: 15, moderate: 8, hard: 2 },
    { week: "W2", easy: 18, moderate: 10, hard: 4 },
    { week: "W3", easy: 16, moderate: 9, hard: 3 },
    { week: "W4", easy: 20, moderate: 12, hard: 5 },
    { week: "W5", easy: 22, moderate: 14, hard: 6 },
    { week: "W6", easy: 19, moderate: 11, hard: 4 },
  ];

  if (isLoadingActivities) {
    return <div className="flex items-center justify-center h-64"><span>Caricamento dati...</span></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Trends Analysis</h1>
          <p className="text-muted-foreground">
            Deep dive into your performance patterns and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export Analysis</Button>
        </div>
      </div>

      {/* Key Trend Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Distance Trend"
          value="+18%"
          unit="vs last period"
          change={18.2}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Pace Improvement"
          value="-12s"
          unit="per km"
          change={-2.5}
          icon={Activity}
          variant="primary"
        />
        <MetricCard
          title="Consistency"
          value="87%"
          unit="weekly"
          change={5.8}
          icon={Target}
          variant="secondary"
        />
        <MetricCard
          title="Training Load"
          value="142"
          unit="TSS"
          change={8.9}
          icon={Zap}
          variant="warning"
        />
      </div>

      {/* Main Performance Chart */}
      <ChartCard 
        title="6-Month Performance Evolution" 
        description="Track your progress across multiple metrics"
      >
        <div className="mb-4">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="avgPace">Average Pace</SelectItem>
              <SelectItem value="runs">Number of Runs</SelectItem>
              <SelectItem value="elevation">Elevation Gain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                yAxisId="left"
                dataKey={metric} 
                fill={chartConfig[metric as keyof typeof chartConfig]?.color} 
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgPace"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>

      {/* Analysis Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pace Distribution */}
        <ChartCard title="Pace Distribution" description="Where you spend most of your running time">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paceDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="pace" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="runs" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        {/* Training Intensity */}
        <ChartCard title="Training Intensity" description="Weekly intensity distribution">
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyIntensity} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="easy"
                  stackId="1"
                  stroke="hsl(var(--success))"
                  fill="hsl(var(--success))"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="moderate"
                  stackId="1"
                  stroke="hsl(var(--warning))"
                  fill="hsl(var(--warning))"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="hard"
                  stackId="1"
                  stroke="hsl(var(--destructive))"
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        {/* Personal Records */}
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalRecords.map((pr, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-12 text-center">
                      {pr.distance}
                    </Badge>
                    <div>
                      <p className="font-medium">{pr.time}</p>
                      <p className="text-xs text-muted-foreground">{pr.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {pr.trend === "up" ? (
                      <ArrowUp className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-success">Strengths</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  Consistent weekly mileage improvement (+18%)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  Strong pace progression over 6 months
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  Good training intensity distribution
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-warning">Areas for Improvement</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  Increase high-intensity training volume
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  Focus on longer distance PRs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  Maintain consistency during peak weeks
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}