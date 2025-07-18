import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DollarSign, CreditCard, BarChart3, Users, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import MetricsCard from "@/components/dashboard/MetricsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  { label: "Custom Year", value: "year" },
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
  const { toast } = useToast();
  const [period, setPeriod] = useState("custom");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearOnlyFilter, setYearOnlyFilter] = useState(currentYear);
  const queryClient = useQueryClient();
  const [incomePage, setIncomePage] = useState(1);
  const [incomeLimit] = useState(5);
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Build query key and params
  const dashboardQueryKey = period === "custom"
    ? ["/api/dashboard", { month: selectedMonth, year: selectedYear }]
    : period === "year"
    ? ["/api/dashboard", { yearOnly: yearOnlyFilter }]
    : ["/api/dashboard"];

  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: dashboardQueryKey,
    queryFn: async ({ queryKey }) => {
      const [, params] = queryKey as [string, any];
      let url = "/api/dashboard";
      if (params) {
        if (params.yearOnly !== undefined) {
          url += `?yearOnly=${params.yearOnly}`;
        } else {
          url += `?month=${params.month}&year=${params.year}`;
        }
      }
      const res = await fetch(url);
      return res.json();
    },
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    gcTime: 0
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
  
  const getIncomeValue = () => {
    if (period === "custom") return data?.metrics.periodIncome || 0;
    if (period === "year") return data?.metrics.yearlyIncome || 0;
    return data?.metrics.totalIncome || 0;
  };

  const getExpenseValue = () => {
    if (period === "custom") return data?.metrics.periodExpenses || 0;
    if (period === "year") return data?.metrics.yearlyExpenses || 0;
    return data?.metrics.totalExpenses || 0;
  };
  
  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/income-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Income deleted",
        description: "The income entry has been successfully deleted.",
      });
      setConfirmDeleteId(null);
      setTimeout(() => {
        if (incomeData.length === 1 && incomePage > 1) {
          setIncomePage(p => Math.max(1, p - 1));
        }
      }, 0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete income entry",
        variant: "destructive",
      });
    },
  });
  
  useEffect(() => {
    fetch(`/api/income-records?page=${Math.max(1, incomePage)}&limit=${incomeLimit}`)
      .then(res => res.json())
      .then(res => {
        if (Array.isArray(res)) {
          setIncomeData(res);
          setIncomeTotal(res.length);
        } else {
          setIncomeData(Array.isArray(res.data) ? res.data : []);
          setIncomeTotal(res.total || 0);
        }
      })
      .catch(() => {
        setIncomeData([]);
        setIncomeTotal(0);
      });
  }, [incomePage, incomeLimit, deleteIncomeMutation.isSuccess]);

  const totalPages = Math.ceil(incomeTotal / incomeLimit);
  
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
            {period === "year" && (
              <>
                <span className="font-semibold text-gray-700">Year:</span>
                <select
                  value={yearOnlyFilter}
                  onChange={e => setYearOnlyFilter(Number(e.target.value))}
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
              : period === "year"
              ? `Total Income (${yearOnlyFilter})`
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
              text: period === "custom" 
                ? `${months[selectedMonth]} ${selectedYear}`
                : period === "year"
                ? `${yearOnlyFilter}`
                : "All Time"
            }}
            addButton={
              <Button
                className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg border-0 transition-all duration-300 hover:from-green-500 hover:to-blue-600 hover:scale-105 hover:shadow-2xl flex items-center"
                onClick={() => navigate('/income/add')}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <text x="2" y="20" fontSize="20" fontWeight="bold">₨</text>
                </svg>
                Add Income
              </Button>
            }
          />
        </div>
        <div>
          <MetricsCard
            title={period === "custom"
              ? `Total Expenses (${months[selectedMonth]} ${selectedYear})`
              : period === "year"
              ? `Total Expenses (${yearOnlyFilter})`
              : "Total Expenses (All Time)"}
            value={formatCurrency(getExpenseValue())}
            icon={<CreditCard className="h-6 w-6 text-red-500" />}
            iconBgColor="bg-red-100"
            change={{
              value: "",
              type: "neutral",
              text: period === "custom" 
                ? `${months[selectedMonth]} ${selectedYear}`
                : period === "year"
                ? `${yearOnlyFilter}`
                : "All Time"
            }}
          />
        </div>
        <MetricsCard
          title="Current Balance (All Time)"
          value={formatCurrency((data?.metrics.totalIncome ?? 0) - (data?.metrics.totalExpenses ?? 0))}
          icon={<BarChart3 className="h-6 w-6 text-blue-800" />}
          iconBgColor="bg-blue-100"
          change={{
            value: "",
            type: "neutral",
            text: "All Time"
          }}
        />
        <MetricsCard
          title="Pending Payroll"
          value={formatCurrency(data?.metrics.pendingPayroll || 0)}
          icon={<Users className="h-6 w-6 text-warning" />}
          iconBgColor="bg-orange-100"
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
      
      {/* Income Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 mt-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-primary">Income Entries</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(incomeData || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No income entries found.</td>
                </tr>
              ) : (
                (incomeData || []).map((income: any) => (
                  <tr key={income.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{income.source}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{income.description || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{typeof income.date === 'string' ? (new Date(income.date)).toLocaleDateString() : income.date.toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-green-600">
                      +{formatCurrency(income.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="inline-flex items-center px-2 py-1 text-xs text-blue-600 hover:text-blue-900"
                        onClick={() => navigate(`/income/edit/${income.id}`)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-900 ml-2"
                        onClick={() => setConfirmDeleteId(income.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-700 hover:bg-primary hover:text-white transition disabled:opacity-50"
            onClick={() => setIncomePage(p => Math.max(1, p - 1))}
            disabled={incomePage === 1 || incomeTotal === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="mx-2 text-sm">Page {incomePage} of {Math.max(1, totalPages)}</span>
          <button
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm text-gray-700 hover:bg-primary hover:text-white transition disabled:opacity-50"
            onClick={() => setIncomePage(p => Math.min(totalPages, p + 1))}
            disabled={incomePage === totalPages || incomeTotal === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this income entry. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && deleteIncomeMutation.mutate(confirmDeleteId)}
              disabled={deleteIncomeMutation.isPending}
            >
              {deleteIncomeMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
