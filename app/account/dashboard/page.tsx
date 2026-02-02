"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { User, Package, Heart, MapPin, CreditCard, Settings, LogOut, ChevronRight, Plus, Pencil, Trash, X, Save } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useUserOrders } from "@/hooks/useUserOrders"
import { Order, OrderItem } from "@/hooks/use-orders"
import { useWishlist } from "@/hooks/useWishlist" // Added for WishlistSection
import { useUserAddresses, UserAddress } from "@/hooks/useUserAddresses" // Added for AddressesSection
import { useUserPaymentMethods, UserPaymentMethod } from "@/hooks/useUserPaymentMethods" // Added for PaymentSection
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog" // Added UI Component
import { Input } from "@/components/ui/input" // Added UI Component
import { Label } from "@/components/ui/label" // Added UI Component
import { Textarea } from "@/components/ui/textarea" // Added UI Component
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select" // Added UI Component
import { Switch } from "@/components/ui/switch" // Added UI Component
import { useToast } from "@/hooks/use-toast" // Added for toast notifications
import type { User } from "@/context/auth-context" // Import User type for better typing

const menuItems = [
  { id: "profile", label: "Mon profil", icon: User },
  { id: "orders", label: "Mes commandes", icon: Package },
  { id: "wishlist", label: "Liste de souhaits", icon: Heart },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "payment", label: "Moyens de paiement", icon: CreditCard },
  { id: "settings", label: "Paramètres", icon: Settings },
]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("orders")
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders(user?.id)

  const isLoading = authLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link href="/login">Se connecter</Link>
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'Utilisateur';
  const lastName = user.name?.split(' ').slice(1).join(' ') || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">
            Mon compte
          </h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-secondary rounded-2xl">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" // Placeholder avatar
                    alt={user.name || "User avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name || 'Utilisateur'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      activeSection === item.id
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <Link
                  href="/account"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-500 hover:bg-red-50 transition-colors"
                  onClick={async (e) => {
                    e.preventDefault();
                    await logout();
                    router.push("/login");
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Se déconnecter</span>
                </Link>
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === "profile" && (
                <ProfileSection
                  user={user}
                  firstName={firstName}
                  lastName={lastName}
                />
              )}
              {activeSection === "orders" && <OrdersSection orders={orders} error={ordersError} />}
              {activeSection === "wishlist" && <WishlistSection />}
              {activeSection === "addresses" && <AddressesSection />}
              {activeSection === "payment" && <PaymentSection />}
              {activeSection === "settings" && <SettingsSection />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}



function ProfileSection({ user, firstName, lastName }: { user: User, firstName: string, lastName: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="bg-secondary rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Informations du profil</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Prénom</label>
          <p className="font-medium text-foreground">{firstName}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Nom</label>
          <p className="font-medium text-foreground">{lastName}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">E-mail</label>
          <p className="font-medium text-foreground">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Téléphone</label>
          <p className="font-medium text-foreground">{user.phone || "Non renseigné"}</p>
        </div>
      </div>
      <Button
        className="mt-6 rounded-full bg-foreground text-background hover:bg-foreground/90"
        onClick={() => setIsFormOpen(true)}
      >
        Modifier le profil
      </Button>

      <EditProfileForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} user={user} />
    </div>
  )
}

interface EditProfileFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User; // User type from AuthContext, could be more specific
}

function EditProfileForm({ isOpen, setIsOpen, user }: EditProfileFormProps) {
  const { updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
    });
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { success, error } = await updateUserProfile(formData);
    setLoading(false);

    if (success) {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été enregistrées.",
      });
      setIsOpen(false);
    } else {
      toast({
        title: "Échec de la mise à jour",
        description: error || "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre profil ici. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom complet
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrdersSection({ orders, error }: { orders: Order[], error: string | null }) { // Use dynamic Order type
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Historique des commandes</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Vous n'avez pas encore passé de commandes.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-secondary rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold text-foreground">{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    order.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : order.status === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {
                    order.status === "pending" ? "En attente" :
                    order.status === "processing" ? "En traitement" :
                    order.status === "shipped" ? "Expédiée" :
                    order.status === "completed" ? "Livré" :
                    order.status === "cancelled" ? "Annulée" : order.status
                  }
                </span>
                <span className="font-semibold text-foreground">FCFA {order.total}</span>
              </div>
            </div>
            <div className="space-y-3">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.product_name || "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Taille : {item.size} | Couleur : {item.color}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">FCFA {item.price} x {item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent border-border text-foreground"
              >
                Voir les détails
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ))
      )}
      {error && (
        <p className="text-red-500">Erreur de chargement des commandes : {error}</p>
      )}
    </div>
  )
}

