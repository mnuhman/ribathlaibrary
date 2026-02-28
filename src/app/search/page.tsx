"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search as SearchIcon, Book, User, ArrowRight, Loader2 } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"
import Link from "next/link"

export default function SearchPage() {
  const db = useFirestore()
  const booksRef = React.useMemo(() => db ? collection(db, "books") : null, [db])
  const membersRef = React.useMemo(() => db ? collection(db, "members") : null, [db])
  
  const { data: books, loading: booksLoading } = useCollection(booksRef)
  const { data: members, loading: membersLoading } = useCollection(membersRef)
  
  const [query, setQuery] = React.useState("")

  const results = React.useMemo(() => {
    if (!query) return { books: [], members: [] }
    const q = query.toLowerCase()
    
    return {
      books: books?.filter(b => 
        (b.title?.toLowerCase() || "").includes(q) || 
        (b.author?.toLowerCase() || "").includes(q) ||
        (b.isbn || "").includes(q)
      ) || [],
      members: members?.filter(m => 
        (m.name?.toLowerCase() || "").includes(q) || 
        (m.idNumber?.toLowerCase() || "").includes(q)
      ) || []
    }
  }, [query, books, members])

  const isLoading = booksLoading || membersLoading

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <h1 className="font-headline text-2xl font-bold text-primary">Global Search</h1>
          </header>

          <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-8">
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Search across books, members, ISBNs, or IDs..." 
                className="pl-12 h-14 text-lg bg-card border-none shadow-lg focus-visible:ring-primary/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {isLoading && (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && query && (
              <div className="grid gap-8">
                {/* Book Results */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Book className="h-4 w-4" /> Books ({results.books.length})
                    </h2>
                    {results.books.length > 0 && (
                      <Link href="/catalog" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Go to Catalog <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  {results.books.length > 0 ? (
                    <div className="grid gap-3">
                      {results.books.map(book => (
                        <Card key={book.id} className="border-none shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-8 bg-secondary rounded flex items-center justify-center text-primary">
                                <Book className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{book.title}</h3>
                                <p className="text-xs text-muted-foreground">by {book.author} • ISBN: {book.isbn}</p>
                              </div>
                            </div>
                            <Badge variant={book.status === 'Available' ? 'default' : 'outline'}>
                              {book.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No books matching "{query}"</p>
                  )}
                </section>

                {/* Member Results */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <User className="h-4 w-4" /> Members ({results.members.length})
                    </h2>
                    {results.members.length > 0 && (
                      <Link href="/patrons" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Manage Members <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  {results.members.length > 0 ? (
                    <div className="grid gap-3">
                      {results.members.map(member => (
                        <Card key={member.id} className="border-none shadow-sm hover:shadow-md transition-all">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <User className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-xs text-muted-foreground">ID: {member.idNumber}</p>
                              </div>
                            </div>
                            <Badge variant={member.status === 'Active' ? 'default' : 'destructive'}>
                              {member.status}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No members matching "{query}"</p>
                  )}
                </section>
              </div>
            )}

            {!isLoading && !query && (
              <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-40">
                <SearchIcon className="h-16 w-16" />
                <div className="space-y-1">
                  <p className="text-xl font-medium">Find everything in one place</p>
                  <p className="text-sm">Search for books, authors, ISBNs, or member details</p>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}