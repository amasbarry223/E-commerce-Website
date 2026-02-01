"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSwipeable } from "react-swipeable"

interface ImageGalleryProps {
  images: string[]
  productName: string
  isNew?: boolean
  hasSale?: boolean
}

export function ImageGallery({ images, productName, isNew, hasSale }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isZooming, setIsZooming] = useState(false)

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: false,
  })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image avec zoom */}
        <div
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary cursor-zoom-in"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
          {...swipeHandlers}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selectedImage] && images[selectedImage] !== '' ? images[selectedImage] : "/placeholder.svg"}
                alt={`${productName} - Image ${selectedImage + 1}`}
                fill
                className={cn(
                  "object-cover object-center transition-transform duration-300",
                  isZooming && "scale-150"
                )}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }
                    : undefined
                }
                priority={selectedImage === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Badges */}
          {isNew && (
            <span className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-accent text-accent-foreground rounded-full">
              Nouveau
            </span>
          )}
          {hasSale && (
            <span className="absolute top-4 right-4 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-red-500 text-white rounded-full">
              Promo
            </span>
          )}

          {/* Zoom indicator (desktop) */}
          {isZooming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm pointer-events-none"
            >
              <ZoomIn className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setSelectedImage(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                selectedImage === index
                  ? "border-foreground ring-2 ring-foreground/20"
                  : "border-transparent hover:border-muted-foreground"
              )}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image
                src={image && image !== '' ? image : "/placeholder.svg"}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={images[selectedImage] && images[selectedImage] !== '' ? images[selectedImage] : "/placeholder.svg"}
                  alt={`${productName} - Vue agrandie`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority
                />
              </div>

              {/* Navigation dans lightbox */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prevImage()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Image précédente"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      nextImage()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    aria-label="Image suivante"
                  >
                    →
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

