import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Download, 
  Mail,
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Users,
  DollarSign,
  Printer,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/utils/exportUtils";

export default function EmployeeDetails({ params }: { params: { id: string } }) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] = useState<any>(null);
  
  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: [`/api/employees/${params.id}`],
  });
  
  const { data: payrollRecords, isLoading: payrollLoading } = useQuery({
    queryKey: ['/api/payroll-records'],
  });
  
  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(typeof amount === 'string' ? Number(amount) : amount);
  };
  
  const employeePayrollRecords = payrollRecords 
    ? payrollRecords.filter((record: any) => record.employeeId === parseInt(params.id))
    : [];
  
  const handlePrintPayslip = () => {
    if (!selectedPayrollRecord) return;
    
    toast({
      title: "Printing Payslip",
      description: "Your payslip is being prepared for printing.",
    });
    
    // In a real app, this would trigger an actual print function
    setTimeout(() => {
      toast({
        title: "Print Ready",
        description: "Your payslip has been sent to the printer.",
      });
    }, 1500);
  };
  
  const handleEmailPayslip = () => {
    if (!selectedPayrollRecord || !employee) return;
    
    toast({
      title: "Sending Email",
      description: `Payslip is being sent to ${employee.email}`,
    });
    
    // In a real app, this would trigger an actual email sending function
    setTimeout(() => {
      toast({
        title: "Email Sent",
        description: "Payslip has been emailed successfully.",
      });
    }, 1500);
  };
  
  const handleDownloadPayslip = () => {
    if (!selectedPayrollRecord || !employee) return;
    
    const payslipContent = {
      employeeName: employee.name,
      position: employee.position,
      payPeriod: `${format(new Date(selectedPayrollRecord.payPeriodStart), 'MMM d, yyyy')} - ${format(new Date(selectedPayrollRecord.payPeriodEnd), 'MMM d, yyyy')}`,
      grossAmount: formatCurrency(selectedPayrollRecord.grossAmount),
      deductions: formatCurrency(selectedPayrollRecord.deductions),
      netAmount: formatCurrency(selectedPayrollRecord.netAmount),
      processedDate: format(new Date(selectedPayrollRecord.processedOn), 'MMM d, yyyy'),
    };
    
    exportToPdf(`Payslip_${employee.name}_${format(new Date(selectedPayrollRecord.payPeriodEnd), 'MMMyyyy')}`, payslipContent);
    
    toast({
      title: "Download Started",
      description: "Your payslip PDF is being downloaded.",
    });
  };
  
  const openPayslip = (payrollRecord: any) => {
    setSelectedPayrollRecord(payrollRecord);
    setShowPayslipModal(true);
  };
  
  if (employeeLoading || payrollLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 h-[300px]"></div>
          <div className="bg-white rounded-lg shadow-sm p-6 h-[300px] md:col-span-2"></div>
        </div>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-primary font-inter mb-2">Employee Not Found</h2>
        <p className="text-gray-500 mb-6">The employee you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate("/payroll")}
          className="bg-secondary hover:bg-secondary/90"
        >
          Back to Payroll
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Employee Details</h2>
          <p className="text-gray-500 mt-1">View and manage employee information</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate("/payroll")}
          >
            Back to Payroll
          </Button>
          <Button 
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => navigate("/payroll/process")}
          >
            Process Payroll
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Employee Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <Badge
                variant={employee.isActive ? "default" : "secondary"}
              >
                {employee.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription>Employee personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-white text-xl font-bold">
                {employee.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-primary">{employee.name}</h3>
                <p className="text-gray-500">{employee.position}</p>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">{employee.email}</span>
              </div>
              
              {employee.phoneNumber && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-sm">{employee.phoneNumber}</span>
                </div>
              )}
              
              {employee.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm">{employee.address}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">Hired: {format(new Date(employee.dateHired), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-4 w-4 mr-2" />
                <span className="text-sm">Position: {employee.position}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">Dept: {employee.department}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="text-sm">Salary: {formatCurrency(employee.salary)}/year</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/payroll/edit-employee/${employee.id}`)}
            >
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
        
        {/* Payroll History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>Previous salary payments and records</CardDescription>
          </CardHeader>
          <CardContent>
            {employeePayrollRecords.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pay Period</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePayrollRecords.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.payPeriodStart), 'MMM d')} - {format(new Date(record.payPeriodEnd), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(record.grossAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-500">
                          {formatCurrency(record.deductions)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-500">
                          {formatCurrency(record.netAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.status === 'completed' ? "success" : record.status === 'pending' ? "secondary" : record.status === 'failed' ? "destructive" : "secondary"}
                          >
                            {record.status === 'completed' ? "Completed" : record.status === 'pending' ? "Pending" : record.status === 'failed' ? "Failed" : "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPayslip(record)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-md">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600 mb-1">No Payroll Records</h3>
                <p className="text-sm text-gray-500 mb-4">
                  This employee doesn't have any payroll records yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/payroll/process")}
                >
                  Process First Payroll
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Payslip Modal */}
      <Dialog open={showPayslipModal} onOpenChange={setShowPayslipModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employee Payslip</DialogTitle>
            <DialogDescription>
              Payroll period: {selectedPayrollRecord && `${format(new Date(selectedPayrollRecord.payPeriodStart), 'MMM d, yyyy')} - ${format(new Date(selectedPayrollRecord.payPeriodEnd), 'MMM d, yyyy')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayrollRecord && (
            <div className="border rounded-md p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-primary">PAYSLIP</h2>
                  <p className="text-gray-500">
                    Pay Period: {format(new Date(selectedPayrollRecord.payPeriodStart), 'MMM d, yyyy')} - {format(new Date(selectedPayrollRecord.payPeriodEnd), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg">PlexPay Financial</h3>
                  <p className="text-sm text-gray-500">123 Business Street</p>
                  <p className="text-sm text-gray-500">Business City, BZ 12345</p>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">EMPLOYEE</h4>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-semibold text-gray-500">PAYMENT DETAILS</h4>
                    <p className="font-medium">Payment Date: {format(new Date(selectedPayrollRecord.processedOn), 'MMM d, yyyy')}</p>
                    <p className="text-sm text-gray-600">Payment Method: Direct Deposit</p>
                    <p className="text-sm text-gray-600">Payment Status: {selectedPayrollRecord.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">EARNINGS</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Salary</span>
                    <span className="font-mono">{formatCurrency(selectedPayrollRecord.grossAmount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">DEDUCTIONS</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Tax & Benefits</span>
                    <span className="font-mono text-red-500">-{formatCurrency(selectedPayrollRecord.deductions)}</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">NET PAY</span>
                  <span className="font-bold text-lg font-mono text-accent">{formatCurrency(selectedPayrollRecord.netAmount)}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handlePrintPayslip}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleEmailPayslip}>
              <Send className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button 
              onClick={handleDownloadPayslip} 
              className="bg-secondary hover:bg-secondary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
