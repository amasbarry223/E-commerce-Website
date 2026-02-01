"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface QuickViewModalProps {
  product: {
    id: number
    name: string
    price: number
    image: string
    category: string
    isNew?: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl p-0 gap-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-2 gap-0"
            >
              {/* Image */}
              <div className="relative aspect-square bg-secondary">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-accent text-accent-foreground rounded-full">
                    Nouveau
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground mb-2">{product.name}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">{product.category}</DialogDescription>
                  </DialogHeader>
                  <p className="text-3xl font-bold text-foreground mb-6">FCFA {product.price}</p>
                </div>

                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-foreground text-background hover:bg-foreground/90"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Ajouter au panier
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4 mr-2",
                        isFavorite && "fill-red-500 text-red-500"
                      )}
                    />
                    {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

