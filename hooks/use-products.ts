"use client"

import { supabase } from '@/lib/supabaseClient' // Import Supabase client
import { useState, useEffect, useMemo } from 'react'

export interface Product {
  id: string
  name: string
  price: number
  original_price?: number // Renommé pour correspondre à Supabase
  description: string
  images: string[]
  category_id: string // Renommé pour correspondre à Supabase
  sizes: string[]
  colors: { name: string; value: string }[]
  is_new: boolean // Renommé pour correspondre à Supabase
  in_stock: boolean // Renommé pour correspondre à Supabase
  rating: number
  reviews: number
  stock: number
  sku: string
  created_at: string // Ajouté pour correspondre à Supabase
  updated_at: string // Ajouté pour correspondre à Supabase
}

export function useProducts(category?: string, search?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize les dépendances pour éviter les re-fetch inutiles
  const memoizedCategory = useMemo(() => category, [category])
  const memoizedSearch = useMemo(() => search, [search])

  useEffect(() => {
    fetchProducts()
  }, [memoizedCategory, memoizedSearch])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Optimisation : sélectionner seulement les champs nécessaires
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          description,
          images,
          category_id,
          sizes,
          colors,
          is_new,
          in_stock,
          stock,
          sku,
          rating,
          reviews,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(200) // Limiter à 200 produits pour améliorer les performances

      if (category && category !== 'ALL') {
        query = query.eq('category_id', category)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) {
        throw error
      }
      setProducts(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase.from('products').insert(productData).select().single()
      if (error) {
        throw error
      }
      setProducts((prev) => [data, ...prev])
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la création du produit')
    }
  }

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase.from('products').update(productData).eq('id', id).select().single()
      if (error) {
        throw error
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      )
      return data
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la mise à jour du produit')
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        throw error
      }
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      throw new Error(err.message || 'Erreur lors de la suppression du produit')
    }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  }
}

