"use client"

import Image from "next/image";
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"

import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/auth-context" // Import useAuth

const navLinks = [
  { name: "Boutique", href: "/shop" },
  { name: "Homme", href: "/shop?category=homme" },
  { name: "Femme", href: "/shop?category=femme" },
  { name: "Nouveautés", href: "/shop?filter=new" },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const { user } = useAuth() // Utiliser le hook useAuth
  const router = useRouter() // Utiliser le hook useRouter

  const handleProfileClick = () => {
    if (user) {
      router.push("/account/dashboard") // Rediriger vers le dashboard si connecté
    } else {
      router.push("/login") // Rediriger vers la page de connexion si non connecté
    }
  }

  return (
    <>
      {/* Skip links pour navigation clavier */}
      <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
        <a
          href="#main-content"
          className="inline-block px-4 py-2 bg-foreground text-background rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Aller au contenu principal
        </a>
        <a
          href="#navigation"
          className="inline-block px-4 py-2 bg-foreground text-background rounded-lg font-medium ml-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Aller à la navigation
        </a>
      </div>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-8" aria-label="Navigation mobile">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Tonomi Logo"
              width={196}
              height={56}
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav id="navigation" className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="w-full pl-10 bg-secondary border-0 rounded-full"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Rechercher"
            >
              {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Liste de souhaits">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" aria-label="Compte" onClick={handleProfileClick}>
              <User className="h-5 w-5" />
            </Button>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Panier">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium flex items-center justify-center text-accent-foreground">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="w-full pl-10 bg-secondary border-0 rounded-full"
                autoFocus
              />
            </div>
          </div>
        )}
        </div>
      </header>
    </>
  )
}