function WishlistSection() {
  const { user, loading: authLoading } = useAuth();
  const { wishlist, loading: wishlistLoading, error, removeFromWishlist } = useWishlist(user?.id);

  const isLoading = authLoading || wishlistLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Chargement de la liste de souhaits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erreur lors du chargement de la liste de souhaits : {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Ma liste de souhaits</h2>
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-secondary rounded-2xl p-6">
          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Votre liste de souhaits est vide
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Commencez à ajouter des articles que vous aimez en cliquant sur l&apos;icône cœur sur les produits !
          </p>
          <Link href="/shop">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 group"
            >
              Parcourir les produits
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <div key={item.product.id} className="bg-secondary rounded-2xl p-4 flex items-center gap-4 group">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.id}`}>
                  <h3 className="font-medium text-foreground truncate hover:text-accent transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">FCFA {item.product.price}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromWishlist(item.product.id)}
                className="text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



function AddressesSection() {
  const { user, loading: authLoading } = useAuth();
  const { addresses, loading: addressesLoading, error, addAddress, updateAddress, deleteAddress } = useUserAddresses(user?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleEdit = (address: UserAddress) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (addressId: string) => {
    setAddressToDelete(addressId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (addressToDelete) {
      await deleteAddress(addressToDelete);
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
    await updateAddress(address.id, { is_default: true });
  };

  const isLoading = authLoading || addressesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Chargement des adresses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erreur lors du chargement des adresses : {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Adresses enregistrées</h2>
      {addresses.length === 0 ? (
        <div className="bg-secondary rounded-2xl p-6 text-center">
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'adresses enregistrées.</p>
          <Button
            onClick={() => {
              setEditingAddress(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="rounded-full bg-transparent border-border text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une nouvelle adresse
          </Button>
        </div>
      ) : (
        <>
          {addresses.map((address) => (
            <div key={address.id} className="bg-secondary rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {address.address_line1} {address.address_line2}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.city}, {address.state_province ? `${address.state_province}, ` : ''}{address.postal_code}<br />
                    {address.country}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {address.is_default && (
                    <span className="px-2 py-1 bg-foreground text-background text-xs font-medium rounded">
                      Par défaut
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(address)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(address.id)}>
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              {!address.is_default && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-transparent border-border text-foreground"
                    onClick={() => handleSetDefault(address)}
                  >
                    Définir par défaut
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button
            onClick={() => {
              setEditingAddress(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="rounded-full bg-transparent border-border text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une nouvelle adresse
          </Button>
        </>
      )}

      <AddressForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        address={editingAddress}
        addAddress={addAddress}
        updateAddress={updateAddress}
        userId={user?.id}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface AddressFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address: UserAddress | null;
  addAddress: (newAddress: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<UserAddress | null>;
  updateAddress: (addressId: string, updatedFields: Partial<Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<UserAddress | null>;
  userId: string | undefined;
}

function AddressForm({ isOpen, setIsOpen, address, addAddress, updateAddress, userId }: AddressFormProps) {
  const [formData, setFormData] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        city: address.city,
        state_province: address.state_province || '',
        postal_code: address.postal_code || '',
        country: address.country,
        is_default: address.is_default,
      });
    } else {
      setFormData({
        address_line1: '',
        address_line2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        is_default: false,
      });
    }
  }, [address, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_default: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    const payload = {
      address_line1: formData.address_line1,
      address_line2: formData.address_line2 || null,
      city: formData.city,
      state_province: formData.state_province || null,
      postal_code: formData.postal_code || null,
      country: formData.country,
      is_default: formData.is_default,
    };

    if (address) {
      await updateAddress(address.id, payload);
    } else {
      await addAddress(payload);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{address ? "Modifier l'adresse" : "Ajouter une nouvelle adresse"}</DialogTitle>
          <DialogDescription>
            {address ? "Mettez à jour les détails de votre adresse." : "Ajoutez une nouvelle adresse pour des livraisons plus rapides."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address_line1" className="text-right">
              Adresse 1
            </Label>
            <Input
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address_line2" className="text-right">
              Adresse 2 (Opt.)
            </Label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              Ville
            </Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state_province" className="text-right">
              Province/État
            </Label>
            <Input
              id="state_province"
              name="state_province"
              value={formData.state_province}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="postal_code" className="text-right">
              Code postal
            </Label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="country" className="text-right">
              Pays
            </Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>
          <div className="flex items-center gap-2 col-span-4 justify-end">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <Label htmlFor="is_default" className="!text-sm">
              Définir comme adresse par défaut
            </Label>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}

function ConfirmDeleteDialog({ isOpen, setIsOpen, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm}>Supprimer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



function PaymentSection() {
  const { user, loading: authLoading } = useAuth();
  const { paymentMethods, loading: paymentMethodsLoading, error, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useUserPaymentMethods(user?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<UserPaymentMethod | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  const handleEdit = (method: UserPaymentMethod) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (methodId: string) => {
    setMethodToDelete(methodId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (methodToDelete) {
      await deletePaymentMethod(methodToDelete);
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    }
  };

  const handleSetDefault = async (method: UserPaymentMethod) => {
    await updatePaymentMethod(method.id, { is_default: true });
  };

  const isLoading = authLoading || paymentMethodsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Chargement des moyens de paiement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Erreur lors du chargement des moyens de paiement : {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Moyens de paiement</h2>
      {paymentMethods.length === 0 ? (
        <div className="bg-secondary rounded-2xl p-6 text-center">
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore de moyens de paiement enregistrés.</p>
          <Button
            onClick={() => {
              setEditingMethod(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="rounded-full bg-transparent border-border text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un moyen de paiement
          </Button>
        </div>
      ) : (
        <>
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-secondary rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-2 bg-background rounded text-sm font-medium text-foreground">
                    {method.card_brand}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">**** **** **** {method.last_four}</p>
                    <p className="text-sm text-muted-foreground">Expire le {method.expiration_month < 10 ? '0' + method.expiration_month : method.expiration_month}/{method.expiration_year % 100}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {method.is_default && (
                    <span className="px-2 py-1 bg-foreground text-background text-xs font-medium rounded">
                      Par défaut
                    </span>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(method.id)}>
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
              {!method.is_default && (
                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-transparent border-border text-foreground"
                    onClick={() => handleSetDefault(method)}
                  >
                    Définir par défaut
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button
            onClick={() => {
              setEditingMethod(null);
              setIsFormOpen(true);
            }}
            variant="outline"
            className="rounded-full bg-transparent border-border text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un moyen de paiement
          </Button>
        </>
      )}

      <PaymentMethodForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        paymentMethod={editingMethod}
        addPaymentMethod={addPaymentMethod}
        updatePaymentMethod={updatePaymentMethod}
        userId={user?.id}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface PaymentMethodFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  paymentMethod: UserPaymentMethod | null;
  addPaymentMethod: (newMethod: Omit<UserPaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<UserPaymentMethod | null>;
  updatePaymentMethod: (methodId: string, updatedFields: Partial<Omit<UserPaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<UserPaymentMethod | null>;
  userId: string | undefined;
}

function PaymentMethodForm({ isOpen, setIsOpen, paymentMethod, addPaymentMethod, updatePaymentMethod, userId }: PaymentMethodFormProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    card_brand: '',
    last_four: '',
    expiration_month: 1,
    expiration_year: currentYear,
    is_default: false,
  });

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        card_brand: paymentMethod.card_brand,
        last_four: paymentMethod.last_four,
        expiration_month: paymentMethod.expiration_month,
        expiration_year: paymentMethod.expiration_year,
        is_default: paymentMethod.is_default,
      });
    } else {
      setFormData({
        card_brand: '',
        last_four: '',
        expiration_month: 1,
        expiration_year: currentYear,
        is_default: false,
      });
    }
  }, [paymentMethod, isOpen, currentYear]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: name.includes('year') || name.includes('month') ? parseInt(value) : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, is_default: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Utilisateur non authentifié.");
      return;
    }

    const payload = {
      card_brand: formData.card_brand,
      last_four: formData.last_four,
      expiration_month: formData.expiration_month,
      expiration_year: formData.expiration_year,
      is_default: formData.is_default,
    };

    if (paymentMethod) {
      await updatePaymentMethod(paymentMethod.id, payload);
    } else {
      await addPaymentMethod(payload);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{paymentMethod ? "Modifier le moyen de paiement" : "Ajouter un nouveau moyen de paiement"}</DialogTitle>
          <DialogDescription>
            {paymentMethod ? "Mettez à jour les détails de votre moyen de paiement." : "Ajoutez un nouveau moyen de paiement."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="card_brand" className="text-right">
              Marque
            </Label>
            <Select onValueChange={(value) => handleSelectChange('card_brand', value)} value={formData.card_brand}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner une marque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="American Express">American Express</SelectItem>
                <SelectItem value="Discover">Discover</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="last_four" className="text-right">
              4 derniers chiffres
            </Label>
            <Input
              id="last_four"
              name="last_four"
              value={formData.last_four}
              onChange={handleChange}
              maxLength={4}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiration_month" className="text-right">
              Expiration
            </Label>
            <div className="col-span-3 flex gap-2">
              <Select onValueChange={(value) => handleSelectChange('expiration_month', value)} value={formData.expiration_month.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Mois" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month.toString()}>{month < 10 ? '0' + month : month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => handleSelectChange('expiration_year', value)} value={formData.expiration_year.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Année" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-4 justify-end">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <Label htmlFor="is_default" className="!text-sm">
              Définir comme moyen de paiement par défaut
            </Label>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



function SettingsSection() {
  const { user, loading, updateEmailNotifications, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleEmailNotificationsToggle = async (checked: boolean) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non authentifié.",
        variant: "destructive",
      });
      return;
    }
    const { success, error } = await updateEmailNotifications(checked);
    if (success) {
      toast({
        title: "Mises à jour enregistrées",
        description: "Vos préférences de notification ont été mises à jour.",
      });
    } else {
      toast({
        title: "Échec de la mise à jour",
        description: error || "Une erreur est survenue lors de la mise à jour des préférences de notification.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      // Pour une suppression réelle, vous devriez appeler une fonction dans Supabase
      // qui gère la suppression de l'utilisateur de `auth.users` et des tables `profiles`, etc.
      // Par exemple:
      // const { error: deleteError } = await supabase.rpc('delete_user_and_data');
      // Actuellement, Supabase ne fournit pas d'API client pour supprimer un user authentifié par lui-même.
      // Une solution consisterait à avoir une fonction Edge ou un rôle admin qui effectue la suppression.
      // Pour cette démo, nous allons simuler la déconnexion et un message.

      // Option 1: Simuler la suppression et juste déconnecter l'utilisateur
      await logout();
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès (simulation).",
      });
      router.push("/"); // Rediriger vers la page d'accueil ou de connexion
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      toast({
        title: "Échec de la suppression",
        description: "Une erreur est survenue lors de la suppression de votre compte.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Paramètres du compte</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Notifications par e-mail</p>
            <p className="text-sm text-muted-foreground">Recevoir des mises à jour sur les commandes et promotions</p>
          </div>
          <Switch
            checked={user?.email_notifications_enabled ?? true} // Valeur par défaut si user est null ou champ non défini
            onCheckedChange={handleEmailNotificationsToggle}
            disabled={!user}
          />
        </div>
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Authentification à deux facteurs</p>
            <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Configurer
          </Button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-foreground">Supprimer le compte</p>
            <p className="text-sm text-muted-foreground">Supprimer définitivement votre compte et vos données</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-red-500 border-red-200 bg-transparent hover:bg-red-50"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeletingAccount}
          >
            Supprimer
          </Button>
        </div>
      </div>

      <ConfirmDeleteAccountDialog
        isOpen={isDeleteConfirmOpen}
        setIsOpen={setIsDeleteConfirmOpen}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  )
}

interface ConfirmDeleteAccountDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

function ConfirmDeleteAccountDialog({ isOpen, setIsOpen, onConfirm, isDeleting }: ConfirmDeleteAccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression du compte</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Toutes vos données seront perdues et cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Suppression..." : "Supprimer mon compte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
