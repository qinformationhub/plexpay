import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToPdf, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#4299E1', '#48BB78', '#F6AD55', '#805AD5', '#D53F8C'];

export default function FinancialReport() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(subMonths(new Date(), 6)),
    to: endOfMonth(new Date()),
  });
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch financial report data
  const { data: financialData, isLoading: financialLoading } = useQuery({
    queryKey: ['/api/reports/financial', { 
      startDate: dateRange.from?.toISOString(), 
      endDate: dateRange.to?.toISOString() 
    }],
  });
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(typeof amount === 'string' ? Number(amount) : amount) + ' PKR';
  };
  
  // Prepare data for the profit/loss chart
  const prepareNetProfitData = () => {
    if (!financialData || !financialData.income || !financialData.expenses) return [];
    
    // Group by month
    const monthlyData: { [key: string]: { month: string, income: number, expenses: number, profit: number } } = {};
    
    // Process income
    financialData.income.forEach((income: any) => {
      const date = new Date(income.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
      }
      
      monthlyData[monthKey].income += Number(income.amount);
      monthlyData[monthKey].profit += Number(income.amount);
    });
    
    // Process expenses
    financialData.expenses.forEach((expense: any) => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0, profit: 0 };
      }
      
      monthlyData[monthKey].expenses += Number(expense.amount);
      monthlyData[monthKey].profit -= Number(expense.amount);
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate.getTime() - bDate.getTime();
    });
  };
  
  // Prepare recent transactions data
  const prepareRecentTransactions = () => {
    if (!financialData || !financialData.income || !financialData.expenses) return [];
    
    const incomeTransactions = financialData.income.map((income: any) => ({
      id: `income-${income.id}`,
      type: 'income',
      description: income.source,
      amount: Number(income.amount),
      date: new Date(income.date)
    }));
    
    const expenseTransactions = financialData.expenses.map((expense: any) => ({
      id: `expense-${expense.id}`,
      type: 'expense',
      description: expense.description,
      amount: -Number(expense.amount),
      date: new Date(expense.date)
    }));
    
    return [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  };
  
  const handleExportPDF = () => {
    if (!financialData) return;
    
    const reportContent = {
      title: "Financial Report",
      dateRange: `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
      totalIncome: formatCurrency(financialData.totalIncome),
      totalExpenses: formatCurrency(financialData.totalExpenses),
      netProfit: formatCurrency(financialData.netProfit),
      income: financialData.income.map((income: any) => ({
        description: income.source,
        category: "Income",
        date: format(new Date(income.date), 'MMM d, yyyy'),
        amount: formatCurrency(income.amount)
      })),
      expenses: financialData.expenses.map((expense: any) => ({
        description: expense.description,
        category: "Expense",
        date: format(new Date(expense.date), 'MMM d, yyyy'),
        amount: formatCurrency(-expense.amount)
      }))
    };
    
    exportToPdf("Financial_Report", reportContent);
    
    toast({
      title: "Export Started",
      description: "Your financial report PDF is being downloaded.",
    });
  };
  
  const handleExportExcel = () => {
    if (!financialData) return;
    
    const incomeData = financialData.income.map((income: any) => ({
      Type: "Income",
      Description: income.source,
      Date: format(new Date(income.date), 'MMM d, yyyy'),
      Amount: Number(income.amount)
    }));
    
    const expenseData = financialData.expenses.map((expense: any) => ({
      Type: "Expense",
      Description: expense.description,
      Date: format(new Date(expense.date), 'MMM d, yyyy'),
      Amount: -Number(expense.amount)
    }));
    
    exportToExcel([...incomeData, ...expenseData], "Financial_Report");
    
    toast({
      title: "Export Started",
      description: "Your financial report Excel file is being downloaded.",
    });
  };
  
  const handlePrint = () => {
    toast({
      title: "Printing",
      description: "Your financial report is being prepared for printing.",
    });
    
    // In a real app, this would trigger printing functionality
    setTimeout(() => {
      toast({
        title: "Print Ready",
        description: "Your report has been sent to the printer.",
      });
    }, 1500);
  };
  
  if (financialLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-80 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }
  
  const netProfitData = prepareNetProfitData();
  const recentTransactions = prepareRecentTransactions();
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Financial Report</h2>
          <p className="text-gray-500 mt-1">Comprehensive overview of income, expenses, and profitability</p>
        </div>
        <div className="flex mt-4 sm:mt-0 gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate("/reports")}
          >
            Back to Reports
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button 
            className="bg-secondary hover:bg-secondary/90"
            onClick={handleExportPDF}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Report Period</CardTitle>
          <CardDescription>
            Select the date range for your financial report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto">
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange as any}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button 
              onClick={handleExportExcel}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-accent">
              {formatCurrency(financialData?.totalIncome || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {financialData?.income?.length || 0} income transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-500">
              {formatCurrency(financialData?.totalExpenses || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {financialData?.expenses?.length || 0} expense transactions
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn(
          financialData?.netProfit >= 0 ? "bg-blue-50 border-blue-100" : "bg-red-50 border-red-100"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold font-mono",
              financialData?.netProfit >= 0 ? "text-secondary" : "text-red-500"
            )}>
              {formatCurrency(financialData?.netProfit || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {financialData?.netProfit >= 0 ? "Profit" : "Loss"} for the period
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Profit/Loss Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>
                Comparison of income and expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {netProfitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={netProfitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#48BB78" />
                    <Bar dataKey="expenses" name="Expenses" fill="#F6AD55" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No financial data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Profit Trend Line Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
              <CardDescription>
                Net profit trend over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {netProfitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={netProfitData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      name="Net Profit" 
                      stroke="#4299E1" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No profit data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Most recent financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs inline-flex items-center",
                              transaction.type === 'income' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            )}>
                              {transaction.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                          </TableCell>
                          <TableCell>{format(transaction.date, 'MMM d, yyyy')}</TableCell>
                          <TableCell className={cn(
                            "text-right font-mono",
                            transaction.type === 'income' ? "text-accent" : "text-red-500"
                          )}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No recent transactions found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income">
          {/* Income Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Income Details</CardTitle>
              <CardDescription>
                All income transactions for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialData?.income?.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData.income.map((income: any) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">{income.source}</TableCell>
                          <TableCell>{income.description || "—"}</TableCell>
                          <TableCell>{format(new Date(income.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="text-right font-mono text-accent">
                            {formatCurrency(income.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No income transactions found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          {/* Expenses Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>
                All expense transactions for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {financialData?.expenses?.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialData.expenses.map((expense: any) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{expense.notes || "—"}</TableCell>
                          <TableCell className="text-right font-mono text-red-500">
                            {formatCurrency(expense.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No expense transactions found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
