-- 1. Empêcher les utilisateurs de modifier leur propre rôle
DROP POLICY IF EXISTS "users_cannot_update_own_role" ON public.profiles;
CREATE POLICY "users_cannot_update_own_role" ON public.profiles
FOR UPDATE TO authenticated 
USING (auth.uid() = id)
WITH CHECK (
  (auth.uid() = id) AND 
  (role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);

-- 2. Garantir que RLS est activé sur toutes les tables sensibles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arrears ENABLE ROW LEVEL SECURITY;

-- 3. Sécuriser les politiques de suppression (Anti-IDOR)
-- On s'assure que chaque table vérifie bien le user_id lors d'un DELETE
DROP POLICY IF EXISTS "Vehicles delete policy" ON public.vehicles;
CREATE POLICY "Vehicles delete policy" ON public.vehicles
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tenants delete policy" ON public.tenants;
CREATE POLICY "Tenants delete policy" ON public.tenants
FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Receipts delete policy" ON public.receipts;
CREATE POLICY "Receipts delete policy" ON public.receipts
FOR DELETE TO authenticated USING (auth.uid() = user_id);