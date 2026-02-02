import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export interface UserAddress {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserAddresses(userId: string | undefined) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!userId) {
      setAddresses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false }) // Default address first
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setAddresses(data || [])
      setError(null)
    } catch (err: any) {
      console.error("Error fetching user addresses:", err)
      setError(err.message || 'Erreur lors du chargement des adresses.')
      toast.error('Erreur lors du chargement des adresses.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const addAddress = async (newAddress: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour ajouter une adresse.")
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({ ...newAddress, user_id: userId })
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setAddresses((prev) => (data.is_default ? [data, ...prev.map(a => ({...a, is_default: false}))] : [...prev, data]))
      toast.success("Adresse ajoutée avec succès !")
      return data
    } catch (err: any) {
      console.error("Error adding address:", err)
      toast.error(err.message || 'Erreur lors de l\'ajout de l\'adresse.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateAddress = async (addressId: string, updatedFields: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour modifier une adresse.")
      return null
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .update(updatedFields)
        .eq('id', addressId)
        .eq('user_id', userId)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      setAddresses((prev) =>
        prev.map((addr) => {
          if (addr.id === addressId) {
            return data;
          }
          // If the updated address is now default, ensure others are not
          if (data.is_default && addr.is_default) {
            return { ...addr, is_default: false };
          }
          return addr;
        }).sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)) // Keep default first
      )
      toast.success("Adresse mise à jour avec succès !")
      return data
    } catch (err: any) {
      console.error("Error updating address:", err)
      toast.error(err.message || 'Erreur lors de la mise à jour de l\'adresse.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteAddress = async (addressId: string) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour supprimer une adresse.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId))
      toast.success("Adresse supprimée avec succès !")
    } catch (err: any) {
      console.error("Error deleting address:", err)
      toast.error(err.message || 'Erreur lors de la suppression de l\'adresse.')
    } finally {
      setLoading(false)
    }
  }

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    refetch: fetchAddresses,
  }
}
