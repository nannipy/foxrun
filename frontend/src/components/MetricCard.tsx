import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "secondary" | "success" | "warning";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  change, 
  icon: Icon, 
  variant = "default",
  className 
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-primary border-primary/20 shadow-glow";
      case "secondary": 
        return "bg-gradient-secondary border-secondary/20";
      case "success":
        return "bg-gradient-to-br from-success/10 to-success/5 border-success/20";
      case "warning":
        return "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20";
      default:
        return "bg-gradient-card border-border/50";
    }
  };

  const getTextColor = () => {
    return variant === "primary" || variant === "secondary" 
      ? "text-white" 
      : "text-foreground";
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
      getVariantStyles(),
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className={cn(
            "h-8 w-8",
            variant === "primary" || variant === "secondary" 
              ? "text-white/90" 
              : "text-primary"
          )} />
          {change !== undefined && (
            <Badge 
              variant={change >= 0 ? "default" : "destructive"}
              className="text-xs"
            >
              {change >= 0 ? "+" : ""}{change.toFixed(1)}%
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            variant === "primary" || variant === "secondary" 
              ? "text-white/80" 
              : "text-muted-foreground"
          )}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold",
              getTextColor()
            )}>
              {value}
            </span>
            {unit && (
              <span className={cn(
                "text-sm font-medium",
                variant === "primary" || variant === "secondary" 
                  ? "text-white/70" 
                  : "text-muted-foreground"
              )}>
                {unit}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}