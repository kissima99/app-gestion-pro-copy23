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
    console.log("[verify-payment] Starting secure payment verification");

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { transactionId, provider, amount } = await req.json();

    if (!transactionId || !provider) {
      console.error("[verify-payment] Missing transaction details");
      return new Response(JSON.stringify({ error: 'Missing transactionId or provider' }), {
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

    // 1. IDEMPOTENCY CHECK: Has this transaction already been used?
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .single();

    if (existingPayment) {
      console.warn("[verify-payment] Duplicate transaction attempt:", transactionId);
      return new Response(JSON.stringify({ error: 'Transaction already processed' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    /**
     * 2. EXTERNAL PROVIDER VERIFICATION
     * This is where you call Stripe, Wave, or Orange Money API.
     * Example (Stripe):
     * const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${transactionId}`, {
     *   headers: { 'Authorization': `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}` }
     * });
     * const session = await response.json();
     * if (session.payment_status !== 'paid') throw new Error('Payment not verified');
     */
    
    console.log(`[verify-payment] Verifying ${provider} transaction: ${transactionId}`);
    
    // MOCK VERIFICATION (Replace with real API calls above)
    const isVerified = true; // In production, this depends on the API response

    if (!isVerified) {
      throw new Error("Payment verification failed with provider");
    }

    // 3. RECORD THE PAYMENT
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

    // 4. UPDATE PROFILE STATUS
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true })
      .eq('id', user.id);

    if (updateError) throw updateError;

    console.log("[verify-payment] Success for user:", user.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Access granted' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("[verify-payment] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})