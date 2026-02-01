"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Les types doivent être importés ou définis
// Idéalement, à partir d'un fichier de types partagé
export type Product = any // Remplacez par une interface/type plus spécifique
export type Category = any // Remplacez par une interface/type plus spécifique

const sortOptions = [
  { value: "created_at.desc", label: "Plus récents" },
  { value: "price.asc", label: "Prix : croissant" },
  { value: "price.desc", label: "Prix : décroissant" },
  { value: "name.asc", label: "Nom : A-Z" },
]

interface ShopPageClientProps {
  initialProducts: Product[]
  categories: Category[]
}

export function ShopPageClient({ initialProducts, categories }: ShopPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const categoryParam = searchParams.get("category") || "ALL"
  const sortParam = searchParams.get("sortBy") || "created_at.desc"
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [sortBy, setSortBy] = useState(sortParam)
  const [favorites, setFavorites] = useState<string[]>([])
  
  // Mettre à jour l'état lorsque les paramètres de l'URL changent
  useEffect(() => {
    const cat = searchParams.get("category") || "ALL"
    const sort = searchParams.get("sortBy") || "created_at.desc"
    setSelectedCategory(cat)
    setSortBy(sort)
  }, [searchParams])

  const handleUrlChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/shop?${params.toString()}`, { scroll: false })
  }
  
  const clearFilters = () => {
    router.push("/shop", { scroll: false })
  }

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 lg:py-12">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Tous les produits
          </h1>
          <p className="text-muted-foreground">
            {initialProducts.length} produit{initialProducts.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Catégories - Bureau */}
          <div className="hidden md:flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleUrlChange("category", "ALL")}
              className={cn("rounded-full text-xs", selectedCategory === "ALL" ? "bg-foreground text-background" : "bg-transparent border-border text-foreground hover:bg-secondary")}
            >
              ALL
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => handleUrlChange("category", category.slug)}
                className={cn("rounded-full text-xs", selectedCategory === category.slug ? "bg-foreground text-background" : "bg-transparent border-border text-foreground hover:bg-secondary")}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Bouton de filtre mobile */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="rounded-full bg-transparent border-border">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader><SheetTitle>Filtres</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-medium text-foreground mb-3">Catégorie</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant={selectedCategory === "ALL" ? "default" : "outline"} size="sm" onClick={() => handleUrlChange("category", "ALL")}>ALL</Button>
                    {categories.map((category) => (
                      <Button key={category.id} variant={selectedCategory === category.slug ? "default" : "outline"} size="sm" onClick={() => handleUrlChange("category", category.slug)}>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-3">Trier par</h3>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button key={option.value} type="button" onClick={() => handleUrlChange("sortBy", option.value)} className={cn("block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", sortBy === option.value ? "bg-foreground text-background" : "text-foreground hover:bg-secondary")}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Tri - Bureau */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trier par :</span>
            <select value={sortBy} onChange={(e) => handleUrlChange("sortBy", e.target.value)} className="text-sm bg-transparent border border-border rounded-full px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtres actifs */}
        {selectedCategory !== "ALL" && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Filtres actifs :</span>
            {selectedCategory !== "ALL" && (
              <Button variant="outline" size="sm" onClick={() => handleUrlChange("category", "ALL")} className="rounded-full bg-transparent border-border text-foreground text-xs">
                {selectedCategory}
                <X className="w-3 h-3 ml-1" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground text-xs hover:text-foreground">
              Tout effacer
            </Button>
          </div>
        )}

        {/* Grille de produits */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {initialProducts.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-3">
                  <Image src={product.images?.[0] && product.images[0] !== '' ? product.images[0] : "/placeholder.svg"} alt={product.name} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                  {product.is_new && (
                    <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase bg-accent text-accent-foreground rounded-full">
                      Nouveau
                    </span>
                  )}
                  {product.original_price && (
                    <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase bg-red-500 text-white rounded-full">
                      Promo
                    </span>
                  )}
                  <button type="button" onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors" aria-label={favorites.includes(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}>
                    <Heart className={cn("h-4 w-4 transition-colors", favorites.includes(product.id) ? "fill-red-500 text-red-500" : "text-foreground")} />
                  </button>
                </div>
              </Link>
              <div>
                <h3 className="font-medium text-foreground text-sm lg:text-base mb-1 truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-foreground font-semibold">FCFA {product.price}</p>
                  {product.original_price && (
                    <p className="text-muted-foreground text-sm line-through">FCFA {product.original_price}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
