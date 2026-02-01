import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  is_active: boolean // Ajout pour correspondre au schéma DB
  created_at: string
  updated_at: string
  product_count?: number // Valeur dérivée/agrégée, facultative
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (categoriesError) {
        throw categoriesError
      }

      // Initialize product_count to 0 as it's a derived value not directly from DB
      const categoriesWithProductCount = (categoriesData || []).map(cat => ({
        ...cat,
        product_count: 0 // Placeholder: actual count would require a separate query/RPC
      }));

      setCategories(categoriesWithProductCount);
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'product_count'>) => {
    try {
      const { name, slug, description, image, is_active } = categoryData; // Destructure to map
      const { data, error } = await supabase.from('categories').insert({
        name, slug, description, image, is_active
      }).select().single()
      if (error) {
        throw error
      }
      setCategories((prev) => [{ ...data, product_count: 0 }, ...prev]) // Ajouter avec product_count 0 initial
      toast.success('Catégorie créée avec succès')
      return data
    } catch (err: any) {
      console.error("Erreur lors de la création de la catégorie:", err); // Ajout d'un log
      throw new Error(err.message || 'Erreur lors de la création de la catégorie')
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      const { is_active, ...rest } = categoryData;
      const dataToUpdate: Partial<Omit<Category, 'product_count'>> = { ...rest };
      if (typeof is_active === 'boolean') {
        dataToUpdate.is_active = is_active;
      }
      
      const { data, error } = await supabase.from('categories').update(dataToUpdate).eq('id', id).select().single()
      if (error) {
        throw error
      }
      const updatedCategoryWithCount = { 
        ...data, 
        product_count: (categories.find(c => c.id === id)?.product_count || 0) 
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updatedCategoryWithCount : c))
      )
      toast.success('Catégorie mise à jour avec succès')
      return data
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour de la catégorie:", err); // Ajout d'un log
      throw new Error(err.message || 'Erreur lors de la mise à jour de la catégorie')
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) {
        throw error
      }
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Catégorie supprimée avec succès')
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la catégorie:", err); // Ajout d'un log
      throw new Error(err.message || 'Erreur lors de la suppression de la catégorie')
    }
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}

