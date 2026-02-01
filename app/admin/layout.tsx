"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context" // Import useAuth

const sidebarLinks = [
  { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { name: "Produits", href: "/admin/products", icon: Package },
  { name: "Catégories", href: "/admin/categories", icon: Tag },
  { name: "Commandes", href: "/admin/orders", icon: ShoppingCart },
  { name: "Clients", href: "/admin/customers", icon: Users },
  { name: "Paramètres", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading, logout } = useAuth() // Use useAuth hook
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Only check auth if not on the login page and user loading is complete
    if (pathname === '/admin/login') {
      return
    }

    if (!loading) { // Wait for auth state to load
      if (!user || user.role !== 'admin') {
        router.push('/admin/login')
      }
    }
  }, [user, loading, router, pathname])

  // Do not show the admin layout on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Show a loading state until authentication is confirmed
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement de l'administration...</p> {/* Or a spinner */}
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen bg-secondary">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full w-64 bg-foreground text-background transform lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-background/10">
              <Link href="/admin" className="text-xl font-bold tracking-tight">
                Tonomi Admin
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-background hover:bg-background/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== "/admin" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-background/70 hover:bg-background/10 hover:text-background"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                )
              })}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-background/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-background truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-background/60 truncate">
                    {user?.email || 'admin@tonomi.com'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 mt-2 text-background/70 hover:bg-background/10 hover:text-background"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
              <Link href="/">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 mt-2 text-background/70 hover:bg-background/10 hover:text-background"
                >
                  Retour à la boutique
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top header */}
          <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center px-4 lg:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 bg-secondary border-0 rounded-full"
                />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      Retour à la boutique
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main id="main-content" className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  )
}
