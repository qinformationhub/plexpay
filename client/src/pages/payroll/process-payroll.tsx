import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payrollFormSchema } from "@shared/schema";
import { z } from "zod";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormValues = z.infer<typeof payrollFormSchema>;

export default function ProcessPayroll() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [payPeriodStart, setPayPeriodStart] = useState<Date>(startOfMonth(new Date()));
  const [payPeriodEnd, setPayPeriodEnd] = useState<Date>(endOfMonth(new Date()));
  const [showPreview, setShowPreview] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: {
      employeeId: 0,
      userId: user?.id || 0,
      payPeriodStart,
      payPeriodEnd,
      grossAmount: "",
      deductions: "",
      netAmount: "",
      processedOn: new Date(),
      notes: "",
      status: "pending",
    },
  });

  const createPayrollRecordMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/payroll-records", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payroll-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Payroll processed",
        description: "The payroll has been processed successfully.",
      });
      navigate("/payroll");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process payroll",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? Number(amount) : amount);
  };

  const handleCheckboxChange = (employeeId: number) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map((emp: any) => emp.id));
    }
  };

  const calculatePayroll = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payroll for.",
        variant: "destructive",
      });
      return;
    }

    const records = selectedEmployees.map((empId) => {
      const employee = employees.find((emp: any) => emp.id === empId);
      if (!employee) return null;

      const monthlySalary = Number(employee.salary) / 12;
      const deductions = monthlySalary * 0.2; // 20% for taxes and benefits
      const netAmount = monthlySalary - deductions;

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        department: employee.department,
        userId: user?.id,
        payPeriodStart,
        payPeriodEnd,
        grossAmount: monthlySalary.toFixed(2),
        deductions: deductions.toFixed(2),
        netAmount: netAmount.toFixed(2),
        processedOn: new Date(),
        notes: `Salary for ${format(payPeriodStart, 'MMMM yyyy')}`,
        status: "pending",
      };
    }).filter(Boolean);

    setPayrollRecords(records);
    setShowPreview(true);
  };

  const processPayroll = () => {
    if (payrollRecords.length === 0) {
      toast({
        title: "No payroll records",
        description: "Please calculate payroll before processing.",
        variant: "destructive",
      });
      return;
    }

    const processingPromises = payrollRecords.map((record) => {
      const { employeeName, position, department, ...payrollData } = record;
      return createPayrollRecordMutation.mutateAsync(payrollData);
    });

    Promise.all(processingPromises)
      .then(() => {
        toast({
          title: "Payroll processed successfully",
          description: `Processed payroll for ${payrollRecords.length} employees.`,
        });
        navigate("/payroll");
      })
      .catch((error) => {
        toast({
          title: "Error processing payroll",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive",
        });
      });
  };

  if (employeesLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-[400px] bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const activeEmployees = employees ? employees.filter((emp: any) => emp.isActive) : [];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary font-inter">Process Payroll</h2>
        <p className="text-gray-500 mt-1">Generate payroll records for employees</p>
      </div>

      {!showPreview ? (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Configuration</CardTitle>
            <CardDescription>
              Select employees and configure payroll details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pay Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Pay Period Start</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !payPeriodStart && "text-muted-foreground"
                      )}
                    >
                      {payPeriodStart ? (
                        format(payPeriodStart, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={payPeriodStart}
                      onSelect={(date) => setPayPeriodStart(date || startOfMonth(new Date()))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Pay Period End</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !payPeriodEnd && "text-muted-foreground"
                      )}
                    >
                      {payPeriodEnd ? (
                        format(payPeriodEnd, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={payPeriodEnd}
                      onSelect={(date) => setPayPeriodEnd(date || endOfMonth(new Date()))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-sm font-medium mb-2">Payroll Notes (Optional)</h3>
              <Textarea 
                placeholder="Add any notes about this payroll run..."
                value={form.watch('notes')}
                onChange={(e) => form.setValue('notes', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Employee Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Select Employees</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="selectAll"
                    checked={selectedEmployees.length === activeEmployees.length}
                    onCheckedChange={handleSelectAllChange}
                  />
                  <label
                    htmlFor="selectAll"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Select All
                  </label>
                </div>
              </div>

              {activeEmployees.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Monthly Salary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeEmployees.map((employee: any) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedEmployees.includes(employee.id)}
                              onCheckedChange={() => handleCheckboxChange(employee.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(Number(employee.salary) / 12)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Employees</AlertTitle>
                  <AlertDescription>
                    There are no active employees in the system. Please add employees first.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/payroll")}
            >
              Cancel
            </Button>
            <Button
              onClick={calculatePayroll}
              className="bg-secondary hover:bg-secondary/90"
              disabled={selectedEmployees.length === 0}
            >
              Calculate Payroll
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Preview</CardTitle>
            <CardDescription>
              Review the calculated payroll before processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Please review the payroll details carefully. Once processed, payroll records cannot be easily modified.
              </AlertDescription>
            </Alert>

            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Payroll Period</h3>
              <p className="text-gray-700">
                {format(payPeriodStart, "MMMM d, yyyy")} to {format(payPeriodEnd, "MMMM d, yyyy")}
              </p>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.employeeId}>
                      <TableCell className="font-medium">
                        {record.employeeName}
                        <div className="text-xs text-gray-500">{record.position}</div>
                      </TableCell>
                      <TableCell>{record.department}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(record.grossAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-500">
                        {formatCurrency(record.deductions)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-accent">
                        {formatCurrency(record.netAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 flex justify-between p-4 bg-gray-50 rounded-md">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-lg font-bold">{payrollRecords.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Gross Amount</p>
                <p className="text-lg font-bold font-mono">
                  {formatCurrency(
                    payrollRecords.reduce((sum, record) => sum + Number(record.grossAmount), 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Net Amount</p>
                <p className="text-lg font-bold font-mono text-accent">
                  {formatCurrency(
                    payrollRecords.reduce((sum, record) => sum + Number(record.netAmount), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              Back
            </Button>
            <Button
              onClick={processPayroll}
              className="bg-secondary hover:bg-secondary/90"
              disabled={createPayrollRecordMutation.isPending}
            >
              {createPayrollRecordMutation.isPending ? 
                "Processing..." : 
                "Process Payroll"
              }
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
