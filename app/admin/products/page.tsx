"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Upload,
  Save,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useProducts, type Product } from "@/hooks/use-products"
import { toast } from "sonner"

import { useCategories, type Category } from "@/hooks/use-categories" // Import useCategories and its Category type



// Helper function to generate a unique SKU
function generateUniqueSku(): string {
  // Simple UUID generation for unique SKU. In a real app, this might involve more logic.
  return `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  // Fetch categories directly from the hook
  const { categories, loading: categoriesLoading } = useCategories() // Renamed to avoid conflict with products loading
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const { products, loading, createProduct, updateProduct, deleteProduct, refetch } = useProducts(
    selectedCategory !== "ALL" ? selectedCategory : undefined,
    searchQuery || undefined
  )

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    categoryId: "",
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as { name: string; value: string }[],
    stock: "0",
    sku: "",
    isNew: false,
    inStock: true,
  })

  // Set default category for new product form when categories are loaded
  useEffect(() => {
    if (!categoriesLoading && categories.length > 0 && !formData.categoryId && !editingProduct) {
      setFormData(prev => ({ ...prev, categoryId: categories[0]?.id || "" }));
    }
  }, [categories, categoriesLoading, formData.categoryId, editingProduct]);


  // Filter products (already filtered by API, but we can add client-side if needed)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Open dialog for new product
  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      categoryId: categories[0]?.id || "",
      images: [],
      sizes: ["S", "M", "L", "XL"],
      colors: [{ name: "Black", value: "#110A0B" }],
      stock: "0",
      sku: "",
      isNew: false,
      inStock: true,
    })
    setIsDialogOpen(true)
  }

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La taille de l\'image doit être inférieure à 5 Mo')
      return
    }

    setUploading(true)
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 300))

      // Convertir l'image en base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Image = e.target?.result as string
        setFormData({
          ...formData,
          images: [...formData.images, base64Image],
        })
        toast.success('Image ajoutée avec succès')
        setUploading(false)
      }
      reader.onerror = () => {
        toast.error('Erreur lors de la lecture de l\'image')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec du traitement de l\'image')
      setUploading(false)
    }
  }

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  // Remove image
  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  // Open dialog for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || "", // Use original_price
      description: product.description,
      categoryId: product.category_id || "", // Use category_id directly
      images: Array.isArray(product.images) 
        ? product.images 
        : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []),
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock?.toString() || "0",
      sku: product.sku || "",
      isNew: product.is_new, // Use is_new
      inStock: product.in_stock, // Use in_stock
    })
    setIsDialogOpen(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setSaving(true)
    try {
      const productData: any = { // Utilisez 'any' temporairement pour la flexibilité
        name: formData.name,
        price: parseFloat(formData.price),
        original_price: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        description: formData.description,
        category_id: formData.categoryId,
        images: formData.images.length > 0 ? formData.images : [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2080&auto=format&fit=crop",
        ],
        sizes: formData.sizes,
        colors: formData.colors,
        stock: parseInt(formData.stock) || 0,
        is_new: formData.isNew,
        in_stock: formData.inStock,
      }
      // Ajouter le SKU
      if (formData.sku) {
        productData.sku = formData.sku
      } else {
        productData.sku = generateUniqueSku(); // Générer un SKU si le champ est vide
      }

      // Log the product data before sending
      console.error("Données du produit envoyées à Supabase:", productData);

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
        toast.success("Produit mis à jour avec succès")
      } else {
        await createProduct(productData as any)
        toast.success("Produit créé avec succès")
      }
      setIsDialogOpen(false)
      refetch()
    } catch (error) {
      toast.error(error instanceof Error 
        ? (error.message.includes('409') 
            ? "Erreur : un produit avec ce SKU existe déjà. Veuillez utiliser un SKU unique." 
            : `Erreur: ${error.message}`) // Affiche le message d'erreur brut
        : `Échec de l'enregistrement du produit: ${(error as any)?.message || 'une erreur inconnue est survenue'}`
      )
    } finally {
      setSaving(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      toast.success("Produit supprimé avec succès")
      setDeleteConfirm(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec de la suppression du produit: " + (error as any)?.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produits</h1>
          <p className="text-muted-foreground">{filteredProducts.length} produit(s) trouvé(s)</p>
        </div>
        <Button onClick={handleNewProduct} className="bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0 rounded-full"
              />
            </div>

            {/* Category filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary border-0 rounded-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Catégorie
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Note
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                            </p>
                            {product.is_new && ( // Use product.is_new
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                                NOUVEAU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-sm">FCFA {product.price}</p>
                          {product.original_price && ( // Use product.original_price
                            <p className="text-xs text-muted-foreground line-through">
                              FCFA {product.original_price}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                            product.in_stock // Use product.in_stock
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {product.in_stock ? "En stock" : "Rupture de stock"}
                        </span>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-yellow-500">★</span>
                          <span className="text-xs text-muted-foreground">({product.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="rounded-full"
                            >
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-full bg-transparent"
                            >
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <a href={`/product/${product.id}`} target="_blank">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteConfirm(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
              <Button onClick={handleNewProduct} variant="link" className="mt-2">
                Ajouter votre premier produit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Product name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Entrez le nom du produit"
              />
            </div>

            {/* Price row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (FCFA)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Prix original (FCFA)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="0.00 (optionnel)"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock and SKU row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Référence unique (ex: PNT-001)"
                />
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label>Images du produit</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  dragActive
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 mx-auto text-muted-foreground mb-2 animate-spin" />
                    <p className="text-sm text-muted-foreground">Téléchargement...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Glissez-déposez des images ici, ou cliquez pour parcourir
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP jusqu'à 5 Mo
                    </p>
                  </>
                )}
              </div>

              {/* Display uploaded images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(index)
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                <Label htmlFor="isNew">Marquer comme nouveau</Label>
                <Switch
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                />
              </div>
              <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                <Label htmlFor="inStock">En stock</Label>
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 rounded-full bg-transparent"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveProduct}
                disabled={!formData.name || !formData.price || !formData.categoryId || saving}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingProduct ? "Mettre à jour" : "Ajouter le produit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
