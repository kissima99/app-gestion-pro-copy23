-- 1. Ajouter une colonne rôle à la table profiles si elle n'existe pas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';

-- 2. S'assurer que toutes les tables ont une colonne user_id pour l'isolation
-- (Déjà présent dans ton schéma pour owners, tenants, receipts, etc.)

-- 3. Exemple de politique RLS stricte pour les propriétaires
-- Seul l'utilisateur connecté voit ses propres données
DROP POLICY IF EXISTS "Owners access" ON public.owners;
CREATE POLICY "Owners access" ON public.owners
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Répéter pour les autres tables (tenants, receipts, expenses)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;