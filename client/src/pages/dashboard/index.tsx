import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DollarSign, CreditCard, BarChart3, Users } from "lucide-react";
import MetricsCard from "@/components/dashboard/MetricsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import { Button } from "@/components/ui/button";

// Add type for dashboard API response
type DashboardData = {
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    currentBalance: number;
    pendingPayroll: number;
  };
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    category: string;
    date: string | Date;
    amount: number;
  }>;
  expensesByCategory: Record<string, number>;
  monthlyData: Array<{ income: number; expenses: number }>;
};

export default function Dashboard() {
  const [_, navigate] = useLocation();
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
    staleTime: 0, // Always refetch when invalidated
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + ' PKR';
  };
  
  const getMonthName = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };
  
  // Process chart data
  const monthlyData = data?.monthlyData.map((item: any, index: number) => ({
    month: getMonthName(index),
    income: item.income,
    expenses: item.expenses
  })) || [];
  
  // Process expense categories data
  const expensesData = data?.expensesByCategory 
    ? Object.entries(data.expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: Number(amount)
      }))
    : [];
  
  const notifications = [
    {
      id: 1,
      title: "Payroll Due Soon",
      message: "Monthly payroll processing is due in 5 days. Please review and approve.",
      type: "warning" as const,
      time: "2 hours ago"
    },
    {
      id: 2,
      title: "High Expense Alert",
      message: "Office supplies expense is 28% higher than previous month.",
      type: "error" as const,
      time: "1 day ago"
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Client payment of $8,500 has been received and processed.",
      type: "success" as const,
      time: "3 days ago"
    }
  ];
  
  // Ensure recentTransactions have date as Date objects
  const transactions = (data?.recentTransactions || []).map((t) => ({
    ...t,
    date: typeof t.date === 'string' ? new Date(t.date) : t.date,
  }));
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-300 rounded"></div>
            <div className="h-4 w-48 bg-gray-300 rounded mt-2"></div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="h-10 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  <div className="h-8 w-32 bg-gray-300 rounded mt-2"></div>
                  <div className="h-4 w-40 bg-gray-300 rounded mt-2"></div>
                </div>
                <div className="p-2 bg-gray-300 rounded-md h-10 w-10"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 w-48 bg-gray-300 rounded mb-8"></div>
            <div className="h-[240px] bg-gray-200 rounded-lg"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 w-48 bg-gray-300 rounded mb-8"></div>
            <div className="h-[240px] bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading dashboard data</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <>
      {/* Page Title & Date Filter */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Financial Overview</h2>
          <p className="text-gray-500 mt-1">Track your organization's financial health at a glance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex rounded-md shadow-sm">
            <Button variant="outline" className="rounded-r-none">
              Month
            </Button>
            <Button className="rounded-l-none bg-secondary hover:bg-secondary/90">
              Quarter
            </Button>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="relative">
          <MetricsCard
            title="Total Income"
            value={formatCurrency(data?.metrics.totalIncome || 0)}
            icon={
              <svg className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <text x="2" y="20" fontSize="20" fontWeight="bold">₨</text>
              </svg>
            }
            iconBgColor="bg-green-200"
            change={{
              value: "12.3%",
              type: "increase",
              text: "+12.3% from last period"
            }}
          />
          <Button 
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-accent hover:bg-accent/90"
            size="sm"
            onClick={() => navigate("/income/add")}
          >
            Add Income
          </Button>
        </div>
        
        <MetricsCard
          title="Total Expenses"
          value={formatCurrency(data?.metrics.totalExpenses || 0)}
          icon={<CreditCard className="h-6 w-6 text-red-500" />}
          iconBgColor="bg-red-100"
          change={{
            value: "5.8%",
            type: "decrease",
            text: "+5.8% from last period"
          }}
        />
        
        <MetricsCard
          title="Current Balance"
          value={formatCurrency(data?.metrics.currentBalance || 0)}
          icon={<BarChart3 className="h-6 w-6 text-blue-800" />}
          iconBgColor="bg-blue-100"
          change={{
            value: "22.5%",
            type: "increase",
            text: "+22.5% from last period"
          }}
        />
        
        <MetricsCard
          title="Pending Payroll"
          value={formatCurrency(data?.metrics.pendingPayroll || 0)}
          icon={<Users className="h-6 w-6 text-warning" />}
          iconBgColor="bg-orange-100"
          change={{
            value: "5",
            type: "neutral",
            text: "Due in 5 days"
          }}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyData} />
        </div>
        
        <div>
          <ExpensesChart data={expensesData} />
        </div>
      </div>
      
      {/* Recent Transactions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionsTable 
            transactions={transactions}
            onViewAll={() => navigate("/reports/financial")}
          />
        </div>
        
        <div>
          <NotificationsPanel 
            notifications={notifications}
            onMarkAllRead={() => console.log("Mark all read")}
            onViewAll={() => console.log("View all notifications")}
          />
        </div>
      </div>
    </>
  );
}
