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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Search, Download, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function Expenses() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['/api/expenses']
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/expense-categories']
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Expense deleted",
        description: "The expense has been successfully deleted.",
      });
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete expense",
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
  
  const getCategoryName = (categoryId: number) => {
    if (!categories) return "Loading...";
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category ? category.name : "Unknown";
  };
  
  const filteredExpenses = expenses ? expenses.filter((expense: any) => {
    const matchesSearch = search === "" || 
      expense.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || categoryFilter === "all" || 
      expense.categoryId === parseInt(categoryFilter);
    
    return matchesSearch && matchesCategory;
  }) : [];
  
  const handleExportToExcel = () => {
    toast({
      title: "Export started",
      description: "Your expenses data is being exported to Excel.",
    });
    // In a real app, this would trigger an actual export
  };
  
  const handleExportToPDF = () => {
    toast({
      title: "Export started",
      description: "Your expenses data is being exported to PDF.",
    });
    // In a real app, this would trigger an actual export
  };
  
  const handleDeleteExpense = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  if (expensesLoading || categoriesLoading) {
    return (
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-40 bg-gray-300 rounded"></div>
          <div className="h-10 w-32 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="h-10 w-64 bg-gray-300 rounded mb-4 md:mb-0"></div>
            <div className="h-10 w-40 bg-gray-300 rounded"></div>
          </div>
          <div className="h-[400px] bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-inter">Expense Management</h2>
          <p className="text-gray-500 mt-1">Add, edit and manage your organizational expenses</p>
        </div>
        <Button 
          className="mt-4 sm:mt-0 bg-secondary hover:bg-secondary/90"
          onClick={() => navigate("/expenses/add")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            View and manage all your recorded expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="relative w-full md:w-64 mb-4 md:mb-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search expenses..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportToExcel}>
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportToPDF}>
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs inline-flex items-center",
                          getCategoryName(expense.categoryId) === "Payroll" ? "bg-orange-100 text-orange-800" :
                          getCategoryName(expense.categoryId) === "Technology" ? "bg-purple-100 text-purple-800" :
                          getCategoryName(expense.categoryId) === "Operations" ? "bg-blue-100 text-blue-800" :
                          getCategoryName(expense.categoryId) === "Marketing" ? "bg-pink-100 text-pink-800" :
                          "bg-gray-100 text-gray-800"
                        )}>
                          {getCategoryName(expense.categoryId)}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right font-mono text-red-500">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/expenses/edit/${expense.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmDeleteId(expense.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      No expenses found. Try adjusting your filters or {' '}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-secondary" 
                        onClick={() => navigate("/expenses/add")}
                      >
                        add an expense
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this expense. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDeleteExpense(confirmDeleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
