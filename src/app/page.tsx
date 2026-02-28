
"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpen, Users, ClipboardList, AlertCircle, TrendingUp, Clock } from "lucide-react"
import { BOOKS, PATRONS, LOANS } from "@/lib/mock-data"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

const stats = [
  { title: "Total Books", value: BOOKS.length, icon: BookOpen, color: "text-blue-600" },
  { title: "Active Patrons", value: PATRONS.length, icon: Users, color: "text-green-600" },
  { title: "Active Loans", value: LOANS.filter(l => l.status === 'Active').length, icon: ClipboardList, color: "text-primary" },
  { title: "Overdue Books", value: LOANS.filter(l => l.status === 'Overdue').length, icon: AlertCircle, color: "text-destructive" },
]

const chartData = [
  { name: 'Jan', loans: 400 },
  { name: 'Feb', loans: 300 },
  { name: 'Mar', loans: 200 },
  { name: 'Apr', loans: 278 },
  { name: 'May', loans: 189 },
];

export default function Dashboard() {
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
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +12% from last month
                    </p>
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
                  <CardTitle className="font-headline text-xl text-primary">Recent Loans</CardTitle>
                  <CardDescription>Latest books checked out by patrons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {LOANS.slice(0, 4).map((loan) => {
                      const book = BOOKS.find(b => b.id === loan.bookId)
                      const patron = PATRONS.find(p => p.id === loan.patronId)
                      return (
                        <div key={loan.id} className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold leading-none">{book?.title}</p>
                            <p className="text-xs text-muted-foreground">Borrowed by {patron?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground">Due {loan.dueDate}</p>
                          </div>
                        </div>
                      )
                    })}
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

import { cn } from "@/lib/utils"
