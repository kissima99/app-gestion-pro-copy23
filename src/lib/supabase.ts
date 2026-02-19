import { supabase as client } from '@/integrations/supabase/client';

/**
 * SÉCURITÉ ET STABILITÉ :
 * On ré-exporte l'instance unique de Supabase pour éviter les conflits 
 * de session qui provoquent des rechargements intempestifs.
 */
export const supabase = client;
export const isSupabaseConfigured = true;