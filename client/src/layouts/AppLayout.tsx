import { ReactNode, useState } from "react";
import Sidebar from "@/components/ui/sidebar";
import Topbar from "@/components/ui/topbar";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!user) {
    return null; // Don't render layout if not authenticated
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          toggleSidebar={toggleSidebar} 
          userName={user.name} 
          notifications={[
            {
              id: 1,
              title: "Payroll Due Soon",
              message: "Monthly payroll processing is due in 5 days. Please review and approve.",
              type: "warning",
              time: "2 hours ago"
            },
            {
              id: 2,
              title: "High Expense Alert",
              message: "Office supplies expense is 28% higher than previous month.",
              type: "error",
              time: "1 day ago"
            },
            {
              id: 3,
              title: "Payment Received",
              message: "Client payment of $8,500 has been received and processed.",
              type: "success",
              time: "3 days ago"
            }
          ]}
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
