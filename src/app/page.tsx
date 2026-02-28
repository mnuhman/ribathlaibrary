"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Users, ClipboardList, AlertCircle, Clock, Loader2, TrendingUp } from "lucide-react"
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
    const overdueLoans = loans?.filter(l => {
      if (l.status === 'Returned') return false
      if (l.status === 'Overdue') return true
      if (today && l.dueDate && new Date(l.dueDate) < today) return true
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
        title: "Overdue Items", 
        value: overdueLoans.length, 
        icon: AlertCircle, 
        color: "text-destructive",
        loading: loansLoading
      },
    ]
  }, [books, members, loans, booksLoading, membersLoading, loansLoading, today])

  const chartData = React.useMemo(() => {
    if (!loans) return []
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    
    const dataMap = months.reduce((acc, month) => {
      acc[month] = 0
      return acc
    }, {} as Record<string, number>)

    loans.forEach(loan => {
      if (loan.checkoutDate) {
        const date = new Date(loan.checkoutDate)
        if (date.getFullYear() === currentYear) {
          const monthName = months[date.getMonth()]
          dataMap[monthName]++
        }
      }
    })

    return months.map(name => ({
      name,
      loans: dataMap[name]
    })).filter((_, index) => index <= new Date().getMonth())
  }, [loans])

  const recentLoans = React.useMemo(() => {
    if (!loans || !books || !members) return []
    return [...loans]
      .filter(l => l.checkoutDate)
      .sort((a, b) => new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime())
      .slice(0, 5)
      .map(loan => ({
        ...loan,
        bookTitle: books.find(b => b.id === loan.bookId)?.title || "Unknown Book",
        memberName: members.find(m => m.id === loan.memberId)?.name || "Unknown Member"
      }))
  }, [loans, books, members])

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6 shrink-0">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border" />
        <h1 className="font-headline text-2xl font-bold text-primary">Library Overview</h1>
      </header>
      
      <main className="flex-1 space-y-6 p-8 overflow-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Live from database
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
              <CardTitle className="font-headline text-xl text-primary">Fine Activity</CardTitle>
              <CardDescription>Activity volume across current months</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loansLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey="loans" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No fine data available for chart
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">Recent Activity</CardTitle>
              <CardDescription>Latest items checked out by members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loansLoading || booksLoading || membersLoading ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentLoans.length > 0 ? (
                  recentLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center gap-4 group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-semibold leading-none truncate">{loan.bookTitle}</p>
                        <p className="text-xs text-muted-foreground truncate">By {loan.memberName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {loan.status === 'Returned' ? 'Returned' : `Due ${loan.dueDate}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent checkouts recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
