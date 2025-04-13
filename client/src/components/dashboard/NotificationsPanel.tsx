import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "warning" | "error" | "success";
  time: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onViewAll: () => void;
}

export default function NotificationsPanel({ notifications, onMarkAllRead, onViewAll }: NotificationsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-primary font-inter">Notifications & Alerts</CardTitle>
          <button 
            className="text-secondary hover:text-secondary/90 text-sm font-medium focus:outline-none"
            onClick={onMarkAllRead}
          >
            Mark All Read
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={cn(
                "p-3 border-l-4 rounded-md", 
                notification.type === "warning" ? "bg-yellow-50 border-warning" : 
                notification.type === "error" ? "bg-red-50 border-red-500" : 
                "bg-green-50 border-accent"
              )}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {notification.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  ) : notification.type === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="ml-3">
                  <h4 className={cn(
                    "text-sm font-medium", 
                    notification.type === "warning" ? "text-yellow-800" : 
                    notification.type === "error" ? "text-red-800" : 
                    "text-green-800"
                  )}>
                    {notification.title}
                  </h4>
                  <p className={cn(
                    "text-xs mt-1", 
                    notification.type === "warning" ? "text-yellow-700" : 
                    notification.type === "error" ? "text-red-700" : 
                    "text-green-700"
                  )}>
                    {notification.message}
                  </p>
                  <p className={cn(
                    "text-xs mt-2", 
                    notification.type === "warning" ? "text-yellow-500" : 
                    notification.type === "error" ? "text-red-500" : 
                    "text-green-500"
                  )}>
                    {notification.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {notifications.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No notifications</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={onViewAll}
          >
            View All Notifications
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
