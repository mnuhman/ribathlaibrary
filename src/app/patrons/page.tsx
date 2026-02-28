
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Hash, Users, MoreVertical, Trash2, Loader2 } from "lucide-react"
import { RegisterPatronDialog } from "@/components/patrons/register-patron-dialog"
import { toast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCollection, useFirestore } from "@/firebase"
import { collection, deleteDoc, doc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function MembersPage() {
  const db = useFirestore()
  const membersRef = React.useMemo(() => db ? collection(db, "members") : null, [db])
  const { data: members, loading } = useCollection(membersRef)
  
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredMembers = React.useMemo(() => {
    if (!members) return []
    return members.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.idNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.batch || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, members])

  const handleDelete = (id: string, name: string) => {
    if (!db) return
    const docRef = doc(db, "members", id)
    deleteDoc(docRef).catch(async (e) => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: docRef.path,
        operation: "delete"
      }))
    })
    toast({
      title: "Member Removed",
      description: `${name} has been removed from the registry.`,
      variant: "destructive",
    })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <h1 className="font-headline text-2xl font-bold text-primary">Member Management</h1>
            </div>
            <RegisterPatronDialog />
          </header>

          <main className="flex-1 p-8 space-y-6">
            <div className="flex items-center gap-4 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search members by name, ID or batch..." 
                  className="pl-10 bg-card border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Loading members...</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMembers.map((member) => (
                  <Card key={member.id} className="border-none shadow-md hover:shadow-lg transition-all group overflow-hidden">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                      <Avatar className="h-12 w-12 border-2 border-secondary">
                        <AvatarImage src={`https://picsum.photos/seed/${member.id}/150/150`} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{member.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Options</DropdownMenuLabel>
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Loan History</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive flex items-center gap-2"
                                onClick={() => handleDelete(member.id, member.name)}
                              >
                                <Trash2 className="h-4 w-4" /> Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription className="text-xs">Member since {member.joinedDate}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={member.status === 'Active' ? 'default' : 'destructive'} className="h-6">
                          {member.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span className="truncate">ID: {member.idNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="truncate">Batch: {member.batch}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">Active Loans</span>
                          <span className="text-lg font-bold text-primary">0</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 font-semibold h-8 px-2">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && filteredMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                <Search className="h-12 w-12 text-muted-foreground opacity-20" />
                <p className="text-lg font-medium text-muted-foreground">No members found matching your search.</p>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
