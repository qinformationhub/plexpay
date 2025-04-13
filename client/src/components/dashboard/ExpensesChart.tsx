import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface CategoryData {
  name: string;
  value: number;
}

interface ExpensesChartProps {
  data: CategoryData[];
}

const COLORS = ['#4299E1', '#F6AD55', '#48BB78', '#805AD5', '#D53F8C'];

export default function ExpensesChart({ data }: ExpensesChartProps) {
  const formatPercent = (value: number) => {
    return `${value}%`;
  };
  
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: Math.round((item.value / totalValue) * 100)
  }));
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-primary font-inter">Expense Categories</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-secondary hover:text-secondary/90 focus:outline-none">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Download as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export to Excel</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercentage}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
              >
                {dataWithPercentage.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => {
                  const item = dataWithPercentage.find(d => d.name === name);
                  return [`${item?.percentage}%`, name];
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '6px', 
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                iconSize={6}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
