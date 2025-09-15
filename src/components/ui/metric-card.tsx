
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className
}: MetricCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground"
  };

  return (
    <Card className={cn("metric-card h-full", className)}>
      <CardContent className="p-3 sm:p-4 h-full">
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="flex flex-col justify-center min-w-0 flex-1 min-h-[60px]">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight line-clamp-1">
              {title}
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight line-clamp-1 my-1">
              {value}
            </p>
            <div className="min-h-[16px]">
              {change && (
                <p className={cn("text-xs leading-tight line-clamp-1", changeColors[changeType])}>
                  {change}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 p-1.5 sm:p-2 bg-primary/10 rounded-lg">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
