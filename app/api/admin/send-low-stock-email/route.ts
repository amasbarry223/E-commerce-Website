import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resend } from 'resend'; // Import Resend

const resend = new Resend(process.env.RESEND_API_KEY); // Initialize Resend client

// This API route would typically be triggered by an external service (e.g., a cron job, a Supabase Edge Function)
// and not directly from the client, to avoid exposing API keys or enabling spam.

export async function GET(request: Request) { // Using GET for simplicity, POST might be more appropriate for triggering actions
  try {
    // 1. Fetch admin email and lowStockThreshold from store_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('store_settings')
      .select('email, notification_settings')
      .eq('id', 1)
      .single();

    if (settingsError || !settingsData) {
      console.error('Error fetching store settings for email:', settingsError);
      return NextResponse.json({ message: 'Error fetching store settings for email' }, { status: 500 });
    }

    const adminEmail = settingsData.email;
    const lowStockThreshold = settingsData.notification_settings?.lowStockThreshold ?? 10;
    const sendLowStockAlert = settingsData.notification_settings?.lowStock ?? false; // Check if low stock alerts are enabled

    if (!sendLowStockAlert || !adminEmail) {
        return NextResponse.json({ message: 'Low stock email alerts are disabled or admin email is not set.' }, { status: 200 });
    }

    // 2. Fetch low stock products (can reuse logic from low-stock-products API)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock, images') // Include images for potential email styling
      .lte('stock', lowStockThreshold);

    if (productsError) {
      console.error('Error fetching low stock products for email:', productsError);
      return NextResponse.json({ message: 'Error fetching low stock products for email' }, { status: 500 });
    }

    if (products.length === 0) {
      return NextResponse.json({ message: 'No products below low stock threshold, no email sent.' }, { status: 200 });
    }

    // 3. Construct email content
    let emailBody = `<h1>Alerte Stock Faible pour Tonomi</h1><p>Les produits suivants ont un stock inférieur ou égal à ${lowStockThreshold}:</p><ul>`;
    products.forEach(product => {
      emailBody += `<li>${product.name} (ID: ${product.id}) - Stock actuel: ${product.stock}</li>`;
      // Optionally add image to email body
      if (product.images && product.images.length > 0) {
        emailBody += `<img src="${product.images[0]}" alt="${product.name}" width="100" />`;
      }
    });
    emailBody += `</ul><p>Veuillez réapprovisionner ces articles.</p>`;

    const emailSubject = `Alerte Stock Faible - ${products.length} produit(s) en stock critique`;

    // 4. Send email using Resend
    if (!process.env.RESEND_FROM_EMAIL) {
        console.error("RESEND_FROM_EMAIL is not set in environment variables.");
        return NextResponse.json({ message: "Email sender not configured." }, { status: 500 });
    }

    try {
        const { data, error: resendError } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL, // Use environment variable
            to: adminEmail,
            subject: emailSubject,
            html: emailBody,
        });

        if (resendError) {
            console.error('Error sending email with Resend:', resendError);
            return NextResponse.json({ message: 'Failed to send email with Resend.', error: resendError }, { status: 500 });
        }

        console.log('Low stock email sent successfully via Resend:', data);
        return NextResponse.json({ message: 'Low stock email sent successfully.' });

    } catch (resendCatchError) {
        console.error('Unexpected error during Resend email send:', resendCatchError);
        return NextResponse.json({ message: 'Internal server error during email send.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error in send-low-stock-email API:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
