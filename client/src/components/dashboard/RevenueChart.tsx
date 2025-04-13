import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

type Period = "month" | "quarter" | "year";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface RevenueChartProps {
  data: MonthlyData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [activePeriod, setActivePeriod] = useState<Period>("quarter");
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'decimal',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value) + ' PKR';
  };
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-primary font-inter">Revenue Trends</CardTitle>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button 
              size="sm" 
              variant={activePeriod === "month" ? "default" : "outline"} 
              className={activePeriod === "month" ? "bg-secondary hover:bg-secondary/90" : ""}
              onClick={() => setActivePeriod("month")}
            >
              Month
            </Button>
            <Button 
              size="sm" 
              variant={activePeriod === "quarter" ? "default" : "outline"} 
              className={activePeriod === "quarter" ? "bg-secondary hover:bg-secondary/90" : ""}
              onClick={() => setActivePeriod("quarter")}
            >
              Quarter
            </Button>
            <Button 
              size="sm" 
              variant={activePeriod === "year" ? "default" : "outline"} 
              className={activePeriod === "year" ? "bg-secondary hover:bg-secondary/90" : ""}
              onClick={() => setActivePeriod("year")}
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
                tickMargin={10}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), ""]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '6px', 
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#48BB78" 
                activeDot={{ r: 6 }} 
                strokeWidth={2}
                dot={false}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#F6AD55" 
                activeDot={{ r: 6 }} 
                strokeWidth={2}
                dot={false}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
