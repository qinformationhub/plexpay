import { pgTable, text, serial, integer, numeric, timestamp, boolean, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("staff"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

// Expense Categories
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).pick({
  name: true,
  description: true,
});

// Expenses
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  notes: text("notes"),
  receipt: text("receipt"),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  date: true,
  categoryId: true,
  userId: true,
  notes: true,
  receipt: true,
});

// Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  address: text("address"),
  salary: numeric("salary").notNull(),
  dateHired: timestamp("date_hired").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  name: true,
  position: true,
  department: true,
  email: true,
  phoneNumber: true,
  address: true,
  salary: true,
  dateHired: true,
  isActive: true,
});

// Payroll Records
export const payrollRecords = pgTable("payroll_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  userId: integer("user_id").notNull(),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  grossAmount: numeric("gross_amount").notNull(),
  deductions: numeric("deductions").notNull(),
  netAmount: numeric("net_amount").notNull(),
  processedOn: timestamp("processed_on").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
});

export const insertPayrollRecordSchema = createInsertSchema(payrollRecords).pick({
  employeeId: true,
  userId: true,
  payPeriodStart: true,
  payPeriodEnd: true,
  grossAmount: true,
  deductions: true,
  netAmount: true,
  processedOn: true,
  notes: true,
  status: true,
});

// Income Records
export const incomeRecords = pgTable("income_records", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  amount: numeric("amount").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
});

export const insertIncomeRecordSchema = createInsertSchema(incomeRecords).pick({
  source: true,
  amount: true,
  date: true,
  description: true,
  userId: true,
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  payrollRecords: many(payrollRecords),
  incomeRecords: many(incomeRecords),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  payrollRecords: many(payrollRecords),
}));

export const payrollRecordsRelations = relations(payrollRecords, ({ one }) => ({
  employee: one(employees, {
    fields: [payrollRecords.employeeId],
    references: [employees.id],
  }),
  user: one(users, {
    fields: [payrollRecords.userId],
    references: [users.id],
  }),
}));

export const incomeRecordsRelations = relations(incomeRecords, ({ one }) => ({
  user: one(users, {
    fields: [incomeRecords.userId],
    references: [users.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type InsertPayrollRecord = z.infer<typeof insertPayrollRecordSchema>;

export type IncomeRecord = typeof incomeRecords.$inferSelect;
export type InsertIncomeRecord = z.infer<typeof insertIncomeRecordSchema>;

// Extended schemas with validation
export const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Amount is required").or(z.number().positive("Amount must be positive")),
  date: z.string().or(z.date()),
  categoryId: z.number().or(z.string().min(1, "Category is required")),
});

export const employeeFormSchema = insertEmployeeSchema.extend({
  salary: z.string().min(1, "Salary is required").or(z.number().positive("Salary must be positive")),
  dateHired: z.string().or(z.date()),
});

export const payrollFormSchema = insertPayrollRecordSchema.extend({
  payPeriodStart: z.string().or(z.date()),
  payPeriodEnd: z.string().or(z.date()),
  grossAmount: z.string().min(1, "Gross amount is required").or(z.number().positive("Amount must be positive")),
  deductions: z.string().min(1, "Deductions are required").or(z.number().nonnegative("Deductions must be non-negative")),
  netAmount: z.string().min(1, "Net amount is required").or(z.number().positive("Amount must be positive")),
  processedOn: z.string().or(z.date()),
});

export const incomeFormSchema = insertIncomeRecordSchema.extend({
  amount: z.string().min(1, "Amount is required").or(z.number().positive("Amount must be positive")),
  date: z.string().or(z.date()),
});
