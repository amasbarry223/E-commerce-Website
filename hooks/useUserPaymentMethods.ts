import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  card_brand: string;
  last_four: string;
  expiration_month: number;
  expiration_year: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserPaymentMethods(userId: string | undefined) {
  const [paymentMethods, setPaymentMethods] = useState<UserPaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPaymentMethods = useCallback(async () => {
    if (!userId) {
      setPaymentMethods([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false }) // Default method first
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setPaymentMethods(data || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching payment methods:", err)
      setError(err.message || 'Erreur lors du chargement des moyens de paiement.')
      toast.error('Erreur lors du chargement des moyens de paiement.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const addPaymentMethod = async (newMethod: Omit<UserPaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour ajouter un moyen de paiement.")
      return null
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({ ...newMethod, user_id: userId })
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setPaymentMethods((prev) => (data.is_default ? [data, ...prev.map(pm => ({...pm, is_default: false}))] : [...prev, data]))
      toast.success("Moyen de paiement ajouté avec succès !")
      return data
    } catch (err: any) {
      console.error("Error adding payment method:", err)
      toast.error(err.message || 'Erreur lors de l\'ajout du moyen de paiement.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentMethod = async (methodId: string, updatedFields: Partial<Omit<UserPaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour modifier un moyen de paiement.")
      return null
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_payment_methods')
        .update(updatedFields)
        .eq('id', methodId)
        .eq('user_id', userId)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setPaymentMethods((prev) =>
        prev.map((pm) => {
          if (pm.id === methodId) {
            return data;
          }
          if (data.is_default && pm.is_default) {
            return { ...pm, is_default: false };
          }
          return pm;
        }).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
      )
      toast.success("Moyen de paiement mis à jour avec succès !")
      return data
    } catch (err: any) {
      console.error("Error updating payment method:", err)
      toast.error(err.message || 'Erreur lors de la mise à jour du moyen de paiement.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deletePaymentMethod = async (methodId: string) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour supprimer un moyen de paiement.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== methodId))
      toast.success("Moyen de paiement supprimé avec succès !")
    } catch (err: any) {
      console.error("Error deleting payment method:", err)
      toast.error(err.message || 'Erreur lors de la suppression du moyen de paiement.')
    } finally {
      setLoading(false)
    }
  }

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refetch: fetchPaymentMethods,
  }
}
