"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Combinaison de l'utilisateur Supabase Auth et de notre table de profils
export interface User extends SupabaseUser {
  role: string
  name: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      setLoading(true)
      // Récupère la session côté serveur (important pour le rendu initial)
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', session.user.id)
          .single()

        setUser({
          ...session.user,
          role: profile?.role || 'customer',
          name: profile?.name || session.user.user_metadata.name || null
        })
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', session.user.id)
            .single()

          setUser({
            ...session.user,
            role: profile?.role || 'customer',
            name: profile?.name || session.user.user_metadata.name || null
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error("Erreur lors de la connexion:", error); // Ajout d'un log
      return { success: false, error: error.message }
    }
    return { success: true }
  }

  const register = async (email: string, password: string, name?: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    })

    if (authError) {
      console.error("Erreur lors de l'inscription de l'utilisateur:", authError); // Ajout d'un log
      return { success: false, error: authError.message }
    }
    if (!authData.user) {
        return { success: false, error: "L'utilisateur n'a pas été créé." }
    }

    // Créer un profil pour le nouvel utilisateur
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name: name || null,
      role: 'customer' // Rôle par défaut
    })

    if (profileError) {
        // Idéalement, il faudrait supprimer l'utilisateur authentifié si le profil échoue
        console.error("Erreur lors de la création du profil:", profileError)
        return { success: false, error: "Erreur lors de la création du profil utilisateur." }
    }

    return { success: true }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

