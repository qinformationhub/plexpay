import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { DollarSign, Tag, Users, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  category: string;
  date: Date;
  amount: number;
  details?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

export default function TransactionsTable({ transactions, onViewAll }: TransactionsTableProps) {
  const getIconForTransaction = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-accent" />
        </div>
      );
    }
    
    switch (transaction.category.toLowerCase()) {
      case 'payroll':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-warning" />
          </div>
        );
      case 'technology':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <Settings className="h-4 w-4 text-purple-600" />
          </div>
        );
      case 'operations':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-secondary" />
          </div>
        );
      case 'marketing':
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
            <Tag className="h-4 w-4 text-pink-600" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-gray-600" />
          </div>
        );
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' PKR';
  };
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-primary font-inter">Recent Transactions</CardTitle>
          <button 
            className="text-secondary hover:text-secondary/90 text-sm font-medium focus:outline-none"
            onClick={onViewAll}
          >
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {getIconForTransaction(transaction)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.details}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      transaction.type === 'income' 
                        ? "bg-green-100 text-green-800" 
                        : transaction.category.toLowerCase() === 'payroll' 
                          ? "bg-orange-100 text-orange-800"
                          : transaction.category.toLowerCase() === 'technology'
                            ? "bg-purple-100 text-purple-800"
                            : transaction.category.toLowerCase() === 'operations'
                              ? "bg-blue-100 text-blue-800"
                              : transaction.category.toLowerCase() === 'marketing'
                                ? "bg-pink-100 text-pink-800"
                                : "bg-gray-100 text-gray-800"
                    )}>
                      {transaction.type === 'income' ? 'Income' : transaction.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {format(transaction.date, 'MMM d, yyyy')}
                  </td>
                  <td className={cn(
                    "px-4 py-3 whitespace-nowrap text-right text-sm font-medium font-mono",
                    transaction.amount >= 0 ? "text-accent" : "text-red-500"
                  )}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
