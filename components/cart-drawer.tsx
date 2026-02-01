"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ArrowRight, ShoppingBag, Tag } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/components/ui/use-mobile"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const isMobile = useIsMobile()

  const shipping = totalPrice > 100 ? 0 : 10
  const tax = totalPrice * 0.1
  const total = totalPrice + shipping + tax
  const freeShippingThreshold = 100
  const progressToFreeShipping = Math.min((totalPrice / freeShippingThreshold) * 100, 100)

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Panier ({items.length})</DrawerTitle>
              <DrawerDescription>
                {items.length === 0 ? "Votre panier est vide" : `${items.length} article${items.length > 1 ? 's' : ''}`}
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Progress bar pour livraison gratuite */}
          {totalPrice < freeShippingThreshold && (
            <div className="p-4 bg-accent/10 border-b">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Livraison gratuite dès ${freeShippingThreshold}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${(freeShippingThreshold - totalPrice).toFixed(2)} restants
                </p>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToFreeShipping}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Commencez vos achats pour remplir votre panier
                  </p>
                  <Button onClick={onClose} asChild>
                    <Link href="/shop">Commencer les achats</Link>
                  </Button>
                </motion.div>
              ) : (
                items.map((item, index) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}-${item.color.name}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className="flex gap-3 p-3 bg-secondary rounded-xl"
                  >
                    {/* Product Image */}
                    <Link href={`/product/${item.product.id}`} onClick={onClose}>
                      <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.images[0] && item.product.images[0] !== '' ? item.product.images[0] : "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${item.product.id}`} onClick={onClose}>
                            <h4 className="font-medium text-sm text-foreground truncate hover:text-accent transition-colors">
                              {item.product.name}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Taille: {item.size} | Couleur: {item.color.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                          aria-label="Retirer du panier"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="inline-flex items-center border border-border rounded-lg bg-background">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.color.name,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="p-1.5 hover:bg-secondary transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
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
                            className="p-1.5 hover:bg-secondary transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="font-semibold text-sm text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4 bg-background">
              {/* Promo Code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="pl-10 bg-secondary border-0 rounded-lg"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    if (promoCode) {
                      // TODO: Appliquer le code promo
                      setPromoCode("")
                    }
                  }}
                >
                  Appliquer
                </Button>
              </div>

              {/* Summary Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="text-foreground">
                    {shipping === 0 ? "Gratuit" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-green-600 font-medium"
                  >
                    ✓ Livraison gratuite appliquée !
                  </motion.p>
                )}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-base">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full group"
                onClick={() => {
                  onClose()
                  window.location.href = "/checkout"
                }}
              >
                Commander
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Link
                href="/cart"
                onClick={onClose}
                className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voir le panier complet
              </Link>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

