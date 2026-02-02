import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Product } from '@/lib/products' // Import de l'interface Product

// Type pour un élément de la liste de souhaits tel qu'il est stocké dans Supabase
export interface WishlistItemDB {
  id: string; // ID de l'entrée dans la table wishlist_items
  user_id: string;
  product_id: number;
  created_at: string;
}

// Type pour un élément de la liste de souhaits avec les détails du produit
export interface WishlistItem extends WishlistItemDB {
  product: Product; // Détails complets du produit
}

export function useWishlist(userId: string | undefined) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            originalPrice,
            description,
            images,
            category,
            sizes,
            colors,
            isNew,
            inStock,
            rating,
            reviews
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Filtrer les entrées sans produit associé (si une jointure échoue ou le produit est supprimé)
      const validWishlist: WishlistItem[] = data
        .filter((item: any) => item.products !== null)
        .map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          created_at: item.created_at,
          product: item.products,
        }))

      setWishlist(validWishlist)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching wishlist:", err)
      setError(err.message || 'Erreur lors du chargement de la liste de souhaits.')
      toast.error('Erreur lors du chargement de la liste de souhaits.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const addToWishlist = async (productId: number) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour ajouter des articles à la liste de souhaits.")
      return
    }
    setLoading(true)
    try {
      // Vérifier si l'article est déjà dans la liste de souhaits
      const { data: existingItem, error: checkError } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 signifie "No rows found"
        throw checkError
      }

      if (existingItem) {
        toast.info("Cet article est déjà dans votre liste de souhaits.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, product_id: productId })
        .select(`
          id,
          user_id,
          product_id,
          created_at,
          products (
            id,
            name,
            price,
            originalPrice,
            description,
            images,
            category,
            sizes,
            colors,
            isNew,
            inStock,
            rating,
            reviews
          )
        `)
        .single()

      if (error) {
        throw error
      }

      const newItem: WishlistItem = {
        id: data.id,
        user_id: data.user_id,
        product_id: data.product_id,
        created_at: data.created_at,
        product: data.products,
      }

      setWishlist((prev) => [newItem, ...prev])
      toast.success("Article ajouté à la liste de souhaits !")
    } catch (err: any) {
      console.error("Error adding to wishlist:", err)
      toast.error(err.message || 'Erreur lors de l\'ajout à la liste de souhaits.')
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: number) => {
    if (!userId) {
      toast.error("Vous devez être connecté pour gérer votre liste de souhaits.")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)

      if (error) {
        throw error
      }

      setWishlist((prev) => prev.filter((item) => item.product_id !== productId))
      toast.success("Article retiré de la liste de souhaits.")
    } catch (err: any) {
      console.error("Error removing from wishlist:", err)
      toast.error(err.message || 'Erreur lors du retrait de la liste de souhaits.')
    } finally {
      setLoading(false)
    }
  }
  
  const isInWishlist = useCallback((productId: number) => {
    return wishlist.some(item => item.product.id === productId);
  }, [wishlist]);

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refetch: fetchWishlist,
  }
}
