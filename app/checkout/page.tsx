"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, Lock, Shield, Truck, CreditCard, ShoppingBag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from 'sonner' // Importation de toast de sonner

type Step = "shipping" | "payment" | "confirmation"

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const [currentStep, setCurrentStep] = useState<Step>("shipping")
  const [formData, setFormData] = useState<{
    email: string
    firstName: string
    lastName: string
    address: string
    city: string
    zipCode: string
    country: string
    phone: string
    cardNumber: string
    cardName: string
    expiryDate: string
    cvv: string
  }>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    phone: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  // Sauvegarder dans localStorage
  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("checkout_form_data", JSON.stringify(formData))
    }
  }

  // Charger depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("checkout_form_data")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setFormData(parsed)
          // Ne pas charger les infos de carte du localStorage pour des raisons de sécurité
          setFormData(prev => ({
            ...prev,
            cardNumber: "",
            cardName: "",
            expiryDate: "",
            cvv: ""
          }))
        } catch (e) {
          console.error("Failed to parse checkout form data from localStorage", e)
        }
      }
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      saveToLocalStorage()
      return updated
    })
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "email":
        if (!value) return "L'email est requis."
        if (!/\S+@\S+\.\S+/.test(value)) return "Format d'email invalide."
        return null
      case "firstName":
      case "lastName":
      case "address":
      case "city":
      case "zipCode":
      case "country":
      case "phone":
      case "cardName":
        if (!value) return "Ce champ est requis."
        return null
      case "cardNumber":
        if (!value) return "Le numéro de carte est requis."
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) return "Numéro de carte invalide (16 chiffres)."
        return null
      case "expiryDate":
        if (!value) return "La date d'expiration est requise."
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) return "Format invalide (MM/AA)."
        // Basic month/year validation
        const [month, year] = value.split('/').map(Number)
        const currentYear = new Date().getFullYear() % 100
        const currentMonth = new Date().getMonth() + 1
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Carte expirée."
        }
        return null
      case "cvv":
        if (!value) return "Le CVV est requis."
        if (!/^\d{3,4}$/.test(value)) return "CVV invalide (3 ou 4 chiffres)."
        return null
      default:
        return null
    }
  }

  const handleBlur = (field: string) => {
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const validateShippingForm = (): boolean => {
    let newErrors: Record<string, string | null> = {}
    const fields: Array<keyof typeof formData> = [
      "email", "firstName", "lastName", "address", "city", "zipCode", "country", "phone"
    ]
    fields.forEach(field => {
      newErrors[field as string] = validateField(field as string, formData[field])
    })
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== null)
  }

  const validatePaymentForm = (): boolean => {
    let newErrors: Record<string, string | null> = {}
    const fields: Array<keyof typeof formData> = [
      "cardNumber", "cardName", "expiryDate", "cvv"
    ]
    fields.forEach(field => {
      newErrors[field as string] = validateField(field as string, formData[field])
    })
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== null)
  }

  const handleSubmitShipping = () => {
    if (validateShippingForm()) {
      setCurrentStep("payment")
    }
  }

  const handleSubmitPayment = async () => {
    if (!validatePaymentForm()) {
        toast.error("Veuillez corriger les erreurs de paiement.");
        return;
    }

    setIsProcessingOrder(true);
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                formData,
                cartItems: items,
                total: total,
                shipping: shipping,
                tax: tax,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            toast.success("Commande passée avec succès !");
            clearCart(); // Vider le panier
            if (typeof window !== "undefined") {
              localStorage.removeItem("checkout_form_data"); // Nettoyer le localStorage
            }
            setCurrentStep("confirmation");
        } else {
            toast.error(result.message || "Échec de la commande. Veuillez réessayer.");
            console.error("Order creation failed:", result);
        }
    } catch (error) {
        toast.error("Une erreur inattendue est survenue.");
        console.error("Unexpected error during order creation:", error);
    } finally {
        setIsProcessingOrder(false);
    }
  }

  const shipping = totalPrice > 100 ? 0 : 10
  const tax = totalPrice * 0.1
  const total = totalPrice + shipping + tax

  const steps = [
    { id: "shipping", label: "Livraison", icon: Truck },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "confirmation", label: "Confirmation", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6 mx-auto">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Il semble que vous n&apos;ayez rien ajouté à votre panier pour le moment. Commencez vos achats pour trouver votre style parfait !
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8">
                Continuer les achats
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = index === currentStepIndex
                const isCompleted = index < currentStepIndex

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                          isCompleted
                            ? "bg-accent border-accent text-accent-foreground"
                            : isActive
                            ? "bg-foreground border-foreground text-background"
                            : "bg-background border-border text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-xs font-medium",
                          isActive || isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 mx-4 transition-colors",
                          isCompleted ? "bg-accent" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === "shipping" && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6">
                      <h2 className="text-xl font-bold mb-6">Informations de livraison</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">
                            Email <span className="text-destructive" aria-label="requis">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            placeholder="votre@email.com"
                            autoComplete="email"
                            required
                            aria-required="true"
                            aria-describedby={errors.email ? "email-error" : "email-hint"}
                            aria-invalid={!!errors.email}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email ? (
                            <p id="email-error" className="text-xs text-destructive mt-1" role="alert">
                              {errors.email}
                            </p>
                          ) : (
                            <p id="email-hint" className="text-xs text-muted-foreground mt-1">
                              Nous vous enverrons la confirmation de commande à cette adresse
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">
                              Prénom <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              autoComplete="given-name"
                              required
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">
                              Nom <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              autoComplete="family-name"
                              required
                              aria-required="true"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address">
                            Adresse <span className="text-destructive" aria-label="requis">*</span>
                          </Label>
                          <Input
                            id="address"
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            autoComplete="street-address"
                            required
                            aria-required="true"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">
                              Ville <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="city"
                              name="city"
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              autoComplete="address-level2"
                              required
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">
                              Code postal <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="zipCode"
                              name="postal-code"
                              type="text"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange("zipCode", e.target.value)}
                              autoComplete="postal-code"
                              required
                              aria-required="true"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">
                            Téléphone <span className="text-destructive" aria-label="requis">*</span>
                          </Label>
                          <Input
                            id="phone"
                            name="tel"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            autoComplete="tel"
                            required
                            aria-required="true"
                            aria-describedby="phone-hint"
                          />
                          <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                            Pour vous contacter concernant votre commande
                          </p>
                        </div>
                        <Button
                          size="lg"
                          className="w-full mt-6"
                          onClick={handleSubmitShipping}
                        >
                          Continuer vers le paiement
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {currentStep === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6">
                      <h2 className="text-xl font-bold mb-6">Informations de paiement</h2>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">
                            Numéro de carte <span className="text-destructive" aria-label="requis">*</span>
                          </Label>
                          <Input
                            id="cardNumber"
                            name="cc-number"
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            autoComplete="cc-number"
                            required
                            aria-required="true"
                            aria-describedby="cardNumber-hint"
                          />
                          <p id="cardNumber-hint" className="text-xs text-muted-foreground mt-1">
                            Entrez les 16 chiffres de votre carte
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="cardName">
                            Nom sur la carte <span className="text-destructive" aria-label="requis">*</span>
                          </Label>
                          <Input
                            id="cardName"
                            name="cc-name"
                            type="text"
                            value={formData.cardName}
                            onChange={(e) => handleInputChange("cardName", e.target.value)}
                            autoComplete="cc-name"
                            required
                            aria-required="true"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiryDate">
                              Date d'expiration <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="expiryDate"
                              name="cc-exp"
                              type="text"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                              placeholder="MM/AA"
                              maxLength={5}
                              autoComplete="cc-exp"
                              required
                              aria-required="true"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv">
                              CVV <span className="text-destructive" aria-label="requis">*</span>
                            </Label>
                            <Input
                              id="cvv"
                              name="cc-csc"
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange("cvv", e.target.value)}
                              placeholder="123"
                              maxLength={3}
                              autoComplete="cc-csc"
                              required
                              aria-required="true"
                              aria-describedby="cvv-hint"
                            />
                            <p id="cvv-hint" className="text-xs text-muted-foreground mt-1">
                              3 chiffres au dos de la carte
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                          <Lock className="w-4 h-4" />
                          <span>Paiement sécurisé avec cryptage SSL</span>
                        </div>
                        <div className="flex gap-4 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep("shipping")}
                            className="flex-1"
                            disabled={isProcessingOrder}
                          >
                            Retour
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1"
                            onClick={handleSubmitPayment}
                            disabled={isProcessingOrder}
                          >
                            {isProcessingOrder ? (
                                <span className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Traitement...
                                </span>
                            ) : (
                                <>
                                    Confirmer la commande
                                    <Lock className="ml-2 w-4 h-4" />
                                </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {currentStep === "confirmation" && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6"
                      >
                        <Check className="w-10 h-10 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-4">Commande confirmée !</h2>
                      <p className="text-muted-foreground mb-6">
                        Merci pour votre achat. Vous recevrez un email de confirmation sous peu.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Link href="/">
                          <Button variant="outline">Retour à l'accueil</Button>
                        </Link>
                        <Link href="/account/dashboard">
                          <Button>Voir mes commandes</Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Résumé de la commande</h3>
                  <div className="space-y-2 mb-4">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="text-foreground">
                          FCFA {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
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
                      <span className="text-muted-foreground">Taxe</span>
                      <span className="text-foreground">FCFA {tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>FCFA {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Paiement sécurisé et protégé</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v4" />
        <path d="M12 18v4" />
        <path d="M4.93 4.93l2.83 2.83" />
        <path d="M16.24 16.24l2.83 2.83" />
        <path d="M2 12h4" />
        <path d="M18 12h4" />
        <path d="M4.93 19.07l2.83-2.83" />
        <path d="M16.24 7.76l2.83-2.83" />
      </svg>
    );
  }


