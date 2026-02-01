import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' // Correspond au type ENUM Supabase
  value: number
  min_purchase: number // Correspond au nom de la colonne Supabase
  max_uses: number | null // Correspond au nom de la colonne Supabase
  used_count: number // Correspond au nom de la colonne Supabase
  expires_at: string | null // Correspond au nom de la colonne Supabase
  is_active: boolean // Correspond au nom de la colonne Supabase
  created_at: string
  updated_at: string
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }
      setCoupons(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des coupons')
    } finally {
      setLoading(false)
    }
  }

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.from('coupons').insert(couponData).select().single()
      if (error) {
        throw error
      }
      setCoupons((prev) => [data, ...prev])
      toast.success('Coupon créé avec succès')
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création du coupon')
    }
  }

  const updateCoupon = async (id: string, couponData: Partial<Coupon>) => {
    try {
      const { data, error } = await supabase.from('coupons').update(couponData).eq('id', id).select().single()
      if (error) {
        throw error
      }
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      )
      toast.success('Coupon mis à jour avec succès')
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour du coupon')
    }
  }

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) {
        throw error
      }
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Coupon supprimé avec succès')
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression du coupon')
    }
  }
  return {
    coupons,
    loading,
    error,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    refetch: fetchCoupons,
  }
}

