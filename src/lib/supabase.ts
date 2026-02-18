import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://izwbhtubezebdgqtuuwb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6d2JodHViZXplYmRncXR1dXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDMzMTMsImV4cCI6MjA4NjA3OTMxM30.2yDQJGrL83M6boa0teF_zeNvzCzJeeMLWeF3Eeo1rfk";

/**
 * SÉCURITÉ CRITIQUE :
 * La table 'profiles' est désormais en lecture seule (SELECT) pour les utilisateurs.
 * Toute modification de 'has_paid' ou 'usage_count' via le client JS sera rejetée par le RLS.
 * Les mises à jour doivent impérativement passer par l'Edge Function 'verify-payment'.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const isSupabaseConfigured = true;