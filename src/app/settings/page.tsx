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
import { Library, Moon, Sun, Palette, ShieldCheck } from "lucide-react"

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(true)

  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark'
    setIsDarkMode(theme === 'dark')
  }, [])

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
    toast({
      title: "Settings Saved",
      description: "Your library preferences have been updated.",
    })
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
                  <Input id="library-name" defaultValue="RIBATH LIBRARY" className="bg-background border-border" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="library-email">Contact Email</Label>
                  <Input id="library-email" defaultValue="admin@ribath.org" className="bg-background border-border" />
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="bg-border" />

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-accent" />
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

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="px-8">Save All Changes</Button>
        </div>
      </main>
    </>
  )
}
