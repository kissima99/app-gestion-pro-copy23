-- 1. Function to sync the profile role to Supabase Auth Custom Claims
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users metadata to include the role
  -- This makes the role available in the JWT as auth.jwt() -> 'app_metadata' ->> 'role'
  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to automatically sync role changes
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

-- 3. Secure the profiles table RLS
-- Ensure users can only read their own profile UNLESS they are an admin
-- We use the JWT claim for the admin check as it's the most secure method
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  (auth.uid() = id) OR 
  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
);

-- 4. Sync existing roles (Run this once)
UPDATE public.profiles SET role = role;