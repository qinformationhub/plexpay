import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/dashboard";
import Expenses from "@/pages/expenses";
import AddExpense from "@/pages/expenses/add";
import EditExpense from "@/pages/expenses/edit";
import AddIncome from "@/pages/income/add";
import Payroll from "@/pages/payroll";
import AddEmployee from "@/pages/payroll/add-employee";
import EmployeeDetails from "@/pages/payroll/employee-details";
import ProcessPayroll from "@/pages/payroll/process-payroll";
import Reports from "@/pages/reports";
import ExpenseReport from "@/pages/reports/expenses";
import PayrollReport from "@/pages/reports/payroll";
import FinancialReport from "@/pages/reports/financial";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function LoginForm() {
  const { login } = useAuth();
  const { toast } = useToast();

  const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/auth/login", values);
      return res.json();
    },
    onSuccess: (data) => {
      login(data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.name}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-primary font-inter">PlexPay</h1>
          </div>
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-secondary text-black hover:bg-secondary/90" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="text-sm text-center text-gray-500 mt-4">
                <p>Demo credentials:</p>
                <p><strong>Admin:</strong> username: admin / password: password123</p>
                <p><strong>Staff:</strong> username: staff / password: password123</p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/expenses/add" component={AddExpense} />
        <Route path="/expenses/edit/:id" component={EditExpense} />
        <Route path="/income/add" component={AddIncome} />
        <Route path="/payroll" component={Payroll} />
        <Route path="/payroll/add-employee" component={AddEmployee} />
        <Route path="/payroll/employee/:id" component={EmployeeDetails} />
        <Route path="/payroll/process" component={ProcessPayroll} />
        <Route path="/reports" component={Reports} />
        <Route path="/reports/expenses" component={ExpenseReport} />
        <Route path="/reports/payroll" component={PayrollReport} />
        <Route path="/reports/financial" component={FinancialReport} />
        <Route path="/users" component={Users} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
