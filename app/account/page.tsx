"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 pb-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === "login"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 pb-3 text-center font-medium border-b-2 transition-colors ${
                activeTab === "register"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Créer un compte
            </button>
          </div>

          {activeTab === "login" ? (
            <LoginForm showPassword={showPassword} setShowPassword={setShowPassword} />
          ) : (
            <RegisterForm showPassword={showPassword} setShowPassword={setShowPassword} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function LoginForm({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean
  setShowPassword: (value: boolean) => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    
    if (result.success) {
      toast.success("Connexion réussie !")
      router.push("/account/dashboard")
    } else {
      if (result.error === "Email not confirmed") {
        toast.error("Veuillez confirmer votre e-mail avant de vous connecter.");
      } else {
        toast.error(result.error || "Échec de la connexion");
      }
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Bon retour</h1>
        <p className="text-muted-foreground">
          Connectez-vous à votre compte pour continuer vos achats
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">
            E-mail <span className="text-destructive" aria-label="requis">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="votre.nom@maliapp.com"
              className="pl-10 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive" aria-label="requis">*</span>
            </Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Entrez votre mot de passe"
              className="pl-10 pr-10 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Ou continuer avec</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-full bg-transparent border-border"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full bg-transparent border-border"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </Button>
      </div>
    </form>
  )
}

function RegisterForm({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean
  setShowPassword: (value: boolean) => void
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const name = `${firstName} ${lastName}`.trim() || undefined
    const result = await register(email, password, name)
    setLoading(false)
    
    if (result.success) {
      toast.success("Compte créé avec succès !")
      router.push("/account/dashboard")
    } else {
      if (result.error?.includes("Email rate limit exceeded")) {
        toast.error("Limite d'envoi d'e-mails dépassée. Veuillez réessayer plus tard.");
      } else if (result.error?.includes("email service not configured")) {
        toast.error("Le service d'e-mail n'est pas configuré. Veuillez contacter l'administrateur.");
      } else if (result.error?.includes("Failed to send confirmation mail")) {
        toast.error("Échec de l'envoi de l'e-mail de confirmation. Vérifiez votre configuration Supabase.");
      } else {
        toast.error(result.error || "Échec de l'inscription");
      }
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Créer un compte</h1>
        <p className="text-muted-foreground">
          Rejoignez-nous pour commencer votre expérience d'achat
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              className="rounded-lg"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              className="rounded-lg"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registerEmail">
            E-mail <span className="text-destructive" aria-label="requis">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="registerEmail"
              name="email"
              type="email"
              placeholder="votre.nom@maliapp.com"
              className="pl-10 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="registerPassword">
            Mot de passe <span className="text-destructive" aria-label="requis">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="registerPassword"
              name="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Créez un mot de passe"
              className="pl-10 pr-10 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              aria-required="true"
              aria-describedby="password-requirements"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p id="password-requirements" className="text-xs text-muted-foreground">
            Doit contenir au moins 8 caractères
          </p>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Création du compte...
          </>
        ) : (
          "Créer le compte"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        En créant un compte, vous acceptez nos{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Conditions d'utilisation
        </Link>{" "}
        et notre{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Politique de confidentialité
        </Link>
      </p>
    </form>
  )
}
