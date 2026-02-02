-- Script SQL pour corriger les politiques RLS manquantes
-- À exécuter dans l'éditeur SQL de votre projet Supabase

-- ---------------------------------------------------------
-- POLITIQUES RLS MANQUANTES POUR LA TABLE orders
-- ---------------------------------------------------------

-- Permettre aux utilisateurs authentifiés de créer leurs propres commandes
CREATE POLICY "Users can insert their own orders."
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres commandes (si nécessaire)
CREATE POLICY "Users can update their own orders."
ON public.orders FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------
-- POLITIQUES RLS MANQUANTES POUR LA TABLE order_items
-- ---------------------------------------------------------

-- Permettre aux utilisateurs d'insérer des articles dans leurs propres commandes
CREATE POLICY "Users can insert items in their own orders."
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Permettre aux utilisateurs de mettre à jour les articles de leurs propres commandes
CREATE POLICY "Users can update items in their own orders."
ON public.order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- ---------------------------------------------------------
-- POLITIQUES RLS MANQUANTES POUR LA TABLE carts (si nécessaire)
-- ---------------------------------------------------------

-- Permettre aux utilisateurs de créer leurs propres paniers
CREATE POLICY "Users can insert their own carts."
ON public.carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de mettre à jour leurs propres paniers
CREATE POLICY "Users can update their own carts."
ON public.carts FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permettre aux utilisateurs de supprimer leurs propres paniers
CREATE POLICY "Users can delete their own carts."
ON public.carts FOR DELETE
USING (auth.uid() = user_id);

-- ---------------------------------------------------------
-- POLITIQUES RLS MANQUANTES POUR LA TABLE cart_items
-- ---------------------------------------------------------

-- Permettre aux utilisateurs d'insérer des articles dans leurs propres paniers
CREATE POLICY "Users can insert items in their own carts."
ON public.cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  )
);

-- Permettre aux utilisateurs de mettre à jour les articles de leurs propres paniers
CREATE POLICY "Users can update items in their own carts."
ON public.cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  )
);

-- Permettre aux utilisateurs de supprimer les articles de leurs propres paniers
CREATE POLICY "Users can delete items from their own carts."
ON public.cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.carts
    WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
  )
);
