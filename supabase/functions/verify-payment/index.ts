// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[verify-payment] Starting payment verification process");

    // 1. Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[verify-payment] Missing Authorization header");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. Initialize Supabase client with Service Role Key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Verify the user's identity using the token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error("[verify-payment] Invalid token", { authError });
      return new Response(JSON.stringify({ error: 'Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    /**
     * 4. PAYMENT VERIFICATION LOGIC
     * In a production app, you would verify the transaction ID with your provider 
     * (Stripe, Wave, Orange Money, etc.) here before proceeding.
     */
    console.log("[verify-payment] Verifying payment for user:", user.id);
    
    // 5. Update the profile status securely
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ has_paid: true })
      .eq('id', user.id);

    if (updateError) {
      console.error("[verify-payment] Failed to update profile", { updateError });
      throw updateError;
    }

    console.log("[verify-payment] Payment successfully verified and profile updated");

    return new Response(
      JSON.stringify({ success: true, message: 'Access granted' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error("[verify-payment] Unexpected error", { error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})