"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X, ShoppingBag, ArrowRight, ChevronLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  const shipping = totalPrice > 100 ? 0 : 10
  const tax = totalPrice * 0.1
  const total = totalPrice + shipping + tax

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Continuer les achats
            </Link>
          </nav>

          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Panier
          </h1>

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}-${item.color.name}`}
                    className="flex gap-4 p-4 bg-secondary rounded-2xl"
                  >
                    {/* Product Image */}
                    <Link href={`/product/${item.product.id}`}>
                      <div className="relative w-24 h-28 sm:w-32 sm:h-36 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link href={`/product/${item.product.id}`}>
                            <h3 className="font-semibold text-foreground hover:text-accent transition-colors truncate">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            Taille : {item.size} | Couleur : {item.color.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Retirer l'article"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        {/* Quantity */}
                        <div className="inline-flex items-center border border-border rounded-lg bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color.name,
                                item.quantity - 1
                              )
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color.name,
                                item.quantity + 1
                              )
                            }
                            className="p-2 hover:bg-secondary transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            FCFA {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              FCFA {item.product.price} l'unité
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-secondary rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">
                    Résumé de la commande
                  </h2>

                  {/* Promo Code */}
                  <div className="flex gap-2 mb-6">
                    <Input
                      type="text"
                      placeholder="Code promo"
                      className="bg-background border-0 rounded-lg"
                    />
                    <Button
                      variant="outline"
                      className="rounded-lg border-border bg-transparent text-foreground hover:bg-background"
                    >
                      Appliquer
                    </Button>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span className="text-foreground">FCFA {totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      <span className="text-foreground">
                        {shipping === 0 ? "Gratuit" : `FCFA ${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxe (10%)</span>
                      <span className="text-foreground">FCFA {tax.toFixed(2)}</span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-green-600">
                        Vous êtes éligible à la livraison gratuite !
                      </p>
                    )}
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">FCFA {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link href="/checkout">
                    <Button
                      size="lg"
                      className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full group"
                    >
                      Passer à la caisse
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      Nous acceptons
                    </p>
                    <div className="flex justify-center gap-2">
                      <div className="px-2 py-1 bg-background rounded text-xs font-medium text-foreground">
                        Visa
                      </div>
                      <div className="px-2 py-1 bg-background rounded text-xs font-medium text-foreground">
                        Mastercard
                      </div>
                      <div className="px-2 py-1 bg-background rounded text-xs font-medium text-foreground">
                        PayPal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Votre panier est vide
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Il semble que vous n&apos;ayez rien ajouté à votre panier pour le moment. Commencez vos achats pour trouver votre style parfait !
      </p>
      <Link href="/">
        <Button
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 group"
        >
          Commencer les achats
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
}
