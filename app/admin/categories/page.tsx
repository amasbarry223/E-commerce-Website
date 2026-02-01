"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  Save,
  Loader2,
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useCategories, type Category } from "@/hooks/use-categories"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { categories, loading, createCategory, updateCategory, deleteCategory, refetch } = useCategories()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
  })

  // Filter categories
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Open dialog for new category
  const handleNewCategory = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      slug: "",
      description: "",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  // Open dialog for editing
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      is_active: category.is_active, // Use is_active
    })
    setIsDialogOpen(true)
  }

  // Save category
  const handleSaveCategory = async () => {
    if (!formData.name || !formData.slug) {
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          is_active: formData.is_active, // Use is_active
        })
      } else {
        await createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          image: null,
          is_active: formData.is_active, // Use is_active
        })
      }
      setIsDialogOpen(false)
      refetch()
    } catch (error: any) { // Catch error and display toast
      toast.error(error.message || "Échec de l'enregistrement de la catégorie")
    } finally {
      setSaving(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      setDeleteConfirm(null)
      refetch()
    } catch (error: any) { // Catch error and display toast
      toast.error(error.message || "Échec de la suppression de la catégorie")
    }
  }

  // Toggle category status
  const toggleCategoryStatus = async (id: string) => {
    const category = categories.find((c) => c.id === id)
    if (category) {
      try {
        await updateCategory(id, { is_active: !category.is_active }) // Use is_active
        refetch()
      } catch (error: any) { // Catch error and display toast
        toast.error(error.message || "Échec de la mise à jour du statut de la catégorie")
      }
    }
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catégories</h1>
          <p className="text-muted-foreground">{categories.length} catégorie(s)</p>
        </div>
        <Button
          onClick={handleNewCategory}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des catégories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0 rounded-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "border-0 shadow-sm overflow-hidden group",
              !category.is_active && "opacity-60" // Use is_active
            )}
          >
            <div className="relative h-40">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold text-white">{category.name}</h3>
                <p className="text-sm text-white/80">{category.product_count || 0} produit(s)</p>
              </div>
              {!category.is_active && ( // Use is_active
                <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  Inactif
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Actif</span>
                  <Switch
                    checked={category.is_active} // Use is_active
                    onCheckedChange={() => toggleCategoryStatus(category.id)}
                  />
                </div>
                {deleteConfirm === category.id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="rounded-full h-8"
                    >
                      Confirmer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-full h-8 bg-transparent"
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
                      <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteConfirm(category.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune catégorie trouvée</p>
          <Button onClick={handleNewCategory} variant="link" className="mt-2">
            Ajouter votre première catégorie
          </Button>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Ajouter une nouvelle catégorie"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la catégorie</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }}
                placeholder="Entrez le nom de la catégorie"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Entrez la description de la catégorie"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Actif</Label>
              <Switch
                id="is_active" // Use is_active for ID
                checked={formData.is_active} // Use is_active
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} // Use is_active
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 rounded-full bg-transparent"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSaveCategory}
                disabled={!formData.name || !formData.slug || saving}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingCategory ? "Mettre à jour" : "Ajouter la catégorie"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
