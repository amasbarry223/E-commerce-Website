"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useOrders } from "@/hooks/use-orders"
import { useProducts } from "@/hooks/use-products"
import { useCustomers } from "@/hooks/use-customers"

// Mock data for dashboard (fallback)
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+15.2%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "12,234",
    change: "+8.1%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Products",
    value: "573",
    change: "-2.4%",
    trend: "down",
    icon: Package,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "Amadou Diallo",
    email: "amadou.d@example.com",
    product: "Boubou Élégant",
    amount: "FCFA 45,000",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Mariam Traoré",
    email: "mariam.t@example.com",
    product: "Pagne Bogolan",
    amount: "FCFA 30,000",
    status: "processing",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Bakary Coulibaly",
    email: "bakary.c@example.com",
    product: "Chaussures Traditionnelles",
    amount: "FCFA 25,000",
    status: "shipped",
    date: "2024-01-14",
  },
  {
    id: "ORD-004",
    customer: "Fatoumata Konaté",
    email: "fatoumata.k@example.com",
    product: "T-shirt Coton Bio",
    amount: "FCFA 10,000",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "ORD-005",
    customer: "Moussa Keïta",
    email: "moussa.k@example.com",
    product: "Bijoux Touareg",
    amount: "FCFA 75,000",
    status: "completed",
    date: "2024-01-13",
  },
]

const topProducts = [
  {
    id: 1,
    name: "Boubou Élégant",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop",
    sales: 245,
    revenue: "FCFA 450,000",
  },
  {
    id: 2,
    name: "Pagne Bogolan",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=200&auto=format&fit=crop",
    sales: 189,
    revenue: "FCFA 300,000",
  },
  {
    id: 3,
    name: "Chaussures Traditionnelles",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop",
    sales: 156,
    revenue: "FCFA 250,000",
  },
  {
    id: 4,
    name: "T-shirt Coton Bio",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop",
    sales: 312,
    revenue: "FCFA 100,000",
  },
]

const statusStyles: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
}



export default function AdminDashboard() {
  const [period, setPeriod] = useState("7d") // This can now be used to filter data if needed, but not implemented for now
  // Analytics are now derived directly from hooks, no separate state needed for `analytics`
  // const [analytics, setAnalytics] = useState<any>(null)
  // const [loading, setLoading] = useState(true) // Loading now comes from individual hooks

  // Optimisation : charger seulement les données nécessaires pour le dashboard
  const { orders, loading: ordersLoading } = useOrders()
  const { products, loading: productsLoading } = useProducts()
  const { customers, loading: customersLoading } = useCustomers()

  const loading = ordersLoading || productsLoading || customersLoading; // Combined loading state

  // Derived analytics from real-time data - Optimisé avec early return et limite
  const { totalRevenue, totalOrders, totalCustomers, topProductsCalculated } = useMemo(() => {
    // Early return si les données ne sont pas encore chargées
    if (orders.length === 0 && products.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: customers.length,
        topProductsCalculated: [],
      };
    }

    let revenue = 0;
    let numOrders = 0;
    let numCustomers = customers.length;
    // Utiliser Map pour de meilleures performances
    const productSalesMap = new Map<string, { sales: number; revenue: number; product: any }>();

    // Limiter le traitement aux 100 premières commandes pour améliorer les performances
    const limitedOrders = orders.slice(0, 100);
    
    limitedOrders.forEach(order => {
      // Assuming 'paid' orders contribute to revenue
      if (order.payment_status === 'paid') {
        revenue += order.total;
        numOrders++;
      }
      
      // Limiter le traitement des order_items
      const limitedItems = order.order_items?.slice(0, 10) || [];
      limitedItems.forEach(item => {
        // Find the product from the products array for details, or use item.product_name
        const productDetail = products.find(p => p.id === item.product_id);
        
        const existing = productSalesMap.get(item.product_id);
        if (existing) {
          existing.sales += item.quantity;
          existing.revenue += item.quantity * parseFloat(item.price.toString());
        } else {
          productSalesMap.set(item.product_id, {
            sales: item.quantity,
            revenue: item.quantity * parseFloat(item.price.toString()),
            product: productDetail
          });
        }
      });
    });

    const topProductsSorted = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales) // Sort by sales
      .slice(0, 4) // Take top 4
      .map(item => ({
        id: item.product?.id || `product-${item.product?.name}`, // Fallback ID
        name: item.product?.name,
        image: item.product?.images?.[0] || "/placeholder.svg",
        sales: item.sales,
        revenue: item.revenue,
      }));

    return {
      totalRevenue: revenue,
      totalOrders: numOrders,
      totalCustomers: numCustomers,
      topProductsCalculated: topProductsSorted,
    };
  }, [orders, products, customers]); // Recalculate when dependencies change

  // Calculate stats from real data
  const stats = [
    {
      title: "Revenu total",
      value: `FCFA ${Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+0%", // You can calculate this from previous period
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Commandes",
      value: totalOrders.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      value: totalCustomers.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Produits",
      value: products.length.toString(),
      change: "+0%",
      trend: "up" as const,
      icon: Package,
    },
  ]

  // Get recent orders
  const recentOrders = orders.slice(0, 5).map((order) => ({
    id: order.id,
    customer: order.customer_details?.name || "N/A", // Use customer_details
    email: order.customer_details?.email || "N/A", // Use customer_details
    product: order.order_items[0]?.product_name || "Multiple items", // Use product_name from order_items
    amount: `FCFA ${order.total.toFixed(2)}`,
    status: order.status,
    date: new Date(order.created_at).toLocaleDateString(), // Use created_at
  }))

  // Get top products from analytics
  const topProducts = topProductsCalculated;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Bon retour, Admin</p>
        </div>
        <div className="flex gap-2">
          {["24h", "7d", "30d", "90d"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium h-8 px-3 disabled:pointer-events-none disabled:opacity-50 outline-none",
                period === p 
                  ? "bg-foreground text-background" 
                  : "bg-transparent border border-border"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent orders */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Commandes récentes</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                Voir tout
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Produit
                    </th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Aucune commande pour le moment
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <span className="font-medium text-sm">{order.id}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-sm">{order.customer}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">{order.product}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn(
                          "inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize",
                          statusStyles[order.status]
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-medium text-sm">FCFA {order.amount}</span>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Meilleurs produits</CardTitle>
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                Voir tout
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun produit pour le moment</p>
              ) : (
                topProducts.map((product: any, index: number) => (
                  <div key={product.id || `product-${index}`} className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name || "Produit"}</p>
                      <p className="text-xs text-muted-foreground">{product.sales || 0} ventes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">FCFA {Number(product.revenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/admin/products?action=new">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 bg-transparent border-border hover:bg-secondary">
                <Package className="w-6 h-6" />
                <span>Ajouter un produit</span>
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 bg-transparent border-border hover:bg-secondary">
                <ShoppingCart className="w-6 h-6" />
                <span>Voir les commandes</span>
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 bg-transparent border-border hover:bg-secondary">
                <Users className="w-6 h-6" />
                <span>Gérer les utilisateurs</span>
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2 bg-transparent border-border hover:bg-secondary">
                <DollarSign className="w-6 h-6" />
                <span>Rapport de ventes</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}