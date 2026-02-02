import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useMemo } from 'react'
import type { User as SupabaseUser } from "@supabase/supabase-js"

export interface Customer {
  id: string // from profiles.id
  name: string | null // from profiles.name
  email?: string // from auth.users.email (now optional)
  role: string // from profiles.role
  avatar: string | null // Placeholder, not in current schema
  status: 'active' | 'inactive' | 'banned' // Derived from role and banned_until (simplified for now)
  total_orders?: number // Requires aggregation, placeholder for now
  total_spent?: number // Requires aggregation, placeholder for now
  created_at?: string // from auth.users.created_at (now optional)
  last_order_at?: string // Requires aggregation, placeholder for now
  phone?: string // Requires aggregation from orders or schema change, placeholder for now
  address?: string // Requires aggregation from orders or schema change, placeholder for now
}

export function useCustomers(search?: string) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize la recherche pour éviter les re-fetch inutiles
  const memoizedSearch = useMemo(() => search, [search])

  useEffect(() => {
    fetchCustomers()
  }, [memoizedSearch])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      // Fetch profiles and join with auth.users for email and created_at
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          role
        `)
        .order('name', { ascending: true })
        .limit(100) // Limiter à 100 clients pour améliorer les performances
        // NOTE: The direct selection of `auth_users (email, created_at)` was causing a 400 Bad Request
        // due to missing explicit foreign key relationship and/or RLS policies in Supabase.
        // To properly fetch `email` and `created_at` from `auth.users` table:
        // 1. Ensure a foreign key constraint exists from `profiles.id` to `auth.users.id` in Supabase.
        // 2. Configure Row Level Security (RLS) policies on the `profiles` table to allow
        //    read access to related `auth.users` data.
        // 3. Once configured, you can re-enable `auth_users (email, created_at)` in the select statement
        //    and update the Customer interface and mapping accordingly.

        // .eq('role', 'customer') // Only fetch customers, adjust as needed

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      const transformedCustomers: Customer[] = data.map((profile: any) => {
        // Placeholder for aggregated data, as per analysis
        const userCreatedAt = undefined; // Temporarily undefined as auth_users is not selected
        const userEmail = undefined; // Temporarily undefined as auth_users is not selected
        // Simplified status derivation:
        // If the user has a banned_until, they are banned. Otherwise, active.
        // We are not fetching banned_until here, so we will simplify to active/inactive based on role for now.
        const derivedStatus: Customer['status'] = profile.role === 'admin' ? 'active' : 'active'; // More complex logic needed for 'banned'

        return {
          id: profile.id,
          name: profile.name,
          // email: userEmail, // Temporarily commented out
          role: profile.role,
          avatar: null, // No avatar in current schema
          status: derivedStatus, // Placeholder/Simplified
          total_orders: 0, // Placeholder, requires aggregation
          total_spent: 0, // Placeholder, requires aggregation
          // created_at: userCreatedAt, // Temporarily commented out
          last_order_at: '', // Placeholder, requires aggregation
          phone: '', // Placeholder, requires aggregation or schema change
          address: '', // Placeholder, requires aggregation or schema change
        }
      })

      setCustomers(transformedCustomers)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des clients')
    } finally {
      setLoading(false)
    }
  }

  // NOTE: toggleCustomerStatus will need significant refactoring if 'status' is derived
  // from role and banned_until. For now, it throws an error.
  const toggleCustomerStatus = async (customerId: string, currentStatus: string) => {
    // This function needs to update the profile role or a banned_until field in auth.users
    // For a simple toggle between active/inactive, you'd likely update the 'is_active' field in profiles table
    // or adjust the 'role'.
    // For 'banned', you'd set auth.users.banned_until.
    // Given the current derived 'status', this needs a more robust implementation.
    throw new Error('toggleCustomerStatus non implémenté pour les clients Supabase. Nécessite une logique pour mettre à jour les rôles ou la date de bannissement.')
  }

  return {
    customers,
    loading,
    error,
    toggleCustomerStatus, // Will throw error until implemented
    refetch: fetchCustomers,
  }
}
