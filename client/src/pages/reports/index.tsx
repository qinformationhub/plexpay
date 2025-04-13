import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BarChart, 
  CreditCard, 
  Users, 
  DollarSign, 
  Calendar 
} from "lucide-react";

export default function Reports() {
  const [_, navigate] = useLocation();
  
  const reportTypes = [
    {
      title: "Financial Report",
      description: "Comprehensive income and expense summary with balance calculations",
      icon: <DollarSign className="h-12 w-12 text-secondary" />,
      path: "/reports/financial",
      features: [
        "Income vs Expense breakdown",
        "Monthly financial summary",
        "Net profit calculation",
        "Balance trend analysis"
      ]
    },
    {
      title: "Expense Report",
      description: "Detailed analysis of organizational expenses by category and time period",
      icon: <CreditCard className="h-12 w-12 text-red-500" />,
      path: "/reports/expenses",
      features: [
        "Expense categorization",
        "Trend analysis by period",
        "Top expense categories",
        "Expense filtering capabilities"
      ]
    },
    {
      title: "Payroll Report",
      description: "Employee salary records and payroll distribution analytics",
      icon: <Users className="h-12 w-12 text-warning" />,
      path: "/reports/payroll",
      features: [
        "Department salary breakdown",
        "Employee payment history",
        "Payroll tax calculations",
        "Compensation analysis"
      ]
    }
  ];
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary font-inter">Reports Center</h2>
        <p className="text-gray-500 mt-1">Generate and analyze financial reports</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <div className="mb-4">{report.icon}</div>
              <CardTitle>{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="h-5 w-5 text-secondary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={() => navigate(report.path)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-primary mb-4">Recent Reports</h3>
        
        <div className="border rounded-md divide-y">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-secondary mr-3" />
              <div>
                <h4 className="font-medium">Monthly Financial Summary</h4>
                <p className="text-sm text-gray-500">Generated on May 1, 2023</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h4 className="font-medium">Q1 Expense Analysis</h4>
                <p className="text-sm text-gray-500">Generated on April 15, 2023</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-warning mr-3" />
              <div>
                <h4 className="font-medium">April Payroll Summary</h4>
                <p className="text-sm text-gray-500">Generated on April 30, 2023</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-10 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Report Schedule</h3>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Manage Schedule
          </Button>
        </div>
        
        <div className="border rounded-md divide-y">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">Monthly Financial Report</h4>
              <p className="text-sm text-gray-500">Scheduled for 1st of every month</p>
            </div>
            <Badge className="bg-accent">Active</Badge>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">Weekly Expense Report</h4>
              <p className="text-sm text-gray-500">Scheduled for every Monday</p>
            </div>
            <Badge className="bg-accent">Active</Badge>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">Quarterly Tax Summary</h4>
              <p className="text-sm text-gray-500">Scheduled for last day of quarter</p>
            </div>
            <Badge className="bg-gray-200 text-gray-800">Inactive</Badge>
          </div>
        </div>
      </div>
    </>
  );
}

// This component is used in JSX but not explicitly imported
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      className
    )}>
      {children}
    </span>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
