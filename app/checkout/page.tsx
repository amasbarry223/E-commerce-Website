"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, Lock, Shield, Truck, CreditCard, ShoppingBag, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from 'sonner' // Importation de toast de sonner

type Step = "shipping" | "payment" | "confirmation"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
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
    country: "Mali", // Valeur par défaut
    phone: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  // Calculer les totaux
  const shipping = totalPrice > 100 ? 0 : 10
  const tax = totalPrice * 0.1
  const total = totalPrice + shipping + tax

  // Protection : rediriger si non connecté
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account')
    }
  }, [user, authLoading, router])

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
      "email", "firstName", "lastName", "address", "city", "zipCode", "phone"
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
    const isValid = validateShippingForm()
    if (isValid) {
      setCurrentStep("payment")
    } else {
      // Afficher un message d'erreur si la validation échoue
      toast.error("Veuillez remplir tous les champs obligatoires correctement")
      // Faire défiler vers le premier champ en erreur
      const firstErrorField = Object.keys(errors).find(key => errors[key] !== null)
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.focus()
        }
      }
    }
  }

  const handleSubmitPayment = async () => {
    if (!validatePaymentForm()) {
        toast.error("Veuillez corriger les erreurs de paiement.");
        return;
    }

    if (!user) {
        toast.error("Vous devez être connecté pour passer une commande.");
        router.push('/account');
        return;
    }

    setIsProcessingOrder(true);
    try {
        // Créer la commande directement avec Supabase depuis le client
        // 1. Créer la commande principale
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                customer_details: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    address: `${formData.address}, ${formData.zipCode} ${formData.city}, ${formData.country}`,
                },
                total: total,
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'Credit Card',
            })
            .select()
            .single();

        if (orderError || !orderData) {
            console.error('Erreur lors de la création de la commande:', orderError);
            toast.error(orderError?.message || "Erreur lors de la création de la commande.");
            return;
        }

        const orderId = orderData.id;

        // 2. Créer les articles de la commande
        const orderItemsToInsert = items.map((item) => ({
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color.name || item.color,
            image: item.image || null,
        }));

        const { error: orderItemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (orderItemsError) {
            console.error('Erreur lors de la création des articles:', orderItemsError);
            // Annuler la commande en cas d'échec
            await supabase.from('orders').delete().eq('id', orderId);
            toast.error("Erreur lors de la création des articles de la commande.");
            return;
        }

        // 3. Décrémenter le stock des produits
        for (const item of items) {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();

            if (productError || !productData) {
                console.error(`Erreur stock produit ${item.product_id}:`, productError);
                continue;
            }

            const newStock = productData.stock - item.quantity;
            await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product_id);
        }

        // Succès !
        toast.success("Commande passée avec succès !");
        clearCart(); // Vider le panier
        if (typeof window !== "undefined") {
            localStorage.removeItem("checkout_form_data"); // Nettoyer le localStorage
        }
        setCurrentStep("confirmation");
    } catch (error: any) {
        toast.error("Une erreur inattendue est survenue.");
        console.error("Unexpected error during order creation:", error);
    } finally {
        setIsProcessingOrder(false);
    }
  }

  const steps = [
    { id: "shipping", label: "Livraison", icon: Truck },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "confirmation", label: "Confirmation", icon: Check },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  // Afficher un loader pendant la vérification d'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Vérification...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Rediriger si non connecté (fallback)
  if (!user) {
    return null // Le useEffect va rediriger
  }

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
                              onBlur={() => handleBlur("firstName")}
                              autoComplete="given-name"
                              required
                              aria-required="true"
                              aria-invalid={!!errors.firstName}
                              className={errors.firstName ? "border-destructive" : ""}
                            />
                            {errors.firstName && (
                              <p className="text-xs text-destructive mt-1" role="alert">
                                {errors.firstName}
                              </p>
                            )}
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
                              onBlur={() => handleBlur("lastName")}
                              autoComplete="family-name"
                              required
                              aria-required="true"
                              aria-invalid={!!errors.lastName}
                              className={errors.lastName ? "border-destructive" : ""}
                            />
                            {errors.lastName && (
                              <p className="text-xs text-destructive mt-1" role="alert">
                                {errors.lastName}
                              </p>
                            )}
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
                            onBlur={() => handleBlur("address")}
                            autoComplete="street-address"
                            required
                            aria-required="true"
                            aria-invalid={!!errors.address}
                            className={errors.address ? "border-destructive" : ""}
                          />
                          {errors.address && (
                            <p className="text-xs text-destructive mt-1" role="alert">
                              {errors.address}
                            </p>
                          )}
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
                              onBlur={() => handleBlur("city")}
                              autoComplete="address-level2"
                              required
                              aria-required="true"
                              aria-invalid={!!errors.city}
                              className={errors.city ? "border-destructive" : ""}
                            />
                            {errors.city && (
                              <p className="text-xs text-destructive mt-1" role="alert">
                                {errors.city}
                              </p>
                            )}
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
                              onBlur={() => handleBlur("zipCode")}
                              autoComplete="postal-code"
                              required
                              aria-required="true"
                              aria-invalid={!!errors.zipCode}
                              className={errors.zipCode ? "border-destructive" : ""}
                            />
                            {errors.zipCode && (
                              <p className="text-xs text-destructive mt-1" role="alert">
                                {errors.zipCode}
                              </p>
                            )}
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
                            onBlur={() => handleBlur("phone")}
                            autoComplete="tel"
                            required
                            aria-required="true"
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                            className={errors.phone ? "border-destructive" : ""}
                          />
                          {errors.phone ? (
                            <p id="phone-error" className="text-xs text-destructive mt-1" role="alert">
                              {errors.phone}
                            </p>
                          ) : (
                            <p id="phone-hint" className="text-xs text-muted-foreground mt-1">
                              Pour vous contacter concernant votre commande
                            </p>
                          )}
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
                      <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="text-foreground">
                          FCFA {(item.price * item.quantity).toFixed(2)}
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


