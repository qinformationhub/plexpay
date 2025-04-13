import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Search, Plus, UserPlus, CreditCard, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Payroll() {
  const [_, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("employees");
  
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
  });
  
  const { data: payrollRecords, isLoading: payrollLoading } = useQuery({
    queryKey: ['/api/payroll-records'],
  });
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(typeof amount === 'string' ? Number(amount) : amount) + ' PKR';
  };
  
  const filteredEmployees = employees 
    ? employees.filter((employee: any) => 
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.position.toLowerCase().includes(search.toLowerCase()) ||
        employee.department.toLowerCase().includes(search.toLowerCase())
      )
    : [];
    
  const filteredPayrollRecords = payrollRecords
    ? payrollRecords.filter((record: any) => {
        const matchingEmployee = employees?.find((e: any) => e.id === record.employeeId);
        if (!matchingEmployee) return false;
        
        return (
          matchingEmployee.name.toLowerCase().includes(search.toLowerCase()) ||
          matchingEmployee.position.toLowerCase().includes(search.toLowerCase()) ||
          matchingEmployee.department.toLowerCase().includes(search.toLowerCase()) ||
          record.status.toLowerCase().includes(search.toLowerCase())
        );
      })
    : [];
  
  if (employeesLoading || payrollLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-300 rounded"></div>
          <div className="h-10 w-32 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-12 w-64 bg-gray-300 rounded mb-6"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="h-10 w-64 bg-gray-300 rounded"></div>
            <div className="h-10 w-40 bg-gray-300 rounded"></div>
          </div>
          <div className="h-[400px] bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  const getEmployeeName = (employeeId: number) => {
    const employee = employees?.find((e: any) => e.id === employeeId);
    return employee ? employee.name : "Unknown";
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Payroll Management</h2>
          <p className="text-gray-500 mt-1">Manage employees and process payrolls</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate("/reports/payroll")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Payroll Reports
          </Button>
          <Button 
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => navigate("/payroll/add-employee")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>
      
      <Tabs
        defaultValue="employees"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll-records">Payroll Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>
                View and manage employees for payroll processing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-64 mb-4 md:mb-0">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-secondary hover:bg-secondary/90 w-full md:w-auto"
                  onClick={() => navigate("/payroll/process")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Process Payroll
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee: any) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(employee.salary)} <span className="text-gray-500 text-xs">/yr</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={employee.isActive ? "default" : "secondary"}
                              className={employee.isActive ? "bg-accent hover:bg-accent/80" : ""}
                            >
                              {employee.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/payroll/employee/${employee.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No employees found. Try adjusting your search or {' '}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-secondary" 
                            onClick={() => navigate("/payroll/add-employee")}
                          >
                            add an employee
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll-records">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>
                View all payroll records and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="relative w-full md:w-64 mb-4 md:mb-0">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search payroll records..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Records
                </Button>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Pay Period</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayrollRecords.length > 0 ? (
                      filteredPayrollRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {getEmployeeName(record.employeeId)}
                          </TableCell>
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
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/payroll/employee/${record.employeeId}`)}
                            >
                              View Payslip
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No payroll records found. Try adjusting your search or {' '}
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-secondary" 
                            onClick={() => navigate("/payroll/process")}
                          >
                            process a payroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
