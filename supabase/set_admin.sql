-- Script pour définir le rôle 'admin' pour votre compte
-- Étape : Remplacez 'votre-email@exemple.com' par votre véritable adresse e-mail
UPDATE public.profiles 
SET role = 'admin' 
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND auth.users.email = 'votre-email@exemple.com';