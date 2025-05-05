import { ArrowUp, ArrowDown } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
    text: string;
  };
  addButton?: ReactNode;
}

export default function MetricsCard({ title, value, icon, iconBgColor, change, addButton }: MetricsCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm p-6 min-h-[220px] w-full relative flex flex-col justify-between items-stretch border-2 border-accent/40 transition-all duration-300 hover:border-accent hover:bg-accent/10 hover:shadow-xl hover:scale-105"
    )}>
      <div className="flex justify-between items-start h-full">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-primary mt-1 font-mono">{value}</h3>
          {change && (
            <p className={cn(
              "mt-2 flex items-center text-sm", 
              change.type === "increase" ? "text-accent" : 
              change.type === "decrease" ? "text-red-500" : 
              "text-gray-500"
            )}>
              {change.type === "increase" ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : change.type === "decrease" ? (
                <ArrowDown className="h-4 w-4 mr-1" />
              ) : null}
              <span>{change.text}</span>
            </p>
          )}
        </div>
        <div className={cn("p-2 rounded-md", iconBgColor)}>
          {icon}
        </div>
      </div>
      {addButton && (
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 z-10 mb-1">
          {addButton}
        </div>
      )}
    </div>
  );
}
