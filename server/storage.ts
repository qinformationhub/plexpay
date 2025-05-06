import { 
  users, type User, type InsertUser,
  expenseCategories, type ExpenseCategory, type InsertExpenseCategory,
  expenses, type Expense, type InsertExpense,
  employees, type Employee, type InsertEmployee,
  payrollRecords, type PayrollRecord, type InsertPayrollRecord,
  incomeRecords, type IncomeRecord, type InsertIncomeRecord
} from "@shared/schema";
import { db } from './db';
import { eq, asc, desc, sql } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Expense Category methods
  getExpenseCategory(id: number): Promise<ExpenseCategory | undefined>;
  getAllExpenseCategories(): Promise<ExpenseCategory[]>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  
  // Expense methods
  getExpense(id: number): Promise<Expense | undefined>;
  getAllExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: InsertExpense): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Employee methods
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: InsertEmployee): Promise<Employee | undefined>;
  
  // Payroll Record methods
  getPayrollRecord(id: number): Promise<PayrollRecord | undefined>;
  getAllPayrollRecords(): Promise<PayrollRecord[]>;
  createPayrollRecord(record: InsertPayrollRecord): Promise<PayrollRecord>;
  updatePayrollRecord(id: number, record: InsertPayrollRecord): Promise<PayrollRecord | undefined>;
  
  // Income Record methods
  getIncomeRecord(id: number): Promise<IncomeRecord | undefined>;
  getAllIncomeRecords(): Promise<IncomeRecord[]>;
  createIncomeRecord(record: InsertIncomeRecord): Promise<IncomeRecord>;
  getPaginatedIncomeRecords(page: number, limit: number): Promise<{ data: IncomeRecord[]; total: number }>;
  updateIncomeRecord(id: number, updateData: InsertIncomeRecord): Promise<IncomeRecord | undefined>;
  deleteIncomeRecord(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private expenseCategoriesStore: Map<number, ExpenseCategory>;
  private expensesStore: Map<number, Expense>;
  private employeesStore: Map<number, Employee>;
  private payrollRecordsStore: Map<number, PayrollRecord>;
  private incomeRecordsStore: Map<number, IncomeRecord>;
  
  private userIdCounter: number;
  private expenseCategoryIdCounter: number;
  private expenseIdCounter: number;
  private employeeIdCounter: number;
  private payrollRecordIdCounter: number;
  private incomeRecordIdCounter: number;

  constructor() {
    this.usersStore = new Map();
    this.expenseCategoriesStore = new Map();
    this.expensesStore = new Map();
    this.employeesStore = new Map();
    this.payrollRecordsStore = new Map();
    this.incomeRecordsStore = new Map();
    
    this.userIdCounter = 1;
    this.expenseCategoryIdCounter = 1;
    this.expenseIdCounter = 1;
    this.employeeIdCounter = 1;
    this.payrollRecordIdCounter = 1;
    this.incomeRecordIdCounter = 1;
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, role: insertUser.role ?? "staff" };
    this.usersStore.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersStore.values());
  }

  // Expense Category Methods
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    return this.expenseCategoriesStore.get(id);
  }
  
  async getAllExpenseCategories(): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategoriesStore.values());
  }
  
  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.expenseCategoryIdCounter++;
    const category: ExpenseCategory = { ...insertCategory, id, description: insertCategory.description ?? null };
    this.expenseCategoriesStore.set(id, category);
    return category;
  }

  // Expense Methods
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expensesStore.get(id);
  }
  
  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expensesStore.values());
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const expense: Expense = { ...insertExpense, id, notes: insertExpense.notes ?? null, receipt: insertExpense.receipt ?? null };
    this.expensesStore.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, updateData: InsertExpense): Promise<Expense | undefined> {
    const existingExpense = this.expensesStore.get(id);
    if (!existingExpense) return undefined;
    
    const updatedExpense: Expense = { ...updateData, id, notes: updateData.notes ?? null, receipt: updateData.receipt ?? null };
    this.expensesStore.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expensesStore.delete(id);
  }

  // Employee Methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employeesStore.get(id);
  }
  
  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employeesStore.values());
  }
  
  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.employeeIdCounter++;
    const employee: Employee = { ...insertEmployee, id, phoneNumber: insertEmployee.phoneNumber ?? null, address: insertEmployee.address ?? null, isActive: insertEmployee.isActive ?? null };
    this.employeesStore.set(id, employee);
    return employee;
  }
  
  async updateEmployee(id: number, updateData: InsertEmployee): Promise<Employee | undefined> {
    const existingEmployee = this.employeesStore.get(id);
    if (!existingEmployee) return undefined;
    
    const updatedEmployee: Employee = { ...updateData, id, phoneNumber: updateData.phoneNumber ?? null, address: updateData.address ?? null, isActive: updateData.isActive ?? null };
    this.employeesStore.set(id, updatedEmployee);
    return updatedEmployee;
  }

  // Payroll Record Methods
  async getPayrollRecord(id: number): Promise<PayrollRecord | undefined> {
    return this.payrollRecordsStore.get(id);
  }
  
  async getAllPayrollRecords(): Promise<PayrollRecord[]> {
    return Array.from(this.payrollRecordsStore.values());
  }
  
  async createPayrollRecord(insertRecord: InsertPayrollRecord): Promise<PayrollRecord> {
    const id = this.payrollRecordIdCounter++;
    const record: PayrollRecord = { ...insertRecord, id, status: insertRecord.status ?? "completed", notes: insertRecord.notes ?? null };
    this.payrollRecordsStore.set(id, record);
    return record;
  }
  
  async updatePayrollRecord(id: number, updateData: InsertPayrollRecord): Promise<PayrollRecord | undefined> {
    const existingRecord = this.payrollRecordsStore.get(id);
    if (!existingRecord) return undefined;
    
    const updatedRecord: PayrollRecord = { ...updateData, id, status: updateData.status ?? "completed", notes: updateData.notes ?? null };
    this.payrollRecordsStore.set(id, updatedRecord);
    return updatedRecord;
  }

  // Income Record Methods
  async getIncomeRecord(id: number): Promise<IncomeRecord | undefined> {
    return this.incomeRecordsStore.get(id);
  }
  
  async getAllIncomeRecords(): Promise<IncomeRecord[]> {
    return Array.from(this.incomeRecordsStore.values());
  }
  
  async getPaginatedIncomeRecords(page: number, limit: number): Promise<{ data: IncomeRecord[]; total: number }> {
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(incomeRecords);
    const total = Number(count);
    const data = await db.select().from(incomeRecords)
      .orderBy(desc(incomeRecords.date))
      .limit(limit)
      .offset((page - 1) * limit);
    return { data, total };
  }
  
  async createIncomeRecord(insertRecord: InsertIncomeRecord): Promise<IncomeRecord> {
    const id = this.incomeRecordIdCounter++;
    const record: IncomeRecord = { ...insertRecord, id, description: insertRecord.description ?? null };
    this.incomeRecordsStore.set(id, record);
    return record;
  }

  async updateIncomeRecord(id: number, updateData: InsertIncomeRecord): Promise<IncomeRecord | undefined> {
    const existingRecord = this.incomeRecordsStore.get(id);
    if (!existingRecord) return undefined;
    
    const updatedRecord: IncomeRecord = { ...updateData, id, description: updateData.description ?? null };
    this.incomeRecordsStore.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteIncomeRecord(id: number): Promise<boolean> {
    return this.incomeRecordsStore.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Expense Category Methods
  async getExpenseCategory(id: number): Promise<ExpenseCategory | undefined> {
    const [category] = await db.select().from(expenseCategories).where(eq(expenseCategories.id, id));
    return category;
  }

  async getAllExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories).orderBy(asc(expenseCategories.name));
  }

  async createExpenseCategory(insertCategory: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [category] = await db.insert(expenseCategories).values(insertCategory).returning();
    return category;
  }

  // Expense Methods
  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }

  async updateExpense(id: number, updateData: InsertExpense): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    await db.delete(expenses).where(eq(expenses.id, id));
    return true;
  }

  // Employee Methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(asc(employees.name));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: number, updateData: InsertEmployee): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();
    return employee;
  }

  // Payroll Record Methods
  async getPayrollRecord(id: number): Promise<PayrollRecord | undefined> {
    const [record] = await db.select().from(payrollRecords).where(eq(payrollRecords.id, id));
    return record;
  }

  async getAllPayrollRecords(): Promise<PayrollRecord[]> {
    return await db.select().from(payrollRecords).orderBy(desc(payrollRecords.processedOn));
  }

  async createPayrollRecord(insertRecord: InsertPayrollRecord): Promise<PayrollRecord> {
    const [record] = await db.insert(payrollRecords).values(insertRecord).returning();
    return record;
  }

  async updatePayrollRecord(id: number, updateData: InsertPayrollRecord): Promise<PayrollRecord | undefined> {
    const [record] = await db
      .update(payrollRecords)
      .set(updateData)
      .where(eq(payrollRecords.id, id))
      .returning();
    return record;
  }

  // Income Record Methods
  async getIncomeRecord(id: number): Promise<IncomeRecord | undefined> {
    const [record] = await db.select().from(incomeRecords).where(eq(incomeRecords.id, id));
    return record;
  }

  async getAllIncomeRecords(): Promise<IncomeRecord[]> {
    return await db.select().from(incomeRecords).orderBy(desc(incomeRecords.date));
  }

  async getPaginatedIncomeRecords(page: number, limit: number): Promise<{ data: IncomeRecord[]; total: number }> {
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(incomeRecords);
    const total = Number(count);
    const data = await db.select().from(incomeRecords)
      .orderBy(desc(incomeRecords.date))
      .limit(limit)
      .offset((page - 1) * limit);
    return { data, total };
  }

  async createIncomeRecord(insertRecord: InsertIncomeRecord): Promise<IncomeRecord> {
    const [record] = await db.insert(incomeRecords).values(insertRecord).returning();
    return record;
  }

  async updateIncomeRecord(id: number, updateData: InsertIncomeRecord): Promise<IncomeRecord | undefined> {
    const [record] = await db
      .update(incomeRecords)
      .set(updateData)
      .where(eq(incomeRecords.id, id))
      .returning();
    return record;
  }

  async deleteIncomeRecord(id: number): Promise<boolean> {
    await db.delete(incomeRecords).where(eq(incomeRecords.id, id));
    return true;
  }
}

// Replace MemStorage with DatabaseStorage
export const storage = new DatabaseStorage();
