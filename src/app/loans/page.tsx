
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ClipboardCheck, 
  RotateCcw, 
  Search, 
  AlertTriangle,
  History,
  Coins
} from "lucide-react"
import { LOANS, BOOKS, PATRONS } from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <h1 className="font-headline text-2xl font-bold text-primary">Loan Management</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 border-none bg-card shadow-sm">
                <RotateCcw className="h-4 w-4" /> Return Book
              </Button>
              <Button className="gap-2">
                <ClipboardCheck className="h-4 w-4" /> New Checkout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-md bg-accent text-accent-foreground">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Outstanding Fines</p>
                    <p className="text-3xl font-bold">$142.50</p>
                  </div>
                  <Coins className="h-10 w-10 opacity-20" />
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loans</p>
                    <p className="text-3xl font-bold">{LOANS.filter(l => l.status === 'Active').length}</p>
                  </div>
                  <History className="h-10 w-10 text-primary opacity-20" />
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive uppercase tracking-wider">Overdue Items</p>
                    <p className="text-3xl font-bold">{LOANS.filter(l => l.status === 'Overdue').length}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-destructive opacity-20" />
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search loans..." 
                  className="pl-10 bg-card border-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Patron</TableHead>
                      <TableHead>Checkout Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Fine</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {LOANS.map((loan) => {
                      const book = BOOKS.find(b => b.id === loan.bookId)
                      const patron = PATRONS.find(p => p.id === loan.patronId)
                      return (
                        <TableRow key={loan.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold">{book?.title}</TableCell>
                          <TableCell>{patron?.name}</TableCell>
                          <TableCell>{loan.checkoutDate}</TableCell>
                          <TableCell className={loan.status === 'Overdue' ? 'text-destructive font-semibold' : ''}>
                            {loan.dueDate}
                          </TableCell>
                          <TableCell>
                            {loan.fineAmount > 0 ? (
                              <span className="text-destructive font-bold">${loan.fineAmount.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={loan.status === 'Overdue' ? 'destructive' : 'default'} className={loan.status === 'Active' ? 'bg-primary' : ''}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary hover:text-white">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
