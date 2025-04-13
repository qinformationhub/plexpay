import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertExpenseCategorySchema, 
  insertExpenseSchema,
  insertEmployeeSchema,
  insertPayrollRecordSchema,
  insertIncomeRecordSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize with demo data
  try {
    await initializeData();
  } catch (error) {
    console.error("Error initializing data:", error);
  }

  // User routes
  app.get('/api/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Expense Categories routes
  app.get('/api/expense-categories', async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllExpenseCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense categories" });
    }
  });

  app.post('/api/expense-categories', async (req: Request, res: Response) => {
    try {
      const validated = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense category" });
    }
  });

  // Expenses routes
  app.get('/api/expenses', async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const validated = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validated);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.get('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.put('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertExpenseSchema.parse(req.body);
      const updated = await storage.updateExpense(id, validated);
      
      if (!updated) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Employees routes
  app.get('/api/employees', async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', async (req: Request, res: Response) => {
    try {
      const validated = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validated);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.put('/api/employees/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertEmployeeSchema.parse(req.body);
      const updated = await storage.updateEmployee(id, validated);
      
      if (!updated) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  // Payroll routes
  app.get('/api/payroll-records', async (req: Request, res: Response) => {
    try {
      const records = await storage.getAllPayrollRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll records" });
    }
  });

  app.post('/api/payroll-records', async (req: Request, res: Response) => {
    try {
      const validated = insertPayrollRecordSchema.parse(req.body);
      const record = await storage.createPayrollRecord(validated);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create payroll record" });
    }
  });

  app.get('/api/payroll-records/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getPayrollRecord(id);
      
      if (!record) {
        return res.status(404).json({ error: "Payroll record not found" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payroll record" });
    }
  });

  app.put('/api/payroll-records/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertPayrollRecordSchema.parse(req.body);
      const updated = await storage.updatePayrollRecord(id, validated);
      
      if (!updated) {
        return res.status(404).json({ error: "Payroll record not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update payroll record" });
    }
  });

  // Income routes
  app.get('/api/income-records', async (req: Request, res: Response) => {
    try {
      const records = await storage.getAllIncomeRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch income records" });
    }
  });

  app.post('/api/income-records', async (req: Request, res: Response) => {
    try {
      const validated = insertIncomeRecordSchema.parse(req.body);
      const record = await storage.createIncomeRecord(validated);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create income record" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', async (req: Request, res: Response) => {
    try {
      const incomeRecords = await storage.getAllIncomeRecords();
      const expenses = await storage.getAllExpenses();
      const payrollRecords = await storage.getAllPayrollRecords();
      
      // Calculate total income
      const totalIncome = incomeRecords.reduce((sum, record) => {
        return sum + Number(record.amount);
      }, 0);
      
      // Calculate total expenses
      const totalExpenses = expenses.reduce((sum, expense) => {
        return sum + Number(expense.amount);
      }, 0);
      
      // Calculate current balance
      const currentBalance = totalIncome - totalExpenses;
      
      // Calculate pending payroll (sum of payroll records with status "pending")
      const pendingPayroll = payrollRecords
        .filter(record => record.status === "pending")
        .reduce((sum, record) => {
          return sum + Number(record.netAmount);
        }, 0);
      
      // Get recent transactions (combine income and expenses, sorted by date)
      const recentIncomes = incomeRecords.map(income => ({
        id: `income-${income.id}`,
        type: 'income',
        description: income.source,
        category: 'Income',
        date: new Date(income.date),
        amount: Number(income.amount)
      }));
      
      const recentExpenses = expenses.map(expense => ({
        id: `expense-${expense.id}`,
        type: 'expense',
        description: expense.description,
        category: String(expense.categoryId), // This should be replaced with actual category name when available
        date: new Date(expense.date),
        amount: -Number(expense.amount)
      }));
      
      const recentTransactions = [...recentIncomes, ...recentExpenses]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);
      
      // Get expense breakdown by category
      const expensesByCategory: Record<string, number> = {};
      
      for (const expense of expenses) {
        const categoryId = String(expense.categoryId);
        if (!expensesByCategory[categoryId]) {
          expensesByCategory[categoryId] = 0;
        }
        expensesByCategory[categoryId] += Number(expense.amount);
      }
      
      // Monthly trends
      const currentYear = new Date().getFullYear();
      const monthlyData = Array(12).fill(0).map(() => ({ income: 0, expenses: 0 }));
      
      for (const income of incomeRecords) {
        const date = new Date(income.date);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyData[month].income += Number(income.amount);
        }
      }
      
      for (const expense of expenses) {
        const date = new Date(expense.date);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthlyData[month].expenses += Number(expense.amount);
        }
      }
      
      res.json({
        metrics: {
          totalIncome,
          totalExpenses,
          currentBalance,
          pendingPayroll
        },
        recentTransactions,
        expensesByCategory,
        monthlyData
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });
  
  // Report routes
  app.get('/api/reports/financial', async (req: Request, res: Response) => {
    try {
      const incomeRecords = await storage.getAllIncomeRecords();
      const expenses = await storage.getAllExpenses();
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
      
      // Filter by date range if provided
      const filteredIncome = startDate && endDate 
        ? incomeRecords.filter(record => {
            const date = new Date(record.date);
            return date >= startDate && date <= endDate;
          })
        : incomeRecords;
        
      const filteredExpenses = startDate && endDate
        ? expenses.filter(expense => {
            const date = new Date(expense.date);
            return date >= startDate && date <= endDate;
          })
        : expenses;
      
      // Calculate totals
      const totalIncome = filteredIncome.reduce((sum, record) => sum + Number(record.amount), 0);
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const netProfit = totalIncome - totalExpenses;
      
      res.json({
        totalIncome,
        totalExpenses,
        netProfit,
        income: filteredIncome,
        expenses: filteredExpenses
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate financial report" });
    }
  });

  app.get('/api/reports/expenses', async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getAllExpenses();
      const categories = await storage.getAllExpenseCategories();
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
      
      // Filter expenses by criteria
      let filteredExpenses = expenses;
      
      if (startDate && endDate) {
        filteredExpenses = filteredExpenses.filter(expense => {
          const date = new Date(expense.date);
          return date >= startDate && date <= endDate;
        });
      }
      
      if (categoryId) {
        filteredExpenses = filteredExpenses.filter(expense => 
          expense.categoryId === categoryId
        );
      }
      
      // Create a lookup map for categories
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
      
      // Enrich expenses with category names
      const enrichedExpenses = filteredExpenses.map(expense => ({
        ...expense,
        categoryName: categoryMap.get(expense.categoryId) || 'Unknown'
      }));
      
      // Group expenses by category
      const expensesByCategory = categories.map(category => {
        const categoryExpenses = enrichedExpenses.filter(e => e.categoryId === category.id);
        const total = categoryExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          categoryId: category.id,
          categoryName: category.name,
          total,
          count: categoryExpenses.length
        };
      });
      
      res.json({
        expenses: enrichedExpenses,
        expensesByCategory,
        totalAmount: enrichedExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate expense report" });
    }
  });

  app.get('/api/reports/payroll', async (req: Request, res: Response) => {
    try {
      const payrollRecords = await storage.getAllPayrollRecords();
      const employees = await storage.getAllEmployees();
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;
      
      // Filter by date range if provided
      const filteredRecords = startDate && endDate 
        ? payrollRecords.filter(record => {
            const date = new Date(record.processedOn);
            return date >= startDate && date <= endDate;
          })
        : payrollRecords;
      
      // Create a lookup map for employees
      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));
      
      // Enrich payroll records with employee details
      const enrichedRecords = filteredRecords.map(record => {
        const employee = employeeMap.get(record.employeeId);
        return {
          ...record,
          employeeName: employee ? employee.name : 'Unknown',
          position: employee ? employee.position : 'Unknown',
          department: employee ? employee.department : 'Unknown'
        };
      });
      
      // Calculate totals
      const totalGrossAmount = enrichedRecords.reduce((sum, r) => sum + Number(r.grossAmount), 0);
      const totalDeductions = enrichedRecords.reduce((sum, r) => sum + Number(r.deductions), 0);
      const totalNetAmount = enrichedRecords.reduce((sum, r) => sum + Number(r.netAmount), 0);
      
      // Group by department
      const departmentMap = new Map();
      enrichedRecords.forEach(record => {
        if (!departmentMap.has(record.department)) {
          departmentMap.set(record.department, { 
            totalGross: 0, 
            totalNet: 0, 
            count: 0 
          });
        }
        const dept = departmentMap.get(record.department);
        dept.totalGross += Number(record.grossAmount);
        dept.totalNet += Number(record.netAmount);
        dept.count += 1;
      });
      
      const payrollByDepartment = Array.from(departmentMap.entries()).map(([department, data]) => ({
        department,
        ...data
      }));
      
      res.json({
        payrollRecords: enrichedRecords,
        totalGrossAmount,
        totalDeductions,
        totalNetAmount,
        payrollByDepartment
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate payroll report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize demo data
async function initializeData() {
  // Create admin user if it doesn't exist
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      password: "password123",
      name: "Admin User",
      email: "admin@plexpay.com",
      role: "admin"
    });
  }

  // Create sample staff user
  const staffUser = await storage.getUserByUsername("staff");
  if (!staffUser) {
    await storage.createUser({
      username: "staff",
      password: "password123",
      name: "Staff User",
      email: "staff@plexpay.com",
      role: "staff"
    });
  }

  // Create expense categories
  const categories = [
    { name: "Payroll", description: "Employee salaries and benefits" },
    { name: "Operations", description: "Day-to-day operational expenses" },
    { name: "Technology", description: "Software, hardware, and IT services" },
    { name: "Marketing", description: "Advertising and promotion" },
    { name: "Rent", description: "Office space and utilities" }
  ];

  for (const category of categories) {
    const existing = (await storage.getAllExpenseCategories()).find(c => c.name === category.name);
    if (!existing) {
      await storage.createExpenseCategory(category);
    }
  }

  // Create sample employees if they don't exist
  const employees = [
    {
      name: "John Smith",
      position: "Software Engineer",
      department: "Engineering",
      email: "john@plexpay.com",
      phoneNumber: "555-1234",
      address: "123 Main St",
      salary: "85000",
      dateHired: new Date("2022-03-15"),
      isActive: true
    },
    {
      name: "Jane Doe",
      position: "Marketing Manager",
      department: "Marketing",
      email: "jane@plexpay.com",
      phoneNumber: "555-5678",
      address: "456 Oak Ave",
      salary: "75000",
      dateHired: new Date("2021-11-01"),
      isActive: true
    },
    {
      name: "Robert Johnson",
      position: "Financial Analyst",
      department: "Finance",
      email: "robert@plexpay.com",
      phoneNumber: "555-9012",
      address: "789 Pine St",
      salary: "82000",
      dateHired: new Date("2022-01-10"),
      isActive: true
    }
  ];

  const existingEmployees = await storage.getAllEmployees();
  if (existingEmployees.length === 0) {
    for (const employee of employees) {
      await storage.createEmployee(employee);
    }
  }

  // Add sample expenses if they don't exist
  const existingExpenses = await storage.getAllExpenses();
  if (existingExpenses.length === 0) {
    const categories = await storage.getAllExpenseCategories();
    const userId = (await storage.getUserByUsername("admin"))?.id || 1;
    
    const expenses = [
      {
        description: "Office Supplies",
        amount: "1250.00",
        date: new Date("2023-05-12"),
        categoryId: categories.find(c => c.name === "Operations")?.id || 2,
        userId,
        notes: "Quarterly office supply restocking"
      },
      {
        description: "Software Subscription",
        amount: "299.00",
        date: new Date("2023-05-01"),
        categoryId: categories.find(c => c.name === "Technology")?.id || 3,
        userId,
        notes: "Monthly software subscription"
      },
      {
        description: "Marketing Campaign",
        amount: "3500.00",
        date: new Date("2023-04-28"),
        categoryId: categories.find(c => c.name === "Marketing")?.id || 4,
        userId,
        notes: "Q2 digital marketing campaign"
      },
      {
        description: "Office Rent",
        amount: "5000.00",
        date: new Date("2023-05-01"),
        categoryId: categories.find(c => c.name === "Rent")?.id || 5,
        userId,
        notes: "Monthly office rent"
      },
      {
        description: "IT Equipment",
        amount: "4200.00",
        date: new Date("2023-04-15"),
        categoryId: categories.find(c => c.name === "Technology")?.id || 3,
        userId,
        notes: "New laptops for engineering team"
      }
    ];
    
    for (const expense of expenses) {
      await storage.createExpense(expense);
    }
  }

  // Add sample income records if they don't exist
  const existingIncomes = await storage.getAllIncomeRecords();
  if (existingIncomes.length === 0) {
    const userId = (await storage.getUserByUsername("admin"))?.id || 1;
    
    const incomes = [
      {
        source: "Client A",
        amount: "15000.00",
        date: new Date("2023-04-05"),
        description: "Project completion payment",
        userId
      },
      {
        source: "Client B",
        amount: "8500.00",
        date: new Date("2023-05-10"),
        description: "Monthly retainer",
        userId
      },
      {
        source: "Client C",
        amount: "22000.00",
        date: new Date("2023-05-02"),
        description: "Service contract",
        userId
      },
      {
        source: "Client D",
        amount: "35000.00",
        date: new Date("2023-04-20"),
        description: "Product licensing",
        userId
      }
    ];
    
    for (const income of incomes) {
      await storage.createIncomeRecord(income);
    }
  }

  // Add sample payroll records if they don't exist
  const existingPayrolls = await storage.getAllPayrollRecords();
  if (existingPayrolls.length === 0) {
    const employees = await storage.getAllEmployees();
    const userId = (await storage.getUserByUsername("admin"))?.id || 1;
    
    for (const employee of employees) {
      const monthlySalary = Number(employee.salary) / 12;
      const deductions = monthlySalary * 0.2; // 20% deductions for taxes, benefits, etc.
      const netAmount = monthlySalary - deductions;
      
      await storage.createPayrollRecord({
        employeeId: employee.id,
        userId,
        payPeriodStart: new Date("2023-04-01"),
        payPeriodEnd: new Date("2023-04-30"),
        grossAmount: String(monthlySalary.toFixed(2)),
        deductions: String(deductions.toFixed(2)),
        netAmount: String(netAmount.toFixed(2)),
        processedOn: new Date("2023-05-01"),
        notes: "April 2023 Salary",
        status: "completed"
      });
      
      await storage.createPayrollRecord({
        employeeId: employee.id,
        userId,
        payPeriodStart: new Date("2023-05-01"),
        payPeriodEnd: new Date("2023-05-31"),
        grossAmount: String(monthlySalary.toFixed(2)),
        deductions: String(deductions.toFixed(2)),
        netAmount: String(netAmount.toFixed(2)),
        processedOn: new Date("2023-05-01"),
        notes: "May 2023 Salary",
        status: "pending"
      });
    }
  }
}
