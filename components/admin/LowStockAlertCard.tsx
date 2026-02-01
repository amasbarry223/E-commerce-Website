"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function LowStockAlertCard() {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [lowStockLoading, setLowStockLoading] = useState(true)

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      setLowStockLoading(true)
      try {
        const response = await fetch('/api/admin/low-stock-products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLowStockProducts(data);
      } catch (error) {
        console.error("Failed to fetch low stock products:", error);
        // Optionally show a toast notification for error
      } finally {
        setLowStockLoading(false);
      }
    };

    fetchLowStockProducts();
  }, []); // Run once on component mount

  if (lowStockLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (lowStockProducts.length === 0) {
    return null; // Don't render if no low stock products
  }

  return (
    <Card className="border-0 shadow-sm bg-red-50 ring-2 ring-red-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-red-700">Alerte Stock Faible !</CardTitle>
        <Link href="/admin/products?stock=low"> {/* Link to a filtered products page */}
          <Button variant="ghost" size="sm" className="gap-1 text-red-600">
            Voir les produits
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map((product: any) => (
            <div key={product.id} className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-red-100 flex-shrink-0">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-red-800 truncate">{product.name}</p>
                <p className="text-xs text-red-600">Stock: {product.stock}</p>
              </div>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Button variant="outline" size="sm" className="h-7 text-red-600 border-red-300">
                  Gérer
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
