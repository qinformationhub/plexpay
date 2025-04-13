import { useState } from "react";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "warning" | "error" | "success";
  time: string;
}

interface TopbarProps {
  toggleSidebar: () => void;
  userName: string;
  notifications: Notification[];
}

export default function Topbar({ toggleSidebar, userName, notifications }: TopbarProps) {
  const [search, setSearch] = useState("");
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button 
            onClick={toggleSidebar}
            className="mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-primary font-inter">
            {(() => {
              const [location] = useLocation();
              if (location === "/") return "Dashboard";
              if (location.startsWith("/expenses")) return "Expenses";
              if (location.startsWith("/payroll")) return "Payroll";
              if (location.startsWith("/reports")) return "Reports";
              return "Dashboard";
            })()}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Input
              type="text"
              className="bg-gray-100 rounded-md py-2 pl-10 pr-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                  <div className="relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-warning rounded-full text-xs flex items-center justify-center text-white">
                      {notifications.length}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-2">Notifications</h3>
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
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : notification.type === "error" ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
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
                  </div>
                  <DropdownMenuItem className="mt-4 w-full flex justify-center py-2 text-sm font-medium rounded-md">
                    View All Notifications
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Help */}
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <HelpCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
