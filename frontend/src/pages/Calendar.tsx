import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Activity,
  Clock,
  MapPin,
  Bike,
  Zap,
  Timer,
  TrendingUp,
  Heart
} from "lucide-react";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";

const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

const plannedWorkouts = [
  { date: "2024-01-17", type: "tempo", name: "Tempo Run", plannedDistance: 8, plannedDuration: 36 },
  { date: "2024-01-19", type: "long", name: "Long Run", plannedDistance: 18, plannedDuration: 85 },
  { date: "2024-01-21", type: "speed", name: "5K Pace Intervals", plannedDistance: 10, plannedDuration: 45 },
  { date: "2024-01-24", type: "recovery", name: "Easy Recovery", plannedDistance: 6, plannedDuration: 30 },
];

const monthlyGoals = [
  { label: "Distance Goal", current: 72, target: 100, unit: "km" },
  { label: "Runs Goal", current: 8, target: 12, unit: "runs" },
  { label: "Training Days", current: 15, target: 20, unit: "days" },
];

const getActivityColor = (type: string) => {
  switch (type) {
    case "run": return "bg-primary";
    case "workout": return "bg-warning";
    case "long": return "bg-secondary";
    case "recovery": return "bg-success";
    case "speed": return "bg-destructive";
    case "tempo": return "bg-purple-500";
    case "cross": return "bg-blue-500";
    case "rest": return "bg-gray-400";
    default: return "bg-muted";
  }
};

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

const getActivityIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "run":
      return <Activity className="inline h-4 w-4 mr-1 text-primary" />;
    case "walk":
      return <Activity className="inline h-4 w-4 mr-1 text-success" />;
    case "workout":
      return <Zap className="inline h-4 w-4 mr-1 text-warning" />;
    case "tennis":
      return <Heart className="inline h-4 w-4 mr-1 text-pink-500" />;
    default:
      return <Activity className="inline h-4 w-4 mr-1 text-muted-foreground" />;
  }
};

export default function Calendar() {
  const { user } = useAuth();
  const { activities, isLoadingActivities, activitiesError } = useActivities(user?.id || null);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [view, setView] = useState("month");

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getActivitiesForDate = (day: number) => {
    // Filtra le attività reali per data (start_date in formato ISO)
    return activities.filter(activity => {
      if (!activity.start_date) return false;
      const activityDate = new Date(activity.start_date);
      const y = activityDate.getFullYear();
      const m = activityDate.getMonth();
      const d = activityDate.getDate();
      return y === selectedYear && m === selectedMonth && d === day;
    });
  };

  const getPlannedWorkoutsForDate = (day: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return plannedWorkouts.filter(workout => workout.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayActivities = getActivitiesForDate(day);
      const plannedWorkoutsForDay = getPlannedWorkoutsForDate(day);
      const isToday = day === currentDate.getDate() && 
                     selectedMonth === currentDate.getMonth() && 
                     selectedYear === currentDate.getFullYear();
      
      days.push(
        <div key={day} className={`p-2 min-h-[80px] border border-border rounded-lg ${
          isToday ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'
        } transition-colors`}>
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-primary' : 'text-foreground'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-1" title={`${activity.name} - ${activity.distance}m`}>
                {getActivityIcon(activity.type)}
                <span className="truncate text-xs">{activity.name}</span>
              </div>
            ))}
            {plannedWorkoutsForDay.map((workout, index) => (
              <div key={index} className="flex items-center gap-1 opacity-70" title={`Planned: ${workout.name} - ${workout.plannedDistance}km`}>
                {getActivityIcon(workout.type)}
                <span className="truncate text-xs italic">{workout.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  // Calcola le stats del mese corrente
  const monthActivities = activities.filter(activity => {
    if (!activity.start_date) return false;
    const d = new Date(activity.start_date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
  const totalDistance = monthActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalTime = monthActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
  const numRuns = monthActivities.length;
  const numBike = monthActivities.filter(a => a.type && a.type.toLowerCase() === 'ride').length;
  const numTennis = monthActivities.filter(a => a.type && a.type.toLowerCase() === 'workout').length;
  const runActivities = monthActivities.filter(a => a.type && a.type.toLowerCase() === 'run');
  const totalRunDistance = runActivities.reduce((sum, a) => sum + (a.distance || 0), 0);
  const totalRunTime = runActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0);
  const avgPace = totalRunDistance > 0 ? (totalRunTime / 60) / (totalRunDistance / 1000) : 0;
  
  if (isLoadingActivities) {
    return <div className="flex items-center justify-center h-64"><span>Caricamento attività...</span></div>;
  }
  if (activitiesError) {
    return <div className="flex items-center justify-center h-64 text-destructive"><span>Errore nel caricamento delle attività</span></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Training Calendar</h1>
          <p className="text-muted-foreground">
            Plan and track your training schedule
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Workout
          </Button>
        </div>
      </div>

      {/* Monthly Goals */}
      <div className="grid gap-4 md:grid-cols-3">
        {monthlyGoals.map((goal, index) => (
          <Card key={index} className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{goal.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Navigation */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthNames[selectedMonth]} {selectedYear}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>

      {/* Training Schedule & Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Upcoming Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plannedWorkouts.slice(0, 4).map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(workout.type)}
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{workout.plannedDistance}km</p>
                    <p className="text-xs text-muted-foreground">{workout.plannedDuration}min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              This Month's Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold">{formatDistance(totalDistance)}km</div>
                <div className="text-sm text-muted-foreground">Distance</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="text-2xl font-bold">{formatDuration(totalTime)}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <div className="text-2xl font-bold">{numRuns}</div>
                <div className="text-sm text-muted-foreground">Activities</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
                <div className="text-2xl font-bold">{avgPace ? formatPace(avgPace) : "-"}</div>
                <div className="text-sm text-muted-foreground">Avg Pace</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Bike className="h-6 w-6 text-info" />
                </div>
                <div className="text-2xl font-bold">{numBike}</div>
                <div className="text-sm text-muted-foreground">Bike</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold">{numTennis}</div>
                <div className="text-sm text-muted-foreground">Tennis</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Activity Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: "run", label: "Regular Run" },
              { type: "long", label: "Long Run" },
              { type: "speed", label: "Speed Work" },
              { type: "tempo", label: "Tempo Run" },
              { type: "recovery", label: "Recovery" },
              { type: "workout", label: "Workout" },
              { type: "cross", label: "Cross Training" },
              { type: "rest", label: "Rest Day" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getActivityColor(item.type)}`} />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Solid bars: Completed activities | Dashed bars: Planned workouts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}