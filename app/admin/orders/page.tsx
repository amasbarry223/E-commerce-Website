"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Printer,
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
import { useOrders, type Order } from "@/hooks/use-orders"
import { toast } from "sonner"

// Mock orders data (fallback)
const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "Amadou Diallo",
      email: "amadou.d@example.com",
      phone: "+223 76 12 34 56",
      address: "Rue 100, Porte 20, Hamdallaye, Bamako, Mali",
    },
    items: [
      {
        id: 1,
        name: "Modern Blazer",
        price: 125,
        quantity: 1,
        size: "M",
        color: "Black",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 125,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-16T14:20:00",
  },
  {
    id: "ORD-002",
    customer: {
      name: "Mariam Traoré",
      email: "mariam.t@example.com",
      phone: "+223 66 98 76 54",
      address: "Quartier du Fleuve, Avenue de l'Indépendance, Ségou, Mali",
    },
    items: [
      {
        id: 2,
        name: "Premium Jacket",
        price: 189,
        quantity: 1,
        size: "L",
        color: "Brown",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=200&auto=format&fit=crop",
      },
      {
        id: 3,
        name: "Classic White Tee",
        price: 45,
        quantity: 2,
        size: "L",
        color: "White",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 279,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    createdAt: "2024-01-15T14:45:00",
    updatedAt: "2024-01-15T14:45:00",
  },
  {
    id: "ORD-003",
    customer: {
      name: "Bakary Coulibaly",
      email: "bakary.c@example.com",
      phone: "+223 70 11 22 33",
      address: "Hippodrome, Rue 45, Sikasso, Mali",
    },
    items: [
      {
        id: 4,
        name: "Running Sneakers",
        price: 165,
        quantity: 1,
        size: "9",
        color: "Red",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 165,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    trackingNumber: "ML123456789",
    createdAt: "2024-01-14T09:15:00",
    updatedAt: "2024-01-15T11:30:00",
  },
  {
    id: "ORD-004",
    customer: {
      name: "Fatoumata Konaté",
      email: "fatoumata.k@example.com",
      phone: "+223 60 55 66 77",
      address: "Niamakoro, Avenue Cheick Zayed, Kayes, Mali",
    },
    items: [
      {
        id: 3,
        name: "Classic White Tee",
        price: 45,
        quantity: 3,
        size: "XL",
        color: "Black",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 135,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Bank Transfer",
    createdAt: "2024-01-14T16:20:00",
    updatedAt: "2024-01-14T16:20:00",
  },
  {
    id: "ORD-005",
    customer: {
      name: "Moussa Keïta",
      email: "moussa.k@example.com",
      phone: "+223 75 99 88 77",
      address: "Daoudabougou, Rue 250, Mopti, Mali",
    },
    items: [
      {
        id: 6,
        name: "Leather Boots",
        price: 225,
        quantity: 1,
        size: "8",
        color: "Brown",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 225,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    createdAt: "2024-01-13T11:00:00",
    updatedAt: "2024-01-15T09:45:00",
  },
  {
    id: "ORD-006",
    customer: {
      name: "Aïcha Sylla",
      email: "aicha.s@example.com",
      phone: "+223 69 44 33 22",
      address: "Sabourou, Route de Koulouba, Gao, Mali",
    },
    items: [
      {
        id: 7,
        name: "Denim Jacket",
        price: 145,
        quantity: 1,
        size: "M",
        color: "Blue",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=200&auto=format&fit=crop",
      },
    ],
    total: 145,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    createdAt: "2024-01-12T08:30:00",
    updatedAt: "2024-01-13T10:15:00",
  },
]

type Order = (typeof mockOrders)[0]

const statusConfig = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  processing: {
    label: "En traitement",
    color: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  completed: {
    label: "Terminée",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
}

const statuses = ["ALL", "pending", "processing", "shipped", "completed", "cancelled"]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { orders, loading, updateOrderStatus, refetch } = useOrders(
    selectedStatus !== "ALL" ? selectedStatus : undefined
  )

  // Filter orders by search
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      refetch()
    } catch (error) {
      // Error already handled in hook
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailOpen(true)
  }

  // Stats
  const stats = [
    { label: "Total des commandes", value: orders.length },
    { label: "En attente", value: orders.filter((o) => o.status === "pending").length },
    { label: "En traitement", value: orders.filter((o) => o.status === "processing").length },
    { label: "Expédiées", value: orders.filter((o) => o.status === "shipped").length },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commandes</h1>
          <p className="text-muted-foreground">{filteredOrders.length} commande(s) trouvée(s)</p>
        </div>
        <Button variant="outline" className="gap-2 rounded-full bg-transparent border-border">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
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
                placeholder="Rechercher des commandes par ID, client..."
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
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? "Tous les statuts" : statusConfig[status as keyof typeof statusConfig]?.label || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
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
                      Commande
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.items.length} article{order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-sm">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                            statusInfo?.color
                          )}
                        >
                          {statusInfo?.icon && <statusInfo.icon className="w-3 h-3" />}
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium text-sm">FCFA {order.total}</span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les détails
                            </DropdownMenuItem>
                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <>
                                {order.status === "pending" && (
                                  <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "processing")}>
                                    <Package className="w-4 h-4 mr-2" />
                                    Marquer en traitement
                                  </DropdownMenuItem>
                                )}
                                {order.status === "processing" && (
                                  <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "shipped")}>
                                    <Truck className="w-4 h-4 mr-2" />
                                    Marquer expédiée
                                  </DropdownMenuItem>
                                )}
                                {order.status === "shipped" && (
                                  <DropdownMenuItem onClick={() => handleUpdateOrderStatus(order.id, "completed")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Marquer terminée
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Annuler la commande
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Commande {selectedOrder.id}</DialogTitle>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                      statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color
                    )}
                  >
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Customer info */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Informations client</h3>
                  <div className="bg-secondary rounded-xl p-4 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Nom :</span>{" "}
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">E-mail :</span>{" "}
                      {selectedOrder.customer.email}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Téléphone :</span>{" "}
                      {selectedOrder.customer.phone}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Adresse :</span>{" "}
                      {selectedOrder.customer.address}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div>
                  <h3 className="font-semibold text-sm mb-3">Articles de la commande</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 bg-secondary rounded-xl p-4"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Taille : {item.size} | Couleur : {item.color}
                          </p>
                          <p className="text-xs text-muted-foreground">Qté : {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">FCFA {item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment & shipping */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Paiement</h3>
                    <div className="bg-secondary rounded-xl p-4 space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Méthode :</span>{" "}
                        {selectedOrder.paymentMethod}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Statut :</span>{" "}
                        <span
                          className={cn(
                            "capitalize",
                            selectedOrder.paymentStatus === "paid"
                              ? "text-green-600"
                              : selectedOrder.paymentStatus === "refunded"
                              ? "text-red-600"
                              : "text-yellow-600"
                          )}
                        >
                          {selectedOrder.paymentStatus === "paid" 
                            ? "Payé" 
                            : selectedOrder.paymentStatus === "refunded"
                            ? "Remboursé"
                            : selectedOrder.paymentStatus === "pending"
                            ? "En attente"
                            : selectedOrder.paymentStatus}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Chronologie</h3>
                    <div className="bg-secondary rounded-xl p-4 space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Créé le :</span>{" "}
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Modifié le :</span>{" "}
                        {formatDate(selectedOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tracking */}
                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Expédition</h3>
                    <div className="bg-secondary rounded-xl p-4">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Numéro de suivi :</span>{" "}
                        <span className="font-mono font-medium">
                          {selectedOrder.trackingNumber}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold">FCFA {selectedOrder.total}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full bg-transparent gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer la facture
                  </Button>
                  {selectedOrder.status !== "completed" &&
                    selectedOrder.status !== "cancelled" && (
                      <Select
                        value={selectedOrder.status}
                        onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                      >
                        <SelectTrigger className="flex-1 rounded-full">
                          <SelectValue placeholder="Mettre à jour le statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="processing">En traitement</SelectItem>
                          <SelectItem value="shipped">Expédiée</SelectItem>
                          <SelectItem value="completed">Terminée</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
