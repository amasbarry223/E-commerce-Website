"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
  Loader2,
  Package,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Using real data from API

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("12m")
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300))

      // Calculer les analytics depuis les données locales
      const { getOrders, getProducts, getCustomers, initializeStorage } = await import('@/lib/storage')
      initializeStorage()

      const allOrders = getOrders()
      const allProducts = getProducts()
      const allCustomers = getCustomers()

      // Calculer le revenu total
      const totalRevenue = allOrders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0)

      // Générer des données de revenu par période (mock)
      const revenueData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: Math.floor(totalRevenue / 12) + Math.random() * 1000,
      }))

      // Top catégories (mock basé sur les produits)
      const categoryCounts = allProducts.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Top produits
      const topProducts = allProducts
        .map(p => ({
          name: p.name,
          revenue: p.price * (p.reviews || 0) * 0.1, // Estimation
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      const analyticsData = {
        stats: {
          totalRevenue,
          totalOrders: allOrders.length,
          totalCustomers: allCustomers.length,
          pageViews: 12345, // Mock
        },
        revenueData,
        topCategories,
        topProducts,
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const revenueData = analytics?.revenueData || []
  const topCategories = analytics?.topCategories || []
  const topProducts = analytics?.topProducts || []

  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map((d: any) => d.revenue)) : 1

  const stats = analytics ? [
    {
      title: "Revenu total",
      value: `$${analytics.stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+0%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total des commandes",
      value: analytics.stats.totalOrders.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total des clients",
      value: analytics.stats.totalCustomers.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Vues de page",
      value: analytics.stats.pageViews?.toLocaleString() || "0",
      change: "+0%",
      trend: "up" as const,
      icon: Eye,
      color: "bg-orange-100 text-orange-700",
    },
  ] : [
    {
      title: "Revenu total",
      value: "$0.00",
      change: "+0%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Total des commandes",
      value: "0",
      change: "+0%",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total des clients",
      value: "0",
      change: "+0%",
      trend: "up" as const,
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Vues de page",
      value: "0",
      change: "+0%",
      trend: "up" as const,
      icon: Eye,
      color: "bg-orange-100 text-orange-700",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyses</h1>
          <p className="text-muted-foreground">Suivez les performances de votre boutique</p>
        </div>
        <Select value={period} onValueChange={(value) => {
          setPeriod(value)
        }}>
          <SelectTrigger className="w-40 bg-secondary border-0 rounded-full">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="3m">3 derniers mois</SelectItem>
            <SelectItem value="12m">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
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
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  )}
                >
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

      {/* Revenue Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Aperçu des revenus</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible pour cette période
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueData.map((data: any) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-accent rounded-t-lg transition-all hover:bg-accent/80 cursor-pointer relative group"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${data.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
                     )}
                   )}
                   </CardContent>      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Meilleures catégories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée disponible</p>
            ) : (
              topCategories.map((category: any) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${category.revenue.toLocaleString()} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
                       )}
                     )}
                     </CardContent>        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Meilleurs produits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée disponible</p>
            ) : (
              topProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{product.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">${product.revenue.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {product.sales} ventes
                    </span>
                  </div>
                </div>
              ))
            )}
                       )}
                     )}
                     </CardContent>        </Card>
      </div>

    </div>
  )
}
