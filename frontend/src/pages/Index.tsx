import { Layout } from "@/components/Layout";
import Dashboard from "./Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity } from "lucide-react";

const Index = () => {
  const { 
    user, 
    isLoadingUser, 
    isAuthenticated, 
    login, 
    isLoggingIn, 
    isHandlingCallback 
  } = useAuth();

  if (isLoadingUser || isHandlingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Run Analyzer</CardTitle>
            <CardDescription>
              Analizza le tue performance di corsa con dati dettagliati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Connetti il tuo account Strava per iniziare ad analizzare le tue attività di corsa
            </p>
            <Button 
              onClick={login} 
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connessione in corso...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Connetti con Strava
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              I tuoi dati rimangono privati e sicuri
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Index;
