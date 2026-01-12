import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MapPin,
  Route,
  Mountain,
  Clock,
  Activity,
  Star,
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  TrendingUp,
  Navigation,
  Compass,
} from "lucide-react";

// Mock data per i percorsi
const routes = [
  {
    id: 1,
    name: "Central Park Loop",
    distance: 10.2,
    elevation: 85,
    difficulty: "Easy",
    surface: "Asphalt",
    avgPace: "4:15",
    bestTime: "42:30",
    timesRun: 15,
    lastRun: "2024-01-15",
    rating: 5,
    description: "Classic NYC running route through Central Park",
    tags: ["Urban", "Park", "Popular"],
  },
  {
    id: 2,
    name: "Riverside Trail",
    distance: 8.7,
    elevation: 45,
    difficulty: "Easy",
    surface: "Trail",
    avgPace: "4:45",
    bestTime: "38:20",
    timesRun: 8,
    lastRun: "2024-01-12",
    rating: 4,
    description: "Scenic riverside trail with beautiful water views",
    tags: ["Nature", "Flat", "Scenic"],
  },
  {
    id: 3,
    name: "Hill Challenge Route",
    distance: 12.5,
    elevation: 320,
    difficulty: "Hard",
    surface: "Mixed",
    avgPace: "5:20",
    bestTime: "1:05:45",
    timesRun: 6,
    lastRun: "2024-01-10",
    rating: 4,
    description: "Challenging hill workout with significant elevation",
    tags: ["Hills", "Challenging", "Training"],
  },
  {
    id: 4,
    name: "Beach Boardwalk",
    distance: 6.0,
    elevation: 12,
    difficulty: "Easy",
    surface: "Boardwalk",
    avgPace: "4:00",
    bestTime: "23:45",
    timesRun: 12,
    lastRun: "2024-01-08",
    rating: 5,
    description: "Flat beachside run with ocean breeze",
    tags: ["Beach", "Flat", "Recovery"],
  },
  {
    id: 5,
    name: "Forest Loop",
    distance: 15.3,
    elevation: 180,
    difficulty: "Moderate",
    surface: "Trail",
    avgPace: "4:55",
    bestTime: "1:15:20",
    timesRun: 4,
    lastRun: "2024-01-05",
    rating: 5,
    description: "Long forest trail with moderate hills",
    tags: ["Forest", "Long", "Trail"],
  },
];

const routeStats = [
  { label: "Total Routes", value: "24", icon: Route },
  { label: "Favorite Routes", value: "8", icon: Star },
  { label: "Total Distance", value: "285km", icon: MapPin },
  { label: "Avg Elevation", value: "145m", icon: Mountain },
];

export default function Routes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || route.difficulty.toLowerCase() === difficultyFilter;
    const matchesSurface = surfaceFilter === "all" || route.surface.toLowerCase() === surfaceFilter;
    return matchesSearch && matchesDifficulty && matchesSurface;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-success text-success-foreground";
      case "moderate": return "bg-warning text-warning-foreground";
      case "hard": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-warning fill-warning" : "text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Routes</h1>
          <p className="text-muted-foreground">
            Explore and analyze your favorite running routes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export GPX
          </Button>
          <Button>
            <MapPin className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {routeStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Placeholder */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Route Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
            <div className="text-center">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Interactive route map</p>
              <p className="text-sm text-muted-foreground">Mapbox integration coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={surfaceFilter} onValueChange={setSurfaceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Surface" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surfaces</SelectItem>
                <SelectItem value="asphalt">Asphalt</SelectItem>
                <SelectItem value="trail">Trail</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="boardwalk">Boardwalk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>My Routes ({filteredRoutes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Elevation</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Surface</TableHead>
                  <TableHead>Best Time</TableHead>
                  <TableHead>Times Run</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">{route.description}</p>
                        <div className="flex gap-1 mt-1">
                          {route.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {route.distance} km
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4 text-muted-foreground" />
                        {route.elevation}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(route.difficulty)}>
                        {route.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{route.surface}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {route.bestTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{route.timesRun}x</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {renderStars(route.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Route Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Popular Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes
                .sort((a, b) => b.timesRun - a.timesRun)
                .slice(0, 3)
                .map((route, index) => (
                  <div key={route.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">{route.distance}km</p>
                      </div>
                    </div>
                    <Badge>{route.timesRun} runs</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Highest Rated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes
                .filter(route => route.rating === 5)
                .slice(0, 3)
                .map((route, index) => (
                  <div key={route.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex text-warning">
                        {renderStars(route.rating)}
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">{route.distance}km</p>
                      </div>
                    </div>
                    <Badge variant="success">Perfect</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}