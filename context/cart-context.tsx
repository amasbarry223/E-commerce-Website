"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "./auth-context" // Assuming auth-context is in the same directory
import { Product } from "@/hooks/use-products" // Use the Product interface from use-products hook

// Interface for a CartItem as stored/fetched from Supabase
export interface CartItem {
  id: string; // cart_item id from Supabase
  product_id: string; // product id from Supabase
  name: string; // from products table (via join)
  image: string; // from products table (main image, via join)
  price: number; // price at time of adding to cart_item
  quantity: number;
  size: string;
  color: { name: string; value: string };
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number, size: string, color: { name: string; value: string }) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void> // Operates on cart_item id
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void> // Operates on cart_item id
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([] as CartItem[])
  const [cartId, setCartId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to load the cart from Supabase
  const loadCart = useCallback(async (isMounted?: () => boolean) => {
    setLoading(true);
    if (userLoading) {
      setLoading(false);
      return; // Wait for user loading to complete
    }

    if (!user) {
      // For anonymous users, clear cart or handle from localStorage if persistence is desired
      setCartId(null);
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      // Try to get existing active cart for logged-in user
      let { data: cartData, error: fetchCartError } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // Check if component is still mounted
      if (isMounted && !isMounted()) {
        return;
      }

      if (fetchCartError && fetchCartError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        // Silently ignore AbortError - it's likely from Supabase Auth internal cleanup
        if (fetchCartError.name === 'AbortError' || fetchCartError.message?.includes('aborted')) {
          return;
        }
        console.error("Error fetching cart:", fetchCartError);
        setLoading(false);
        return;
      }

      let currentCartId = cartData?.id;

      if (!currentCartId) {
        // If no active cart, create one
        const { data: newCart, error: createCartError } = await supabase
          .from('carts')
          .insert({ user_id: user.id, status: 'active' })
          .select('id')
          .single();

        // Check if component is still mounted
        if (isMounted && !isMounted()) {
          return;
        }

        if (createCartError) {
          // Silently ignore AbortError - it's likely from Supabase Auth internal cleanup
          if (createCartError.name === 'AbortError' || createCartError.message?.includes('aborted')) {
            return;
          }
          console.error("Error creating cart:", createCartError);
          setLoading(false);
          return;
        }
        currentCartId = newCart.id;
      }
      setCartId(currentCartId);

      // Fetch cart items for the determined cartId
      const { data: cartItemsData, error: fetchItemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          price,
          size,
          color_name,
          color_value,
          products (name, images) // Join to get product name and images
        `)
        .eq('cart_id', currentCartId);

      // Check if component is still mounted
      if (isMounted && !isMounted()) {
        return;
      }

      if (fetchItemsError) {
        // Silently ignore AbortError - it's likely from Supabase Auth internal cleanup
        if (fetchItemsError.name === 'AbortError' || fetchItemsError.message?.includes('aborted')) {
          return;
        }
        console.error("Error fetching cart items:", fetchItemsError);
        setLoading(false);
        return;
      }

      const transformedItems: CartItem[] = (cartItemsData || []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.products?.name || 'Produit',
        image: item.products?.images?.[0] || '/placeholder-logo.svg', // Fallback image
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: { name: item.color_name, value: item.color_value },
      }));

      // Only update state if component is still mounted
      if (!isMounted || isMounted()) {
        setItems(transformedItems);
        setLoading(false);
      }
    } catch (error: any) {
      // Silently ignore AbortError - it's likely from Supabase Auth internal cleanup
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return;
      }
      console.error("Unexpected error in loadCart:", error);
      if (!isMounted || isMounted()) {
        setLoading(false);
      }
    }
  }, [user, userLoading]); // Depend on user and userLoading

  useEffect(() => {
    let isMounted = true;
    
    const fetchCartData = async () => {
      if (!isMounted) return;
      await loadCart(() => isMounted);
    };
    
    fetchCartData();
    
    return () => {
      isMounted = false;
    };
  }, [loadCart]);

  const addItem = useCallback(async (product: Product, quantity: number, size: string, color: { name: string; value: string }) => {
    if (!cartId || !user) {
      throw new Error("No active cart or user not logged in. Cannot add item.");
    }

    // Check if item already exists in cart with same size and color
    const existingItem = items.find(
      (item) =>
        item.product_id === product.id &&
        item.size === size &&
        item.color.name === color.name
    )

    if (existingItem) {
      // Update quantity of existing item
      const newQuantity = existingItem.quantity + quantity;
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
      
      if (error) {
        console.error("Error updating cart item quantity:", error);
        return;
      }
    } else {
      // Add new item to cart
      const { error } = await supabase.from('cart_items').insert({
        cart_id: cartId,
        product_id: product.id,
        quantity: quantity,
        price: product.price, // Store current price
        size: size,
        color_name: color.name,
        color_value: color.value,
      });

      if (error) {
        console.error("Error adding new cart item:", error);
        return;
      }
    }
    await loadCart(); // Reload cart to update state
  }, [cartId, user, items, loadCart]);

  const removeItem = useCallback(async (cartItemId: string) => {
    if (!cartId || !user) {
      console.error("No active cart or user not logged in. Cannot remove item.");
      return;
    }
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) {
      console.error("Error removing cart item:", error);
      return;
    }
    await loadCart(); // Reload cart to update state
  }, [cartId, user, loadCart]);

  const updateQuantity = useCallback(async (cartItemId: string, newQuantity: number) => {
    if (!cartId || !user) {
      console.error("No active cart or user not logged in. Cannot update quantity.");
      return;
    }

    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    const { error } = await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', cartItemId);
    if (error) {
      console.error("Error updating cart item quantity:", error);
      return;
    }
    await loadCart(); // Reload cart to update state
  }, [cartId, user, removeItem, loadCart]);

  const clearCart = useCallback(async () => {
    if (!cartId || !user) {
      console.error("No active cart or user not logged in. Cannot clear cart.");
      return;
    }
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
    if (error) {
      console.error("Error clearing cart items:", error);
      return;
    }
    await loadCart(); // Reload cart to clear state
  }, [cartId, user, loadCart]);


  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    // En mode développement, afficher un message d'erreur plus détaillé
    if (process.env.NODE_ENV === 'development') {
      console.error("useCart must be used within a CartProvider. Make sure CartProvider is wrapping your component.")
    }
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
