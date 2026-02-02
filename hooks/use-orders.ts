import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
  product_name?: string; // Derived from product_id join
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface Order {
  id: string
  user_id: string;
  customer_details: CustomerDetails; // JSONB field
  total: number
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string
  tracking_number?: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]; // Nested relation
}

export function useOrders(statusFilter?: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // Optimisation : sélectionner seulement les champs nécessaires
      let query = supabase
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
        .order('created_at', { ascending: false })
        .limit(100) // Limiter à 100 commandes pour améliorer les performances

      if (statusFilter && statusFilter !== 'ALL') {
        query = query.eq('status', statusFilter)
      }

      const { data, error: fetchError } = await query

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
      setError(err.message || 'Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => {
    try {
      const updateData: { status: OrderStatus; tracking_number?: string; updated_at: string } = {
        status: newStatus,
        updated_at: new Date().toISOString(), // Supabase might handle this via trigger, but explicit is safer
      }
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select(`
          *,
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
        .single()
      
      if (error) {
        throw error
      }

      const transformedUpdatedOrder: Order = {
        ...data,
        order_items: (data.order_items || []).map((item: any) => ({
          ...item,
          product_name: item.products?.name || item.product_name
        }))
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? transformedUpdatedOrder : o))
      )
      toast.success('Commande mise à jour avec succès')
      return transformedUpdatedOrder
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour de la commande')
      throw err
    }
  }

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}

