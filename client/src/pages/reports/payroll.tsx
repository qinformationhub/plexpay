import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ResponsiveContainer, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, FileText, Printer, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToPdf, exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#4299E1', '#48BB78', '#F6AD55', '#805AD5', '#D53F8C'];

export default function PayrollReport() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfMonth(subMonths(new Date(), 3)),
    to: endOfMonth(new Date()),
  });
  const [activeTab, setActiveTab] = useState("payroll");
  
  // Fetch payroll report data
  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['/api/reports/payroll', { 
      startDate: dateRange.from?.toISOString(), 
      endDate: dateRange.to?.toISOString() 
    }],
  });
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? Number(amount) : amount);
  };
  
  // Prepare data for department chart
  const prepareDepartmentData = () => {
    if (!payrollData || !payrollData.payrollByDepartment) return [];
    
    return payrollData.payrollByDepartment.map((dept: any) => ({
      name: dept.department,
      value: Number(dept.totalNet)
    }));
  };
  
  const handleExportPDF = () => {
    if (!payrollData) return;
    
    const reportContent = {
      title: "Payroll Report",
      dateRange: `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`,
      totalGrossAmount: formatCurrency(payrollData.totalGrossAmount || 0),
      totalNetAmount: formatCurrency(payrollData.totalNetAmount || 0),
      totalDeductions: formatCurrency(payrollData.totalDeductions || 0),
      expenses: payrollData.payrollRecords.map((record: any) => ({
        description: record.employeeName,
        category: record.department,
        date: format(new Date(record.processedOn), 'MMM d, yyyy'),
        amount: formatCurrency(record.netAmount)
      }))
    };
    
    exportToPdf("Payroll_Report", reportContent);
    
    toast({
      title: "Export Started",
      description: "Your payroll report PDF is being downloaded.",
    });
  };
  
  const handleExportExcel = () => {
    if (!payrollData) return;
    
    const data = payrollData.payrollRecords.map((record: any) => ({
      Employee: record.employeeName,
      Position: record.position,
      Department: record.department,
      PayPeriod: `${format(new Date(record.payPeriodStart), 'MMM d')} - ${format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}`,
      GrossAmount: Number(record.grossAmount),
      Deductions: Number(record.deductions),
      NetAmount: Number(record.netAmount),
      Status: record.status,
      ProcessedDate: format(new Date(record.processedOn), 'MMM d, yyyy')
    }));
    
    exportToExcel(data, "Payroll_Report");
    
    toast({
      title: "Export Started",
      description: "Your payroll report Excel file is being downloaded.",
    });
  };
  
  const handlePrint = () => {
    toast({
      title: "Printing",
      description: "Your payroll report is being prepared for printing.",
    });
    
    // In a real app, this would trigger printing functionality
    setTimeout(() => {
      toast({
        title: "Print Ready",
        description: "Your report has been sent to the printer.",
      });
    }, 1500);
  };
  
  const handleSendPayslips = () => {
    toast({
      title: "Sending Payslips",
      description: "Preparing to send payslips to employees...",
    });
    
    // In a real app, this would trigger email functionality
    setTimeout(() => {
      toast({
        title: "Payslips Sent",
        description: `${payrollData?.payrollRecords?.length || 0} payslips have been sent successfully.`,
      });
    }, 2000);
  };
  
  if (payrollLoading) {
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
  
  const departmentData = prepareDepartmentData();
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Payroll Report</h2>
          <p className="text-gray-500 mt-1">Analysis of employee compensation and payroll distribution</p>
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
            Select the date range for your payroll report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
            
            <div className="flex gap-2">
              <Button 
                onClick={handleExportExcel}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
              
              <Button 
                onClick={handleSendPayslips}
                variant="outline"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Payslips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Gross Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {formatCurrency(payrollData?.totalGrossAmount || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Gross compensation for all employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-500">
              {formatCurrency(payrollData?.totalDeductions || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Taxes and benefits withheld
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-accent">
              {formatCurrency(payrollData?.totalNetAmount || 0)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Total paid to employees
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="payroll">Payroll Records</TabsTrigger>
          <TabsTrigger value="department">Department Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll">
          {/* Payroll Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Records</CardTitle>
              <CardDescription>
                All payroll transactions for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payrollData?.payrollRecords?.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Pay Period</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Deductions</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollData.payrollRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.employeeName}
                            <div className="text-xs text-gray-500">{record.position}</div>
                          </TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>
                            {format(new Date(record.payPeriodStart), 'MMM d')} - {format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(record.grossAmount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-red-500">
                            {formatCurrency(record.deductions)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-accent">
                            {formatCurrency(record.netAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={record.status === 'completed' ? "default" : "secondary"}
                              className={cn(
                                record.status === 'completed' ? "bg-accent hover:bg-accent/80" : "",
                                record.status === 'pending' ? "bg-warning hover:bg-warning/80" : ""
                              )}
                            >
                              {record.status === 'completed' ? "Completed" : "Pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No payroll records found for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="department">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payroll by Department</CardTitle>
                <CardDescription>
                  Distribution of payroll costs across departments
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {departmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {departmentData.map((entry, index) => (
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
                    <p className="text-gray-500">No department data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Department Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
                <CardDescription>
                  Payroll costs broken down by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payrollData?.payrollByDepartment?.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Employees</TableHead>
                          <TableHead className="text-right">Total Gross</TableHead>
                          <TableHead className="text-right">Total Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollData.payrollByDepartment.map((dept: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{dept.department}</TableCell>
                            <TableCell className="text-right">{dept.count}</TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(dept.totalGross)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-accent">
                              {formatCurrency(dept.totalNet)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-md">
                    <p className="text-gray-500">No department data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Department Bar Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Department Comparison</CardTitle>
                <CardDescription>
                  Visual comparison of payroll costs by department
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {departmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="value" name="Payroll Amount" fill="#4299E1">
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No department data available for the selected period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
