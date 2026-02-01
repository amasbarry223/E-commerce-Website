import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { formData, cartItems, total, shipping, tax } = await request.json();

    if (!formData || !cartItems || cartItems.length === 0 || !total) {
      return NextResponse.json({ message: 'Données de commande invalides.' }, { status: 400 });
    }

    // Récupérer l'ID de l'utilisateur authentifié (si disponible)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // 1. Créer la commande principale
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.zipCode} ${formData.city}, ${formData.country}`,
        },
        total: total,
        status: 'pending', // Statut initial
        payment_status: 'pending', // Statut de paiement initial
        payment_method: 'Credit Card', // À ajuster selon les vraies méthodes
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Erreur lors de la création de la commande:', orderError);
      return NextResponse.json({ message: 'Erreur lors de la création de la commande.', error: orderError }, { status: 500 });
    }

    const orderId = orderData.id;

    // 2. Créer les articles de la commande et décrémenter le stock
    const orderItemsToInsert = cartItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      size: item.size,
      color: item.color,
      image: item.product.images?.[0] || null, // Première image du produit
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (orderItemsError) {
      console.error('Erreur lors de la création des articles de la commande:', orderItemsError);
      // Penser à annuler la commande principale ici en cas d'échec des articles
      await supabase.from('orders').delete().eq('id', orderId); // Annuler la commande
      return NextResponse.json({ message: 'Erreur lors de la création des articles de la commande.', error: orderItemsError }, { status: 500 });
    }

    // Décrémenter le stock des produits (dans une transaction si Supabase le permet, sinon séquentiellement)
    for (const item of cartItems) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();

      if (productError || !productData) {
        console.error(`Erreur lors de la récupération du stock pour le produit ${item.product.id}:`, productError);
        // Décider comment gérer cela - annuler toute la commande, ignorer, etc.
        // Pour l'instant, nous continuons mais c'est un point à améliorer.
        continue;
      }

      const newStock = productData.stock - item.quantity;
      const { error: updateStockError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product.id);

      if (updateStockError) {
        console.error(`Erreur lors de la mise à jour du stock pour le produit ${item.product.id}:`, updateStockError);
        // Décider comment gérer cela
      }
    }

    // Retourner la commande créée
    return NextResponse.json({ message: 'Commande créée avec succès!', order: orderData }, { status: 201 });

  } catch (error) {
    console.error('Erreur inattendue lors du traitement de la commande:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
