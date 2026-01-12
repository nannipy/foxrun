import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Activities from "./pages/Activities";
import Trends from "./pages/Trends";
import Performance from "./pages/Performance";
import RoutesPage from "./pages/Routes";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import AuthCallback from "./pages/AuthCallback";
import ActivityDetail from "./pages/ActivityDetail";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/activities" element={<Layout><Activities /></Layout>} />
          <Route path="/trends" element={<Layout><Trends /></Layout>} />
          <Route path="/goals" element={<Layout><div className="p-6"><h1 className="text-2xl font-bold">Goals</h1><p className="text-muted-foreground">Coming soon...</p></div></Layout>} />
          <Route path="/performance" element={<Layout><Performance /></Layout>} />
          <Route path="/routes" element={<Layout><RoutesPage /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/auth/strava/callback" element={<AuthCallback />} />
          <Route path="/activity/:id" element={<Layout><ActivityDetail /></Layout>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
  
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
