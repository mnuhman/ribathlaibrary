
"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Users, ClipboardList, AlertCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { useCollection, useFirestore } from "@/firebase"
import { collection } from "firebase/firestore"

export default function Dashboard() {
  const db = useFirestore()
  
  const booksRef = React.useMemo(() => db ? collection(db, "books") : null, [db])
  const membersRef = React.useMemo(() => db ? collection(db, "members") : null, [db])
  const loansRef = React.useMemo(() => db ? collection(db, "loans") : null, [db])

  const { data: books, loading: booksLoading } = useCollection(booksRef)
  const { data: members, loading: membersLoading } = useCollection(membersRef)
  const { data: loans, loading: loansLoading } = useCollection(loansRef)

  const [today, setToday] = React.useState<Date | null>(null)
  React.useEffect(() => {
    setToday(new Date())
  }, [])

  const stats = React.useMemo(() => {
    const activeLoans = loans?.filter(l => l.status === 'Active') || []
    const overdueLoans = loans?.filter(l => {
      if (l.status === 'Returned') return false
      if (l.status === 'Overdue') return true
      if (today && new Date(l.dueDate) < today) return true
      return false
    }) || []

    return [
      { 
        title: "Total Books", 
        value: books?.length || 0, 
        icon: BookOpen, 
        color: "text-blue-600",
        loading: booksLoading
      },
      { 
        title: "Active Members", 
        value: members?.filter(m => m.status === 'Active').length || 0, 
        icon: Users, 
        color: "text-green-600",
        loading: membersLoading
      },
      { 
        title: "Active Loans", 
        value: activeLoans.length, 
        icon: ClipboardList, 
        color: "text-primary",
        loading: loansLoading
      },
      { 
        title: "Overdue Items", 
        value: overdueLoans.length, 
        icon: AlertCircle, 
        color: "text-destructive",
        loading: loansLoading
      },
    ]
  }, [books, members, loans, booksLoading, membersLoading, loansLoading, today])

  const chartData = [
    { name: 'Jan', loans: 400 },
    { name: 'Feb', loans: 300 },
    { name: 'Mar', loans: 200 },
    { name: 'Apr', loans: 278 },
    { name: 'May', loans: 189 },
  ];

  const recentLoans = React.useMemo(() => {
    if (!loans || !books || !members) return []
    return [...loans]
      .sort((a, b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime())
      .slice(0, 4)
      .map(loan => ({
        ...loan,
        bookTitle: books.find(b => b.id === loan.bookId)?.title || "Unknown Book",
        memberName: members.find(m => m.id === loan.memberId)?.name || "Unknown Member"
      }))
  }, [loans, books, members])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-headline text-2xl font-bold text-primary">Library Overview</h1>
          </header>
          
          <main className="flex-1 space-y-6 p-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-none shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </CardHeader>
                  <CardContent>
                    {stat.loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Current live count
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-primary">Loan Activity</CardTitle>
                  <CardDescription>Monthly check-out statistics for current year</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="loans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-xl text-primary">Recent Activity</CardTitle>
                  <CardDescription>Latest books checked out by members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {loansLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : recentLoans.length > 0 ? (
                      recentLoans.map((loan) => (
                        <div key={loan.id} className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold leading-none truncate max-w-[150px]">{loan.bookTitle}</p>
                            <p className="text-xs text-muted-foreground">By {loan.memberName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Due {loan.dueDate}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
