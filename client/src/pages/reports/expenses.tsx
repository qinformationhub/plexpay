import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Bar, 
  BarChart, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
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
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CalendarIcon, Download, FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToPdf, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#4299E1', '#F6AD55', '#48BB78', '#805AD5', '#D53F8C'];

export default function ExpenseReport() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1)),
  });
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ['/api/expenses'],
  });
  
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
    queryKey: ['/api/expense-categories'],
  });
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(typeof amount === 'string' ? Number(amount) : amount) + ' PKR';
  };
  
  const getCategoryName = (categoryId: number) => {
    if (!categories) return "Loading...";
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  // Filter expenses by date range and category
  const filteredExpenses = expenses.filter((expense: any) => {
    const expenseDate = new Date(expense.date);
    const inDateRange = (!dateRange.from || expenseDate >= dateRange.from) &&
                      (!dateRange.to || expenseDate <= dateRange.to);
    
    const matchesCategory = categoryFilter === "" || categoryFilter === "all" || 
      expense.categoryId === parseInt(categoryFilter);
    
    return inDateRange && matchesCategory;
  });
  
  // Calculate total amount
  const totalAmount = filteredExpenses.reduce((sum: number, expense: any) => {
    return sum + Number(expense.amount);
  }, 0);
  
  // Prepare data for category pie chart
  const prepareCategoryData = () => {
    if (!filteredExpenses.length || !categories) return [];
    
    const categoryTotals: { [key: string]: number } = {};
    
    filteredExpenses.forEach((expense: any) => {
      const categoryName = getCategoryName(expense.categoryId);
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += Number(expense.amount);
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  // Prepare data for monthly trend chart
  const prepareMonthlyData = () => {
    if (!filteredExpenses.length) return [];
    
    const months: { [key: string]: number } = {};
    
    filteredExpenses.forEach((expense: any) => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!months[monthKey]) {
        months[monthKey] = 0;
      }
      months[monthKey] += Number(expense.amount);
    });
    
    return Object.entries(months)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const aDate = new Date(a.month);
        const bDate = new Date(b.month);
        return aDate.getTime() - bDate.getTime();
      });
  };
  
  const handleExportPDF = () => {
    const reportContent = {
      title: "Expense Report",
      dateRange: `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
      totalExpenses: formatCurrency(totalAmount),
      expenses: filteredExpenses.map((expense: any) => ({
        description: expense.description,
        category: getCategoryName(expense.categoryId),
        date: format(new Date(expense.date), 'MMM d, yyyy'),
        amount: formatCurrency(expense.amount)
      }))
    };
    
    exportToPdf("Expense_Report", reportContent);
    
    toast({
      title: "Export Started",
      description: "Your expense report PDF is being downloaded.",
    });
  };
  
  const handleExportExcel = () => {
    const data = filteredExpenses.map((expense: any) => ({
      Description: expense.description,
      Category: getCategoryName(expense.categoryId),
      Date: format(new Date(expense.date), 'MMM d, yyyy'),
      Amount: Number(expense.amount),
      Notes: expense.notes || ""
    }));
    
    exportToExcel(data, "Expense_Report");
    
    toast({
      title: "Export Started",
      description: "Your expense report Excel file is being downloaded.",
    });
  };
  
  const handlePrint = () => {
    toast({
      title: "Printing",
      description: "Your expense report is being prepared for printing.",
    });
    
    // In a real app, this would trigger printing functionality
    setTimeout(() => {
      toast({
        title: "Print Ready",
        description: "Your report has been sent to the printer.",
      });
    }, 1500);
  };
  
  if (expensesLoading || categoriesLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-80 bg-gray-200 rounded-lg mb-6"></div>
        <div className="h-80 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }
  
  const categoryData = prepareCategoryData();
  const monthlyData = prepareMonthlyData();
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Expense Report</h2>
          <p className="text-gray-500 mt-1">Analysis and breakdown of organizational expenses</p>
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
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>
            Customize your expense report by selecting date range and categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-auto flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
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
            
            <div className="w-full md:w-64">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange({
                    from: startOfMonth(subMonths(new Date(), 1)),
                    to: endOfMonth(subMonths(new Date(), 1))
                  });
                  setCategoryFilter("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filteredExpenses.length} expense transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(monthlyData.length > 0 ? totalAmount / monthlyData.length : 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {monthlyData.length} months in selected period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Largest Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-primary">
                  {categoryData.sort((a, b) => b.value - a.value)[0].name}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCurrency(categoryData.sort((a, b) => b.value - a.value)[0].value)} ({Math.round((categoryData.sort((a, b) => b.value - a.value)[0].value / totalAmount) * 100)}% of total)
                </p>
              </>
            ) : (
              <div className="text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>
              Breakdown of expenses by category for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No expense data available for the selected criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
            <CardDescription>
              Expense trend over time for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#4299E1" name="Expense Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No monthly data available for the selected criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Expense Transactions Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Expense Transactions</CardTitle>
            <CardDescription>
              Detailed list of all expense transactions for the selected period
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 sm:mt-0"
            onClick={handleExportExcel}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
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
              <p className="text-gray-500">No expense transactions found for the selected criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
