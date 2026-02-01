import { supabase } from '@/lib/supabaseClient'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ShopPageClient } from "./ShopPageClient"

// Définition des types pour les données de Supabase
// Il serait préférable de les générer automatiquement depuis la base de données
// Removed type Product and type Category as they are not directly used in this scope anymore or can be inferred.

export const revalidate = 60

interface ShopPageProps {
  searchParams: Promise<{ category?: string, sortBy?: string }>
}

export default async function ShopPage({ searchParams: searchParamsPromise }: ShopPageProps) {
  const searchParams = await searchParamsPromise;

  // 1. Récupérer toutes les catégories pour les filtres de l'UI
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)

  if (categoriesError) {
    console.error("Erreur de chargement des catégories:", categoriesError)
  }

  // 2. Construire la requête pour les produits
  let productQuery = supabase
    .from('products')
    .select('*, categories(name)') // Join with categories to filter by name

  // Filtrer par catégorie
  const category = searchParams.category;
  if (category && category !== "ALL") { // "ALL" is a convention used by the client component
    productQuery = productQuery.eq('categories.name', category); // Filter by category name
  }

  // Trier les produits
  const sortBy = searchParams.sortBy || 'created_at.desc';
  const [sortField, sortOrder] = sortBy.split('.');
  if (sortField && sortOrder) {
    productQuery = productQuery.order(sortField, { ascending: sortOrder === 'asc' });
  }

  // Exécuter la requête pour les produits
  const { data: products, error: productsError } = await productQuery

  if (productsError) {
    console.error("Erreur de chargement des produits:", productsError)
    // Gérer l'erreur
  }

  // 3. Rendre le composant client avec les données récupérées
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <ShopPageClient
          initialProducts={products || []}
          categories={categories || []}
        />
      </main>
      <Footer />
    </div>
  )
}
