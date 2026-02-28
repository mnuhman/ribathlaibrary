
"use client"

import * as React from "react"
import { Sparkles, Loader2 } from "lucide-react"
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
import { doc, updateDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  author: z.string().min(2, "Author is required"),
  isbn: z.string().min(10, "Valid ISBN is required"),
  genre: z.string().min(2, "Genre is required"),
  copies: z.coerce.number().min(1, "At least 1 copy required"),
  description: z.string().optional(),
})

interface EditBookDialogProps {
  book: any
}

export function EditBookDialog({ book }: EditBookDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const db = useFirestore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      copies: book.copies,
      description: book.description,
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
        description: "AI has successfully updated the summary.",
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

    const docRef = doc(db, "books", book.id)
    const updateData = {
      ...values,
      description: values.description || "",
      status: values.copies > 0 ? (book.status === 'Unavailable' ? 'Available' : book.status) : 'Unavailable'
    }

    updateDoc(docRef, updateData).catch(async (e) => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: docRef.path,
        operation: "update",
        requestResourceData: updateData
      }))
    })

    toast({
      title: "Book Updated",
      description: `${values.title} details have been updated.`,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
          Edit Details
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Edit Catalog Entry</DialogTitle>
          <DialogDescription>
            Update the information for this book.
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <FormLabel>ISBN</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      AI Regenerate
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
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
              <Button type="submit">Update Entry</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
