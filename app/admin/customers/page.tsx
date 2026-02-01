"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Download,
  Filter,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCustomers, type Customer } from "@/hooks/use-customers"

// Mock customers data (fallback)
const mockCustomers = [
  {
    id: "cus_001",
    name: "Amadou Diallo",
    email: "amadou.d@example.com",
    phone: "+223 76 12 34 56",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    status: "active",
    totalOrders: 12,
    totalSpent: 1847,
    createdAt: "2023-06-15",
    lastOrderAt: "2024-01-15",
    address: "Rue 100, Porte 20, Hamdallaye, Bamako, Mali",
  },
  {
    id: "cus_002",
    name: "Mariam Traoré",
    email: "mariam.t@example.com",
    phone: "+223 66 98 76 54",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    status: "active",
    totalOrders: 8,
    totalSpent: 1234,
    createdAt: "2023-08-22",
    lastOrderAt: "2024-01-14",
    address: "Quartier du Fleuve, Avenue de l'Indépendance, Ségou, Mali",
  },
  {
    id: "cus_003",
    name: "Bakary Coulibaly",
    email: "bakary.c@example.com",
    phone: "+223 70 11 22 33",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    status: "active",
    totalOrders: 5,
    totalSpent: 678,
    createdAt: "2023-10-05",
    lastOrderAt: "2024-01-10",
    address: "Hippodrome, Rue 45, Sikasso, Mali",
  },
  {
    id: "cus_004",
    name: "Fatoumata Konaté",
    email: "fatoumata.k@example.com",
    phone: "+223 60 55 66 77",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    status: "inactive",
    totalOrders: 2,
    totalSpent: 289,
    createdAt: "2023-12-01",
    lastOrderAt: "2024-01-05",
    address: "Niamakoro, Avenue Cheick Zayed, Kayes, Mali",
  },
  {
    id: "cus_005",
    name: "Moussa Keïta",
    email: "moussa.k@example.com",
    phone: "+223 75 99 88 77",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    status: "active",
    totalOrders: 15,
    totalSpent: 2456,
    createdAt: "2023-04-10",
    lastOrderAt: "2024-01-12",
    address: "Daoudabougou, Rue 250, Mopti, Mali",
  },
  {
    id: "cus_006",
    name: "Aïcha Sylla",
    email: "aicha.s@example.com",
    phone: "+223 69 44 33 22",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    status: "banned",
    totalOrders: 1,
    totalSpent: 145,
    createdAt: "2024-01-01",
    lastOrderAt: "2024-01-02",
    address: "Sabourou, Route de Koulouba, Gao, Mali",
  },
]

type Customer = (typeof mockCustomers)[0]

const statusStyles = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-yellow-100 text-yellow-700",
  banned: "bg-red-100 text-red-700",
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { customers, loading } = useCustomers(searchQuery || undefined)

  // Filter customers by status
  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus = selectedStatus === "ALL" || customer.status === selectedStatus
    return matchesStatus
  })

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"; // Handle undefined or null dateString
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Stats
  const stats = [
    { label: "Total des clients", value: customers.length },
    { label: "Actifs", value: customers.filter((c) => c.status === "active").length },
    { label: "Revenu total", value: `$${Number(customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0)).toLocaleString()}` },
    {
      label: "Panier moyen",
      value: `$${
        customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0) > 0
          ? Math.round(customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0) / customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0)).toLocaleString()
          : "N/A"
      }`
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">{filteredCustomers.length} client(s) trouvé(s)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-full bg-transparent border-border">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 rounded-full"
              />
            </div>

            {/* Status filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary border-0 rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="banned">Banni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Commandes
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Total dépensé
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Dernière commande
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setIsDetailOpen(true)
                    }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                          {customer.avatar ? (
                            <Image
                              src={customer.avatar}
                              alt={customer.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-semibold text-sm">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <span className="text-sm font-medium">{customer.totalOrders}</span>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <span className="text-sm font-medium">${Number(customer.totalSpent || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize",
                          statusStyles[customer.status as keyof typeof statusStyles]
                        )}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(customer.lastOrderAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Envoyer un e-mail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Aucun client trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Détails du client</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary">
                    {selectedCustomer.avatar ? (
                      <Image
                        src={selectedCustomer.avatar}
                        alt={selectedCustomer.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent text-accent-foreground font-semibold text-lg">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                    <span
                      className={cn(
                        "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize mt-1",
                        statusStyles[selectedCustomer.status as keyof typeof statusStyles]
                      )}
                    >
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-muted-foreground">Total des commandes</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-2xl font-bold">${Number(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total dépensé</p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Informations de contact</h4>
                  <div className="bg-secondary rounded-xl p-4 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Téléphone :</span>{" "}
                      {selectedCustomer.phone}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Adresse :</span>{" "}
                      {selectedCustomer.address}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Membre depuis :</span>{" "}
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full bg-transparent gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
