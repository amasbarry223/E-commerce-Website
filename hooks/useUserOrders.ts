import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Order, OrderItem } from './use-orders' // Réutiliser les types existants

export function useUserOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setOrders([])
      return
    }

    const fetchUserOrders = async () => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(`
            id,
            user_id,
            customer_details,
            total,
            status,
            payment_status,
            payment_method,
            tracking_number,
            created_at,
            updated_at,
            order_items (
              id,
              product_id,
              quantity,
              price,
              size,
              color,
              image,
              products (name)
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        const transformedOrders: Order[] = data.map((order: any) => ({
          ...order,
          order_items: (order.order_items || []).map((item: any) => ({
            ...item,
            product_name: item.products?.name || item.product_name
          }))
        }));

        setOrders(transformedOrders)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching user orders:", err)
        setError(err.message || 'Erreur lors du chargement de vos commandes.')
        toast.error('Erreur lors du chargement de vos commandes.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserOrders()
  }, [userId])

  return {
    orders,
    loading,
    error,
    refetch: () => { /* re-fetch logic if needed, or simply pass userId dependency to useEffect */ }
  }
}
