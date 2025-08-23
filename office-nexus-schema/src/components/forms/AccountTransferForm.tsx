import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import UniversalTransactionHandler from '@/services/universalTransactionHandler';
import { ArrowLeftRight, Upload } from 'lucide-react';

const transferFormSchema = z.object({
  fromAccount: z.string().min(1, 'From account is required'),
  toAccount: z.string().min(1, 'To account is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
  attachment: z.any().optional(),
}).refine((data) => data.fromAccount !== data.toAccount, {
  message: 'From and To accounts cannot be the same',
  path: ['toAccount'],
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

const accountOptions = [
  { value: 'Cash on Hand', label: 'Cash on Hand' },
  { value: 'Cash at Bank', label: 'Cash at Bank' },
  { value: 'KCB Bank', label: 'KCB Bank' },
  { value: 'Equity Bank', label: 'Equity Bank' },
  { value: 'MoMo Wallet', label: 'MoMo Wallet' },
  { value: 'Airtel Money', label: 'Airtel Money' },
];

interface AccountTransferFormProps {
  onSuccess?: () => void;
}

export default function AccountTransferForm({ onSuccess }: AccountTransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccount: '',
      toAccount: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
    },
  });

  const onSubmit = async (values: TransferFormValues) => {
    setIsLoading(true);
    try {
      const result = await UniversalTransactionHandler.processTransaction({
        type: 'transfer',
        amount: Number(values.amount),
        description: values.description,
        date: values.date,
        payment_method: 'bank',
        payment_status: 'paid',
        reference_number: values.reference,
        additional_data: {
          from_account: values.fromAccount,
          to_account: values.toAccount,
          transfer_type: 'inter_account',
        },
      });

      if (result.success) {
        toast({
          title: 'Transfer Successful',
          description: `Successfully transferred ${Number(values.amount).toLocaleString()} RWF from ${values.fromAccount} to ${values.toAccount}`,
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          title: 'Transfer Failed',
          description: result.errors?.join(', ') || 'An error occurred during transfer',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          Account Transfer
        </CardTitle>
        <CardDescription>
          Transfer funds between your cash, bank, and mobile money accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (RWF)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        step="0.01"
                        min="0"
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
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter transfer description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter reference number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supporting Document (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing Transfer...' : 'Process Transfer'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}