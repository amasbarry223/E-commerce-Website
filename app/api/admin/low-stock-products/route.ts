import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  try {
    // 1. Fetch lowStockThreshold from store_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('store_settings')
      .select('notification_settings')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('Error fetching store settings:', settingsError);
      return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }

    const lowStockThreshold = settingsData?.notification_settings?.lowStockThreshold ?? 10; // Default to 10 if not found

    // 2. Fetch products with stock <= lowStockThreshold
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock, images') // Select relevant product fields
      .lte('stock', lowStockThreshold);

    if (productsError) {
      console.error('Error fetching low stock products:', productsError);
      return NextResponse.json({ message: 'Error fetching low stock products' }, { status: 500 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Unexpected error in low-stock-products API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 }); // Fix typo: status = 500 should be status: 500
  }
}
