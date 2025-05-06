import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incomeFormSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof incomeFormSchema>;

export default function EditIncome({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: income, isLoading: incomeLoading } = useQuery({
    queryKey: [`/api/income-records/${params.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/income-records/${params.id}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      source: "",
      amount: "",
      description: "",
      date: new Date(),
      userId: user?.id || 0,
    },
  });

  useEffect(() => {
    if (income) {
      const incomeDate = new Date(income.date);
      form.reset({
        source: income.source,
        amount: income.amount.toString(),
        description: income.description || "",
        date: incomeDate,
        userId: income.userId,
      });
    }
  }, [income, form]);

  const updateIncomeMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("PUT", `/api/income-records/${params.id}`, {
        ...values,
        date: values.date instanceof Date ? values.date.toISOString() : values.date,
        userId: income?.userId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/income-records/${params.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/income-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Income updated",
        description: "Your income has been updated successfully.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update income",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: FormValues) {
    const formattedValues = {
      ...values,
      amount: values.amount.toString(),
      date: values.date instanceof Date ? values.date : new Date(values.date),
      userId: income?.userId,
    };
    updateIncomeMutation.mutate(formattedValues);
  }

  if (incomeLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-[400px] bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary font-inter">Edit Income</h2>
        <p className="text-gray-500 mt-1">Update the income transaction</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
          <CardDescription>
            Enter the details of the income you want to update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="Client payment, Sales revenue, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (PKR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              // Close the popover after selection
                              const popoverTrigger = document.querySelector('[data-state="open"]');
                              if (popoverTrigger) {
                                (popoverTrigger as HTMLElement).click();
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about this income..."
                        className="min-h-[120px]"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-accent hover:bg-accent/90"
                  disabled={updateIncomeMutation.isPending}
                >
                  {updateIncomeMutation.isPending ? "Updating..." : "Update Income"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
} 