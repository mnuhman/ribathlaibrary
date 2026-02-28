
"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Book as BookIcon,
  Trash2,
  Loader2
} from "lucide-react"
import { AddBookDialog } from "@/components/books/add-book-dialog"
import { EditBookDialog } from "@/components/books/edit-book-dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCollection, useFirestore } from "@/firebase"
import { collection, deleteDoc, doc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function CatalogPage() {
  const db = useFirestore()
  const booksRef = React.useMemo(() => db ? collection(db, "books") : null, [db])
  const { data: books, loading } = useCollection(booksRef)
  
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredBooks = React.useMemo(() => {
    if (!books) return []
    return books.filter(book => 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, books])

  const handleDelete = (id: string) => {
    if (!db) return
    const docRef = doc(db, "books", id)
    deleteDoc(docRef).catch(async (e) => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: docRef.path,
        operation: "delete"
      }))
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200'
      case 'Low Stock': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Unavailable': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-card px-6 shrink-0">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <h1 className="font-headline text-2xl font-bold text-primary">Book Catalog</h1>
        </div>
        <AddBookDialog />
      </header>

      <main className="flex-1 p-8 space-y-6 overflow-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by title, author, ISBN..." 
              className="pl-10 bg-card border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 border-none shadow-sm bg-card">
            <Filter className="h-4 w-4" /> Filter Genre
          </Button>
        </div>

        <Card className="border-none shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[30%]">Book Details</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Copies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading catalog...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-9 items-center justify-center rounded bg-secondary text-primary shadow-sm border border-border">
                            <BookIcon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-base">{book.title}</span>
                            <span className="text-xs text-muted-foreground">by {book.author} • ISBN: {book.isbn}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium bg-card border-border">
                          {book.genre}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">₹{book.price ? book.price.toFixed(2) : '0.00'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(book.status)}>
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{book.available}</span>
                        <span className="text-muted-foreground"> / {book.copies}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Manage Book</DropdownMenuLabel>
                            <EditBookDialog book={book} />
                            <DropdownMenuItem>View History</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive flex items-center gap-2"
                              onClick={() => handleDelete(book.id)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete Entry
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <p className="text-lg font-medium">No books found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search terms.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
