import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DollarSign, CreditCard, BarChart3, Users, Filter } from "lucide-react";
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
    monthlyIncome: number;
    yearlyIncome: number;
    monthlyExpenses: number;
    yearlyExpenses: number;
    periodIncome: number;
    periodExpenses: number;
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

const periodOptions = [
  { label: "All Time", value: "all" },
  { label: "Custom Month/Year", value: "custom" },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentDate = new Date();
const currentMonth = currentDate.getUTCMonth();
const currentYear = currentDate.getUTCFullYear();

const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // last 10 years

export default function Dashboard() {
  const [_, navigate] = useLocation();
  
  const [period, setPeriod] = useState("custom");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const queryClient = useQueryClient();

  // Build query key and params
  const dashboardQueryKey = period === "custom"
    ? ["/api/dashboard", { month: selectedMonth, year: selectedYear }]
    : ["/api/dashboard"];

  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: dashboardQueryKey,
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, any];
      let url = "/api/dashboard";
      if (params) {
        url += `?month=${params.month}&year=${params.year}`;
      }
      const res = await fetch(url);
      return res.json();
    },
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  
  // Debug: Log dashboard metrics
  console.log('Dashboard metrics:', data?.metrics);
  
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
  
  const getIncomeValue = () => {
    if (period === "custom") return data?.metrics.periodIncome || 0;
    return data?.metrics.totalIncome || 0;
  };

  const getExpenseValue = () => {
    if (period === "custom") return data?.metrics.periodExpenses || 0;
    return data?.metrics.totalExpenses || 0;
  };
  
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
      {/* Page Title */}
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-primary font-inter">Financial Overview</h2>
        <p className="text-gray-500 mt-1">Track your organization's financial health at a glance</p>
      </div>
      {/* Stylish Filter Bar - always below headings */}
      <div className="w-full flex justify-center mb-8">
        <div className="w-full max-w-7xl bg-white shadow-lg rounded-xl px-8 py-5 border border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side: Filter controls */}
          <div className="flex flex-wrap items-center gap-4">
            <Filter className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold text-gray-700">Period:</span>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50 text-gray-700"
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {period === "custom" && (
              <>
                <span className="font-semibold text-gray-700">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50 text-gray-700"
                >
                  {months.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
                <span className="font-semibold text-gray-700">Year:</span>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-gray-50 text-gray-700"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          {/* Right side: Apply button */}
          <div className="flex justify-end w-full md:w-auto">
            <Button className="text-white bg-primary hover:bg-primary/90 px-5 py-1.5 rounded-lg shadow-sm transition-all duration-150" onClick={() => refetch()}>
              Apply
            </Button>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div>
          <MetricsCard
            title={period === "custom"
              ? `Total Income (${months[selectedMonth]} ${selectedYear})`
              : "Total Income (All Time)"}
            value={formatCurrency(getIncomeValue())}
            icon={
              <svg className="h-6 w-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <text x="2" y="20" fontSize="20" fontWeight="bold">₨</text>
              </svg>
            }
            iconBgColor="bg-green-200"
            change={{
              value: "",
              type: "neutral",
              text: period === "custom" ? `${months[selectedMonth]} ${selectedYear}` : "All Time"
            }}
          />
        </div>
        <div>
          <MetricsCard
            title={period === "custom"
              ? `Total Expenses (${months[selectedMonth]} ${selectedYear})`
              : "Total Expenses (All Time)"}
            value={formatCurrency(getExpenseValue())}
            icon={<CreditCard className="h-6 w-6 text-red-500" />}
            iconBgColor="bg-red-100"
            change={{
              value: "",
              type: "neutral",
              text: period === "custom" ? `${months[selectedMonth]} ${selectedYear}` : "All Time"
            }}
          />
        </div>
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
