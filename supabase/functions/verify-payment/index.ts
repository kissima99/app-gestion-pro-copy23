// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[verify-payment] Secure verification request received");

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { transactionId, provider, amount } = await req.json();

    // Validation stricte des entrées
    if (!transactionId || transactionId.length < 8 || !provider) {
      return new Response(JSON.stringify({ error: 'Invalid transaction data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1. Vérification d'idempotence (Empêche de réutiliser un ID de transaction)
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (existingPayment) {
      return new Response(JSON.stringify({ error: 'Transaction already processed' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. LOGIQUE DE VÉRIFICATION RÉELLE
    // SÉCURITÉ : Ne jamais laisser 'isVerified = true' par défaut en production.
    let isVerified = false;
    
    // Exemple pour Stripe/Wave :
    // const providerRes = await fetch(`https://api.provider.com/verify/${transactionId}`, { ... });
    // isVerified = (await providerRes.json()).status === 'SUCCESS';
    
    // Pour le moment, on bloque si ce n'est pas un test explicite (à remplacer par votre API)
    if (transactionId.startsWith('TEST_')) {
       isVerified = true; 
       console.warn("[verify-payment] Using TEST mode for transaction:", transactionId);
    } else {
       // En production, sans API de vérification, on refuse par défaut.
       throw new Error("Payment provider API integration required for production verification.");
    }

    if (!isVerified) {
      throw new Error("Payment could not be verified with the provider.");
    }

    // 3. Enregistrement et mise à jour du profil
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([{
        user_id: user.id,
        transaction_id: transactionId,
        provider: provider,
        amount: amount || 0,
        status: 'completed'
      }]);

    if (paymentError) throw paymentError;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, message: 'Access granted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("[verify-payment] Critical Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})