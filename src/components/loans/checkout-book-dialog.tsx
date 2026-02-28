
'use client';

import * as React from 'react';
import { ClipboardCheck, Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  bookId: z.string().min(1, 'Please select a book'),
  memberId: z.string().min(1, 'Please select a member'),
  dueDate: z.string().min(1, 'Due date is required'),
});

export function CheckoutBookDialog() {
  const [open, setOpen] = React.useState(false);
  const db = useFirestore();

  const booksRef = React.useMemo(() => (db ? collection(db, 'books') : null), [db]);
  const membersRef = React.useMemo(() => (db ? collection(db, 'members') : null), [db]);
  const configRef = React.useMemo(() => (db ? doc(db, "settings", "config") : null), [db]);

  const { data: books, loading: booksLoading } = useCollection(booksRef);
  const { data: members, loading: membersLoading } = useCollection(membersRef);
  const { data: config } = useDoc(configRef);

  const availableBooks = React.useMemo(() => {
    return books?.filter((b) => b.available > 0 && b.status !== 'Unavailable') || [];
  }, [books]);

  const activeMembers = React.useMemo(() => {
    return members?.filter((m) => m.status === 'Active') || [];
  }, [members]);

  const finePeriod = config?.finePeriodDays || 14;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookId: '',
      memberId: '',
      dueDate: format(addDays(new Date(), finePeriod), 'yyyy-MM-dd'),
    },
  });

  // Update default due date when config loads
  React.useEffect(() => {
    if (config?.finePeriodDays) {
      form.setValue('dueDate', format(addDays(new Date(), config.finePeriodDays), 'yyyy-MM-dd'));
    }
  }, [config, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;

    const loansRef = collection(db, 'loans');
    const book = books?.find((b) => b.id === values.bookId);
    const member = members?.find((m) => m.id === values.memberId);

    if (!book || !member) return;

    const loanData = {
      bookId: values.bookId,
      memberId: values.memberId,
      checkoutDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: values.dueDate,
      fineAmount: 0,
      status: 'Active',
    };

    addDoc(loansRef, loanData)
      .then(() => {
        const bookDocRef = doc(db, 'books', values.bookId);
        const newAvailable = book.available - 1;
        updateDoc(bookDocRef, {
          available: increment(-1),
          status: newAvailable === 0 ? 'Unavailable' : newAvailable <= 2 ? 'Low Stock' : 'Available',
        }).catch((e) => {
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: bookDocRef.path,
              operation: 'update',
            })
          );
        });

        toast({
          title: 'Checkout Successful',
          description: `${book.title} issued to ${member.name}.`,
        });
        setOpen(false);
        form.reset();
      })
      .catch(async (e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: loansRef.path,
            operation: 'create',
            requestResourceData: loanData,
          })
        );
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ClipboardCheck className="h-4 w-4" /> New Checkout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Issue Book</DialogTitle>
          <DialogDescription>Create a new checkout record for a member.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Book</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={booksLoading ? 'Loading books...' : 'Select a book'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} ({book.isbn}) - {book.available} left
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
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Member</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={membersLoading ? 'Loading members...' : 'Select a member'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.idNumber})
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={booksLoading || membersLoading}>
                Confirm Checkout
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
