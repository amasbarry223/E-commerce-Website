"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Package, Heart, MapPin, CreditCard, Settings, LogOut, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation" // Import useRouter
import { useAuth } from "@/context/auth-context" // Import useAuth

const menuItems = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "orders", label: "Mes commandes", icon: Package },
  { id: "wishlist", label: "Liste de souhaits", icon: Heart },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "payment", label: "Moyens de paiement", icon: CreditCard },
  { id: "settings", label: "Paramètres", icon: Settings },
]

const orders = [
  {
    id: "ORD-2026-001",
    date: "Jan 25, 2026",
    status: "Livré",
    total: 290,
    items: [
      {
        name: "Modern Blazer",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2080&auto=format&fit=crop",
        size: "M",
        color: "Black",
        price: 125,
      },
      {
        name: "Running Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        size: "10",
        color: "Red",
        price: 165,
      },
    ],
  },
  {
    id: "ORD-2026-002",
    date: "Jan 15, 2026",
    status: "Expédié",
    total: 189,
    items: [
      {
        name: "Premium Jacket",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop",
        size: "L",
        color: "Black",
        price: 189,
      },
    ],
  },
  {
    id: "ORD-2025-123",
    date: "Dec 20, 2025",
    status: "Livré",
    total: 84,
    items: [
      {
        name: "Classic White Tee",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
        size: "L",
        color: "White",
        price: 45,
      },
      {
        name: "Graphic Tee",
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=1974&auto=format&fit=crop",
        size: "L",
        color: "Black",
        price: 39,
      },
    ],
  },
]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("orders")
  const { user, loading, logout } = useAuth() // Utiliser le hook useAuth et récupérer logout
  const router = useRouter() // Initialiser le hook useRouter

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link href="/login">Se connecter</Link>
      </div>
    );
  }

  // Si le nom complet est disponible, le diviser pour prénom et nom
  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Utilisateur';
  const lastName = user.name?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Mon compte
          </h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-secondary rounded-2xl">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" // Placeholder avatar
                    alt={user.name || "User avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name || 'Utilisateur'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      activeSection === item.id
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <Link
                  href="/account"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-500 hover:bg-red-50 transition-colors"
                  onClick={async (e) => {
                    e.preventDefault();
                    await logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Se déconnecter</span>
                </Link>
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === "profile" && (
                <ProfileSection
                  user={user}
                  firstName={firstName}
                  lastName={lastName}
                />
              )}
              {activeSection === "orders" && <OrdersSection orders={orders} />}
              {activeSection === "wishlist" && <WishlistSection />}
              {activeSection === "addresses" && <AddressesSection />}
              {activeSection === "payment" && <PaymentSection />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ProfileSection({ user, firstName, lastName }: { user: any, firstName: string, lastName: string }) {
  // Ici, nous supposons que user.name est le nom complet, et user.email est l'e-mail.
  // user.phone ou user.address nécessiteraient d'être ajoutés à l'interface User et au fetch du profil
  // dans auth-context.tsx pour être dynamiques. Pour l'instant, on utilise des placeholders si non dispo.
  const userPhone = user.phone || "+223 76 12 34 56"; // Placeholder ou à récupérer si disponible

  return (
    <div className="bg-secondary rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Informations du profil</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Prénom</label>
          <p className="font-medium text-foreground">{firstName}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Nom</label>
          <p className="font-medium text-foreground">{lastName}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">E-mail</label>
          <p className="font-medium text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Téléphone</label>
          <p className="font-medium text-foreground">{userPhone}</p>
        </div>
      </div>
      <Button className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90">
        Modifier le profil
      </Button>
    </div>
  )
}

function OrdersSection({ orders }: { orders: typeof orders }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Historique des commandes</h2>
      {orders.map((order) => (
        <div key={order.id} className="bg-secondary rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="font-semibold text-foreground">{order.id}</p>
              <p className="text-sm text-muted-foreground">{order.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  order.status === "Livré"
                    ? "bg-green-100 text-green-700"
                    : order.status === "Expédié"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                )}
              >
                {order.status}
              </span>
              <span className="font-semibold text-foreground">FCFA {order.total}</span>
            </div>
          </div>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Taille : {item.size} | Couleur : {item.color}
                  </p>
                </div>
                <p className="font-medium text-foreground">FCFA {item.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full bg-transparent border-border text-foreground"
            >
              Voir les détails
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function WishlistSection() {
  return (
    <div className="bg-secondary rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Ma liste de souhaits</h2>
      <p className="text-muted-foreground">Votre liste de souhaits est vide. Commencez à ajouter des articles que vous aimez !</p>
      <Link href="/">
        <Button className="mt-4 rounded-full bg-foreground text-background hover:bg-foreground/90">
          Parcourir les produits
        </Button>
      </Link>
    </div>
  )
}

function AddressesSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Adresses enregistrées</h2>
      <div className="bg-secondary rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-foreground">Domicile</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Rue 100, Porte 20<br />
                            Hamdallaye ACI 2000<br />
                            Bamako, Mali
                          </p>          </div>
          <span className="px-2 py-1 bg-foreground text-background text-xs font-medium rounded">
            Par défaut
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="rounded-full bg-transparent border-border text-foreground"
      >
        Ajouter une nouvelle adresse
      </Button>
    </div>
  )
}

function PaymentSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Moyens de paiement</h2>
      <div className="bg-secondary rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-3 py-2 bg-background rounded text-sm font-medium text-foreground">
              Visa
            </div>
            <div>
              <p className="font-medium text-foreground">**** **** **** 4242</p>
              <p className="text-sm text-muted-foreground">Expire le 12/28</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-foreground text-background text-xs font-medium rounded">
            Par défaut
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="rounded-full bg-transparent border-border text-foreground"
      >
        Ajouter un moyen de paiement
      </Button>
    </div>
  )
}

function SettingsSection() {
  return (
    <div className="bg-secondary rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Paramètres du compte</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Notifications par e-mail</p>
            <p className="text-sm text-muted-foreground">Recevoir des mises à jour sur les commandes et promotions</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Activé
          </Button>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Authentification à deux facteurs</p>
            <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Configurer
          </Button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Supprimer le compte</p>
            <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte et vos données</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full text-red-500 border-red-200 bg-transparent hover:bg-red-50">
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  )
}