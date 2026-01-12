import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Settings, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";
import { Link } from "react-router-dom";

export function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-gradient-card px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
              <img src="FOXRUN-logo.png" width={60} height={60} />
            <div>
              <h1 className="text-xl font-bold text-foreground">Foxrun</h1>
              <p className="text-sm text-muted-foreground">Performance Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <> 
            <UserAvatar user={user} size="sm" className="ring-2 ring-primary/20" showBadge={true} />
            </>
          ) : (
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              <Activity className="w-3 h-3 mr-1" />
              Non connesso
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}