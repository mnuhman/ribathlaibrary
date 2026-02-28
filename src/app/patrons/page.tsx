
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Search, Mail, Phone, Calendar, MoreVertical } from "lucide-react"
import { PATRONS } from "@/lib/mock-data"

export default function PatronsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredPatrons = PATRONS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <h1 className="font-headline text-2xl font-bold text-primary">Patron Management</h1>
            </div>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" /> Register New Member
            </Button>
          </header>

          <main className="flex-1 p-8 space-y-6">
            <div className="flex items-center gap-4 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search members..." 
                  className="pl-10 bg-card border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatrons.map((patron) => (
                <Card key={patron.id} className="border-none shadow-md hover:shadow-lg transition-all group overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <Avatar className="h-12 w-12 border-2 border-secondary">
                      <AvatarImage src={`https://picsum.photos/seed/${patron.id}/150/150`} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {patron.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">{patron.name}</CardTitle>
                      <CardDescription className="text-xs">Member since {patron.joinedDate}</CardDescription>
                    </div>
                    <Badge variant={patron.status === 'Active' ? 'default' : 'destructive'} className="h-6">
                      {patron.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{patron.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{patron.phone}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Active Loans</span>
                        <span className="text-lg font-bold text-primary">2</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 font-semibold h-8 px-2">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
