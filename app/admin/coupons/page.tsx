"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Check,
  Ticket,
  Save,
  Calendar,
  Percent,
  DollarSign,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { useCoupons, type Coupon } from "@/hooks/use-coupons"

// Mock coupons data (fallback)
const initialCoupons = [
  {
    id: 1,
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minPurchase: 50,
    maxUses: 100,
    usedCount: 45,
    expiresAt: "2024-08-31",
    isActive: true,
  },
  {
    id: 2,
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minPurchase: 0,
    maxUses: null,
    usedCount: 234,
    expiresAt: null,
    isActive: true,
  },
  {
    id: 3,
    code: "FREESHIP",
    type: "fixed",
    value: 9.99,
    minPurchase: 75,
    maxUses: 50,
    usedCount: 50,
    expiresAt: "2024-06-30",
    isActive: false,
  },
  {
    id: 4,
    code: "VIP30",
    type: "percentage",
    value: 30,
    minPurchase: 100,
    maxUses: 20,
    usedCount: 8,
    expiresAt: "2024-12-31",
    isActive: true,
  },
  {
    id: 5,
    code: "FLASH50",
    type: "fixed",
    value: 50,
    minPurchase: 200,
    maxUses: 10,
    usedCount: 10,
    expiresAt: "2024-01-15",
    isActive: false,
  },
]

type Coupon = (typeof initialCoupons)[0]

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { coupons, loading, createCoupon, updateCoupon, deleteCoupon, refetch } = useCoupons()

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  })

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Open dialog for new coupon
  const handleNewCoupon = () => {
    setEditingCoupon(null)
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      maxUses: "",
      expiresAt: "",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  // Open dialog for editing
  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    const expiresAt = coupon.expiresAt 
      ? new Date(coupon.expiresAt).toISOString().split('T')[0]
      : ""
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt,
      isActive: coupon.isActive,
    })
    setIsDialogOpen(true)
  }

  // Save coupon
  const handleSaveCoupon = async () => {
    if (!formData.code || !formData.value) {
      return
    }

    setSaving(true)
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        type: formData.type as 'percentage' | 'fixed',
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, couponData)
      } else {
        await createCoupon(couponData as any)
      }
      setIsDialogOpen(false)
      refetch()
    } catch (error) {
      // Error handled in hook
    } finally {
      setSaving(false)
    }
  }

  // Delete coupon
  const handleDeleteCoupon = async (id: string) => {
    try {
      await deleteCoupon(id)
      setDeleteConfirm(null)
      refetch()
    } catch (error) {
      // Error handled in hook
    }
  }

  // Copy code to clipboard
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sans expiration"
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Date invalide"
    }
  }

  // Check if coupon is expired
  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiresAt) return false
    try {
      return new Date(coupon.expiresAt) < new Date()
    } catch {
      return false
    }
  }

  // Check if coupon is fully used
  const isFullyUsed = (coupon: Coupon) => {
    if (!coupon.maxUses) return false
    return coupon.usedCount >= coupon.maxUses
  }

  // Stats
  const stats = [
    { label: "Total des coupons", value: coupons.length },
    { label: "Actifs", value: coupons.filter((c) => c.isActive && !isExpired(c) && !isFullyUsed(c)).length },
    { label: "Total utilisés", value: coupons.reduce((acc, c) => acc + c.usedCount, 0) },
    { label: "Expirés", value: coupons.filter((c) => isExpired(c)).length },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Gérez les codes de réduction et promotions</p>
        </div>
        <Button
          onClick={handleNewCoupon}
          className="bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un coupon
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0 rounded-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons table */}
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
                      Code
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Réduction
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Utilisation
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                      Expiration
                    </th>
                    <th className="text-left py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right py-4 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon)
                  const fullyUsed = isFullyUsed(coupon)
                  return (
                    <tr
                      key={coupon.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-secondary rounded text-sm font-mono font-medium">
                            {coupon.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyCode(coupon.code)}
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {coupon.type === "percentage" ? (
                            <>
                              <Percent className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{coupon.value}% de réduction</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">FCFA {coupon.value} de réduction</span>
                            </>
                          )}
                        </div>
                        {coupon.minPurchase > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Min. FCFA {coupon.minPurchase} d&apos;achat
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="text-sm">
                          {coupon.usedCount} / {coupon.maxUses || "∞"}
                        </div>
                        {coupon.maxUses && (
                          <div className="w-20 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{
                                width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className={expired ? "text-red-600" : ""}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                            expired || fullyUsed
                              ? "bg-red-100 text-red-700"
                              : coupon.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {expired
                            ? "Expiré"
                            : fullyUsed
                              ? "Épuisé"
                              : coupon.isActive
                                ? "Actif"
                                : "Inactif"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {deleteConfirm === coupon.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCoupon(coupon.id)}
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
                              <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyCode(coupon.code)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copier le code
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteConfirm(coupon.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredCoupons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun coupon trouvé</p>
              <Button onClick={handleNewCoupon} variant="link" className="mt-2">
                Créer votre premier coupon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Modifier le coupon" : "Créer un nouveau coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code du coupon</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="SUMMER25"
                className="uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de réduction</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valeur</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "percentage" ? "25" : "10.00"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPurchase">Achat min. (FCFA)</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxUses">Utilisations max.</Label>
                <Input
                  id="maxUses"
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="Illimité"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Date d'expiration</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({ ...formData, expiresAt: value ? new Date(value).toISOString() : "" })
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Actif</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
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
                onClick={handleSaveCoupon}
                disabled={!formData.code || !formData.value || saving}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90 rounded-full gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingCoupon ? "Mettre à jour" : "Créer le coupon"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
