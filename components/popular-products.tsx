"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QuickViewModal } from "@/components/quick-view-modal"
import { useProducts, type Product } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"

export function PopularProducts() {
  // Use category slug for filter, then find ID
  const [activeFilterName, setActiveFilterName] = useState("ALL") // Use name for UI display
  const [favorites, setFavorites] = useState<string[]>([]) // Product IDs are strings (UUIDs)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null) // Product IDs are strings (UUIDs)

  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()

  const filters = useMemo(() => {
    if (categoriesLoading || categories.length === 0) return ["ALL"]
    return ["ALL", ...categories.map(cat => cat.name.toUpperCase())]
  }, [categories, categoriesLoading])

  const filteredProducts = useMemo(() => {
    if (productsLoading) return []
    if (activeFilterName === "ALL") return products

    // Find the category ID for the active filter name
    const category = categories.find(cat => cat.name.toUpperCase() === activeFilterName)
    if (!category) return products // Fallback to all products if category not found

    return products.filter(product => product.category_id === category.id)
  }, [products, productsLoading, activeFilterName, categories])

  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const openQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
  }

  // Handle loading states
  if (productsLoading || categoriesLoading) {
    return (
      <section className="container mx-auto px-4 py-12 lg:py-16 text-center">
        <p className="text-muted-foreground">Chargement des produits...</p>
      </section>
    )
  }

  return (
    <section className="container mx-auto px-4 py-12 lg:py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Produits populaires
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilterName === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilterName(filter)}
              className={cn(
                "rounded-full text-xs",
                activeFilterName === filter
                  ? "bg-foreground text-background"
                  : "bg-transparent border-border text-foreground hover:bg-secondary"
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid avec animations staggered */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="group"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <Link href={`/product/${product.id}`}>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-3">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"} // Use first image from array
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500"
                  loading={index < 4 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                {product.is_new && ( // Use is_new
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase bg-accent text-accent-foreground rounded-full"
                  >
                    Nouveau
                  </motion.span>
                )}
                
                {/* Overlay avec actions au hover (desktop) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: hoveredProduct === product.id ? 1 : 0,
                    scale: hoveredProduct === product.id ? 1.05 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center gap-2"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => openQuickView(product, e)}
                    onMouseEnter={(e) => e.stopPropagation()}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu rapide
                  </Button>
                </motion.div>

                <button
                  type="button"
                  onClick={(e) => toggleFavorite(product.id, e)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
                  aria-label={
                    favorites.includes(product.id)
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      favorites.includes(product.id)
                        ? "fill-red-500 text-red-500"
                        : "text-foreground"
                    )}
                  />
                </button>
              </div>
            </Link>
            <div>
              <h3 className="font-medium text-foreground text-sm lg:text-base mb-1 truncate">
                {product.name}
              </h3>
              <p className="text-foreground font-semibold">FCFA {product.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* View All Button */}
      <div className="flex justify-center mt-10">
        <Link href="/shop">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-foreground text-foreground hover:bg-foreground hover:text-background bg-transparent"
          >
            Voir tous les produits
          </Button>
        </Link>
      </div>
    </section>
  )
}
