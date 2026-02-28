
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
  Coins,
  CheckCircle2
} from "lucide-react"
import { LOANS, BOOKS, PATRONS, Loan } from "@/lib/mock-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [loans, setLoans] = React.useState<Loan[]>(LOANS)
  const [today, setToday] = React.useState<Date | null>(null)

  // Avoid hydration mismatch by setting date on mount
  React.useEffect(() => {
    setToday(new Date())
  }, [])

  const calculateFine = React.useCallback((dueDateStr: string) => {
    if (!today) return 0
    const dueDate = new Date(dueDateStr)
    if (today > dueDate) {
      const diffTime = today.getTime() - dueDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays * 0.50 // $0.50 per day
    }
    return 0
  }, [today])

  const activeLoans = loans.filter(l => l.status !== 'Returned')
  const overdueLoans = activeLoans.filter(l => {
    if (!today) return false
    return new Date(l.dueDate) < today
  })

  const totalFines = activeLoans.reduce((sum, loan) => {
    return sum + (loan.status === 'Overdue' ? loan.fineAmount : calculateFine(loan.dueDate))
  }, 0)

  const handleReturn = (loanId: string) => {
    setLoans(prev => prev.map(l => 
      l.id === loanId ? { ...l, status: 'Returned', returnDate: new Date().toISOString().split('T')[0] } : l
    ))
    toast({
      title: "Book Returned",
      description: "The book has been successfully marked as returned.",
    })
  }

  const handleSettleFine = (loanId: string) => {
    setLoans(prev => prev.map(l => 
      l.id === loanId ? { ...l, fineAmount: 0 } : l
    ))
    toast({
      title: "Fine Settled",
      description: "The outstanding fine has been cleared.",
    })
  }

  const filteredLoans = loans.filter(loan => {
    const book = BOOKS.find(b => b.id === loan.bookId)
    const patron = PATRONS.find(p => p.id === loan.patronId)
    const searchString = `${book?.title} ${patron?.name} ${loan.status}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border" />
              <h1 className="font-headline text-2xl font-bold text-primary">Loans & Fine Calculation</h1>
            </div>
            <div className="flex gap-2">
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
                    <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Estimated Total Fines</p>
                    <p className="text-3xl font-bold">${totalFines.toFixed(2)}</p>
                  </div>
                  <Coins className="h-10 w-10 opacity-20" />
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Loans</p>
                    <p className="text-3xl font-bold">{activeLoans.length}</p>
                  </div>
                  <History className="h-10 w-10 text-primary opacity-20" />
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive uppercase tracking-wider">Overdue Items</p>
                    <p className="text-3xl font-bold">{overdueLoans.length}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-destructive opacity-20" />
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search loans by book, patron, or status..." 
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
                      <TableHead>Calculated Fine</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoans.map((loan) => {
                      const book = BOOKS.find(b => b.id === loan.bookId)
                      const patron = PATRONS.find(p => p.id === loan.patronId)
                      const currentFine = loan.status === 'Returned' ? 0 : calculateFine(loan.dueDate)
                      const isOverdue = today ? new Date(loan.dueDate) < today && loan.status !== 'Returned' : false

                      return (
                        <TableRow key={loan.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-semibold">{book?.title}</TableCell>
                          <TableCell>{patron?.name}</TableCell>
                          <TableCell>{loan.checkoutDate}</TableCell>
                          <TableCell className={isOverdue ? 'text-destructive font-semibold' : ''}>
                            {loan.dueDate}
                          </TableCell>
                          <TableCell>
                            {(currentFine > 0 || loan.fineAmount > 0) ? (
                              <div className="flex flex-col">
                                <span className="text-destructive font-bold">
                                  ${Math.max(currentFine, loan.fineAmount).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase">Rate: $0.50/day</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={isOverdue ? 'destructive' : 'default'} 
                              className={loan.status === 'Active' && !isOverdue ? 'bg-primary' : loan.status === 'Returned' ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                              {isOverdue ? 'Overdue' : loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {loan.status !== 'Returned' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 gap-1"
                                  onClick={() => handleReturn(loan.id)}
                                >
                                  <RotateCcw className="h-3 w-3" /> Return
                                </Button>
                              )}
                              {(loan.fineAmount > 0 || currentFine > 0) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 gap-1 text-accent hover:text-accent hover:bg-accent/10"
                                  onClick={() => handleSettleFine(loan.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Settle Fine
                                </Button>
                              )}
                            </div>
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
