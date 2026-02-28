
"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Library, Moon, Sun, Palette, ShieldCheck, Coins, CalendarClock, Loader2 } from "lucide-react"
import { useDoc, useFirestore } from "@/firebase"
import { doc, setDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function SettingsPage() {
  const db = useFirestore()
  const configRef = React.useMemo(() => db ? doc(db, "settings", "config") : null, [db])
  const { data: config, loading: configLoading } = useDoc(configRef)

  const [isDarkMode, setIsDarkMode] = React.useState(true)
  const [finePeriod, setFinePeriod] = React.useState(14)
  const [fineRate, setFineRate] = React.useState(0.50)
  const [libName, setLibName] = React.useState("RIBATH LIBRARY")
  const [libEmail, setLibEmail] = React.useState("admin@ribath.org")

  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark'
    setIsDarkMode(theme === 'dark')
  }, [])

  React.useEffect(() => {
    if (config) {
      setFinePeriod(config.finePeriodDays || 14)
      setFineRate(config.fineRatePerDay || 0.50)
      setLibName(config.libraryName || "RIBATH LIBRARY")
      setLibEmail(config.contactEmail || "admin@ribath.org")
    }
  }, [config])

  const toggleTheme = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    setIsDarkMode(checked)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSave = () => {
    if (!db) return

    const updateData = {
      libraryName: libName,
      contactEmail: libEmail,
      finePeriodDays: Number(finePeriod),
      fineRatePerDay: Number(fineRate)
    }

    const docRef = doc(db, "settings", "config")
    setDoc(docRef, updateData, { merge: true })
      .catch(async (e) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: docRef.path,
          operation: "update",
          requestResourceData: updateData
        }))
      })

    toast({
      title: "Settings Saved",
      description: "Your library preferences have been updated.",
    })
  }

  if (configLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 items-center gap-4 border-b bg-card px-6 shrink-0">
        <SidebarTrigger />
        <h1 className="font-headline text-2xl font-bold text-primary">Library Settings</h1>
      </header>

      <main className="flex-1 p-8 max-w-4xl space-y-8 overflow-auto">
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">General Information</h2>
            </div>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="library-name">Library Name</Label>
                  <Input 
                    id="library-name" 
                    value={libName} 
                    onChange={(e) => setLibName(e.target.value)}
                    className="bg-background border-border" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="library-email">Contact Email</Label>
                  <Input 
                    id="library-email" 
                    value={libEmail}
                    onChange={(e) => setLibEmail(e.target.value)}
                    className="bg-background border-border" 
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-border" />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold">Fine Configuration</h2>
            </div>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" /> Fine Period (Days)
                    </Label>
                    <Input 
                      type="number" 
                      value={finePeriod} 
                      onChange={(e) => setFinePeriod(parseInt(e.target.value))}
                      placeholder="e.g. 14" 
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">Standard duration for book borrowing.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Coins className="h-4 w-4" /> Fine Rate (₹ per Day)
                    </Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      value={fineRate} 
                      onChange={(e) => setFineRate(parseFloat(e.target.value))}
                      placeholder="e.g. 0.50" 
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">Penalty charged for each day past the due date.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-border" />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Theme & Appearance</h2>
            </div>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Visual Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between Deep Ocean Darkness and Classic Light mode.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sun className={`h-4 w-4 ${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Switch 
                      checked={isDarkMode}
                      onCheckedChange={toggleTheme}
                    />
                    <Moon className={`h-4 w-4 ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold">Privacy & Security</h2>
            </div>
            <Card className="border-none shadow-md">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Firestore Security Rules</Label>
                    <p className="text-sm text-muted-foreground">Managed automatically by Firebase Studio.</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <Button onClick={handleSave} className="px-8 shadow-lg">Save All Changes</Button>
        </div>
      </main>
    </>
  )
}
