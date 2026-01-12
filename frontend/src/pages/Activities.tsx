import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Zap,
  Loader2,
  RefreshCw,
  Bike,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { formatDistance, formatDuration, formatPace, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { apiService } from "@/lib/api";

// Funzione per calcolare le statistiche localmente
function getLocalStats(activities: any[]) {
  const filtered = activities.filter(a => a.distance > 0);
  const total_activities = filtered.length;
  const total_distance = filtered.reduce((sum, a) => sum + (a.distance || 0), 0);
  const total_time = filtered.reduce((sum, a) => sum + (a.moving_time || 0), 0);
  const total_elevation = filtered.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0);
  const average_pace = total_distance > 0 ? (total_time / 60) / (total_distance / 1000) : 0;
  // Nuovi conteggi
  const num_bike = activities.filter(a => a.type && a.type.toLowerCase() === 'ride').length;
  const num_tennis = activities.filter(a => a.type && a.type.toLowerCase() === 'workout').length;
  return { total_activities, total_distance, total_time, total_elevation, average_pace, num_bike, num_tennis };
}

// Utility per mappare il tipo attività
const mapActivityType = (type: string) => {
  if (!type) return "";
  if (type.toLowerCase() === "workout") return "tennis";
  return type.toLowerCase();
};

export default function Activities() {
  const { user } = useAuth();
  const {
    activities,
    stats,
    isLoadingActivities,
    isLoadingStats,
    syncActivities,
    isSyncing,
    totalActivities,
    refetchStats,
    refetchTrends
  } = useActivities(user?.id || null);
  
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // PAGINAZIONE
  const PAGE_SIZE = 100;
  const [page, setPage] = useState<number>(0);
  const [pagedActivities, setPagedActivities] = useState<Array<any>>([]);
  const [allLoaded, setAllLoaded] = useState<boolean>(false);
  const [allActivities, setAllActivities] = useState<Array<any>>([]);
  const [loadingAll, setLoadingAll] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Carica la pagina corrente
  useEffect(() => {
    const fetchPage = async () => {
      if (!user?.id) return;
      const res = await apiService.getUserActivities(user.id, { skip: page * PAGE_SIZE, limit: PAGE_SIZE });
      setPagedActivities(res.activities);
      setTotal(res.total);
    };
    fetchPage();
  }, [user?.id, page]);

  // Carica tutte le attività (per test)
  const handleLoadAll = async () => {
    if (!user?.id) return;
    setLoadingAll(true);
    let skip = 0;
    let all: any[] = [];
    let totalFetched = 0;
    let totalCount = 0;
    do {
      const res = await apiService.getUserActivities(user.id, { skip, limit: PAGE_SIZE });
      all = all.concat(res.activities);
      totalFetched += res.activities.length;
      totalCount = res.total;
      skip += PAGE_SIZE;
    } while (totalFetched < totalCount);
    setAllActivities(all);
    setAllLoaded(true);
    setLoadingAll(false);
    // Aggiorna stats e trends
    refetchStats();
    refetchTrends();
  };


  const filteredActivities = (allLoaded ? allActivities : pagedActivities).filter((activity) => {
    const mappedType = mapActivityType(activity.type);
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Se il filtro è "tennis", includi solo workout con "tennis" nel nome
    const matchesType = typeFilter === "all" ||
      (typeFilter === "tennis"
        ? (activity.type && activity.type.toLowerCase() === "workout" && activity.name.toLowerCase().includes("tennis"))
        : mappedType.includes(typeFilter.toLowerCase()));
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    const mappedType = mapActivityType(type);
    switch (mappedType) {
      case "run": return "bg-primary text-primary-foreground";
      case "ride": return "bg-secondary text-secondary-foreground";
      case "walk": return "bg-success text-success-foreground";
      case "tennis": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleViewActivity = (activityId: number) => {
    navigate(`/activity/${activityId}`);
  };

  // Scegli le statistiche da mostrare
  const localStats = allLoaded ? getLocalStats(allActivities) : getLocalStats(pagedActivities);

  // Aggiorna le stats ogni volta che cambia il numero di attività o l'utente
  useEffect(() => {
    if (user?.id) {
      refetchStats();
    }
  }, [user?.id, pagedActivities.length, allActivities.length]);

  if (isLoadingActivities || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 ">
          <h1 className="text-3xl font-bold text-foreground ">Attività</h1>
          <p className="text-muted-foreground">
            Tutte le tue attività di corsa e sessioni di allenamento
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Attività</h1>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        {/* Card attività totali */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.total_activities_all || 0}</p>
                <p className="text-sm text-muted-foreground">Attività totali</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card distanza totale */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <MapPin className="h-8 w-8 text-secondary" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats ? formatDistance(stats.total_distance) : "0"}</p>
                <p className="text-sm text-muted-foreground">Distanza Totale (km)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card tempo totale */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-success" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats ? formatDuration(stats.total_time) : "0"}</p>
                <p className="text-sm text-muted-foreground">Tempo Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card ritmo medio */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="h-8 w-8 text-warning" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats ? formatPace(stats.average_pace) : "0"}</p>
                <p className="text-sm text-muted-foreground">Ritmo Medio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card numero attività bici */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Bike className="h-8 w-8 text-info" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.num_bike || 0}</p>
                <p className="text-sm text-muted-foreground">Attività Bici</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card numero attività Tennis */}
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Heart className="h-8 w-8 text-pink-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats?.num_tennis || 0}</p>
                <p className="text-sm text-muted-foreground">Attività Tennis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card pt-6">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca attività..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo Attività" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i Tipi</SelectItem>
                <SelectItem value="run">Corsa</SelectItem>
                <SelectItem value="ride">Bici</SelectItem>
                <SelectItem value="walk">Camminata</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
              </SelectContent>
            </Select>
             {/* Paginazione */}
              {!allLoaded && (
                  <div className="flex gap-3 items-center justify-end">
                    <Button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} size="sm" variant="outline">Indietro</Button>
                    <span className="text-sm">Pagina {page + 1} / {Math.ceil(total / PAGE_SIZE) || 1}</span>
                    <Button onClick={() => setPage((p) => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total} size="sm" variant="outline">Avanti</Button>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>
      



      {/* Activities Table */}
      <Card className="bg-gradient-card">
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attività</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Distanza</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Ritmo</TableHead>
                  <TableHead>Dislivello</TableHead>
                  <TableHead>FC</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {activities.length === 0 ? (
                        <div>
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nessuna attività trovata</p>
                          <p className="text-sm">Sincronizza con Strava per iniziare</p>
                        </div>
                      ) : (
                        <div>
                          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nessuna attività corrisponde ai filtri</p>
                          <p className="text-sm">Prova a modificare i criteri di ricerca</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(activity.type)}>
                          {/* Mostra 'Tennis' se il tipo è workout */}
                          {mapActivityType(activity.type) === "tennis" ? "Tennis" : activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(activity.start_date)}
                      </TableCell>
                      <TableCell>
                        {formatDistance(activity.distance)}
                      </TableCell>
                      <TableCell>
                        {formatDuration(activity.moving_time)}
                      </TableCell>
                      <TableCell>
                        {activity.average_speed ? formatPace(1 / activity.average_speed * 1000) : "-"}
                      </TableCell>
                      <TableCell>
                        {activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)}m` : "-"}
                      </TableCell>
                      <TableCell>
                        {activity.average_heartrate ? `${Math.round(activity.average_heartrate)}bpm` : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewActivity(activity.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}