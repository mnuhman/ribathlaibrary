
"use client"

import * as React from "react"
import { Plus, Sparkles, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { generateBookDescription } from "@/ai/flows/generate-book-description-flow"
import { useFirestore } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(2, "Author is required"),
  isbn: z.string().min(1, "Book No is required"),
  genre: z.string().min(2, "Genre is required"),
  copies: z.coerce.number().min(1, "At least 1 copy required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().optional(),
})

export function AddBookDialog() {
  const [open, setOpen] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const db = useFirestore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      genre: "",
      copies: 1,
      price: 0,
      description: "",
    },
  })

  async function handleGenerateDescription() {
    const title = form.getValues("title")
    const author = form.getValues("author")

    if (!title || !author) {
      toast({
        title: "Missing Information",
        description: "Please enter a title and author first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateBookDescription({ title, author })
      form.setValue("description", result.description)
      toast({
        title: "Description Generated",
        description: "AI has successfully summarized the book.",
      })
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Could not generate description at this time.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return

    const booksRef = collection(db, "books")
    const bookData = {
      ...values,
      available: values.copies,
      status: 'Available',
      description: values.description || ""
    }

    addDoc(booksRef, bookData).catch(async (e) => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: booksRef.path,
        operation: "create",
        requestResourceData: bookData
      }))
    })
    
    toast({
      title: "Book Added",
      description: `${values.title} has been added to the catalog.`,
    })
    setOpen(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add New Book
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">New Catalog Entry</DialogTitle>
          <DialogDescription>
            Enter details for the new book addition. Use AI to generate a professional summary.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. The Hobbit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. J.R.R. Tolkien" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Book No</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. LIB-BK-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="Fantasy" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="copies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Copies</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDescription}
                      disabled={isGenerating}
                      className="h-7 text-xs gap-1 border-primary/20 hover:bg-primary/5 text-primary"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      AI Generate
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description or use AI to generate one..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
