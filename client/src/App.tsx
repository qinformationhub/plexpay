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
import EditIncome from "@/pages/income/edit";
import Users from "@/pages/users";
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
    <div className="min-h-screen w-full flex items-center justify-center relative bg-background overflow-hidden">
      {/* Finance-themed Background Pattern */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Abstract Money Flow Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute transform -rotate-45"
              style={{
                top: `${i * 20}%`,
                left: '-10%',
                width: '120%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent 0%, currentColor 50%, transparent 100%)'
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-background to-secondary/[0.05]"></div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
          <svg width="400" height="400" viewBox="0 0 100 100" className="text-primary/[0.03]">
            <path d="M50 0C77.6142 0 100 22.3858 100 50C100 77.6142 77.6142 100 50 100C22.3858 100 0 77.6142 0 50C0 22.3858 22.3858 0 50 0ZM50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20Z" fill="currentColor"/>
          </svg>
        </div>
        
        {/* Dollar Symbol Watermarks */}
        <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4">
          <svg width="300" height="300" viewBox="0 0 24 24" className="text-secondary/[0.02]">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 shadow-xl border-t-4 border-t-primary border-x-0 border-b-0 bg-white/95 relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" 
                 className="h-12 w-12 text-primary mr-2 transform transition-transform hover:scale-110 drop-shadow-md" 
                 viewBox="0 0 20 20" 
                 fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>

            <h1 className="text-3xl font-bold text-primary font-inter tracking-tight drop-shadow-sm">PlexPay</h1>
          </div>
          <CardTitle className="text-2xl text-center text-foreground font-semibold">Welcome Back</CardTitle>
          <p className="text-sm text-center text-muted-foreground">Manage your payroll with confidence</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-white" 
                        {...field} 
                      />
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
                    <FormLabel className="text-foreground/90">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/30 bg-white"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 py-6 text-lg font-medium shadow-md hover:shadow-lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
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
        <Route path="/income/edit/:id" component={EditIncome} />
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
