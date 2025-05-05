import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside 
      className={cn(
        "sidebar bg-primary text-white h-full flex-shrink-0 z-10 transition-all duration-300",
        collapsed ? "w-0 overflow-hidden md:w-20" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-4 flex items-center border-b border-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          {!collapsed && <span className="ml-2 text-xl font-semibold font-inter">PlexPay</span>}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="px-2 space-y-1">
            <li>
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-md group",
                  isActive("/dashboard") || isActive("/") 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <LayoutDashboard className={cn(
                  "h-5 w-5", 
                  isActive("/dashboard") || isActive("/") ? "text-secondary" : ""
                )} />
                {!collapsed && <span className="ml-3">Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/expenses" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-md group",
                  isActive("/expenses") 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Receipt className={cn(
                  "h-5 w-5", 
                  isActive("/expenses") ? "text-secondary" : ""
                )} />
                {!collapsed && <span className="ml-3">Expenses</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/payroll" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-md group",
                  isActive("/payroll") 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Users className={cn(
                  "h-5 w-5", 
                  isActive("/payroll") ? "text-secondary" : ""
                )} />
                {!collapsed && <span className="ml-3">Payroll</span>}
              </Link>
            </li>
            <li>
              <Link 
                href="/reports" 
                className={cn(
                  "flex items-center px-4 py-3 rounded-md group",
                  isActive("/reports") 
                    ? "bg-primary-700 text-white" 
                    : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <BarChart3 className={cn(
                  "h-5 w-5", 
                  isActive("/reports") ? "text-secondary" : ""
                )} />
                {!collapsed && <span className="ml-3">Reports</span>}
              </Link>
            </li>
            {user?.role === "admin" && (
              <li>
                <Link 
                  href="/settings" 
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md group",
                    isActive("/settings") 
                      ? "bg-primary-700 text-white" 
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <Settings className={cn(
                    "h-5 w-5", 
                    isActive("/settings") ? "text-secondary" : ""
                  )} />
                  {!collapsed && <span className="ml-3">Settings</span>}
                </Link>
              </li>
            )}
            {user?.role === 'admin' && (
              <li>
                <Link
                  href="/users"
                  className={cn(
                    "flex items-center px-4 py-3 rounded-md group",
                    isActive("/users")
                      ? "bg-primary-700 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  <Users className={cn(
                    "h-5 w-5",
                    isActive("/users") ? "text-secondary" : ""
                  )} />
                  {!collapsed && <span className="ml-3">Users</span>}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-medium">
              {user?.name.slice(0, 2)}
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button 
              onClick={logout}
              className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}