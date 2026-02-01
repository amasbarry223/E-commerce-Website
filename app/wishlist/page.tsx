"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, X, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { products } from "@/lib/products"

// Demo wishlist items
const initialWishlistIds = [1, 3, 6]

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState(initialWishlistIds)
  const wishlistItems = products.filter((product) => wishlistIds.includes(product.id))

  const removeFromWishlist = (productId: number) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Ma liste de souhaits
          </h1>
          <p className="text-muted-foreground mb-8">
            {wishlistItems.length} {wishlistItems.length === 1 ? "article" : "articles"}
          </p>

          {wishlistItems.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {wishlistItems.map((product) => (
                <div key={product.id} className="group">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary mb-3">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    {product.isNew && (
                      <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-wider uppercase bg-accent text-accent-foreground rounded-full">
                        Nouveau
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                      aria-label="Retirer de la liste de souhaits"
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium text-foreground text-sm lg:text-base mb-1 truncate hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-foreground font-semibold">FCFA {product.price}</p>
                      {product.originalPrice && (
                        <p className="text-muted-foreground text-sm line-through">
                          FCFA {product.originalPrice}
                        </p>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button
                        size="sm"
                        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full text-xs"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Ajouter au panier
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Votre liste de souhaits est vide
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Commencez à ajouter des articles que vous aimez en cliquant sur l&apos;icône cœur sur les produits !
      </p>
      <Link href="/shop">
        <Button
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 group"
        >
          Parcourir les produits
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
}
