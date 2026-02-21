"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  session: Session | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, role: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const extractRole = (currentSession: Session | null) => {
    // On ne fait confiance qu'aux app_metadata (Custom Claims) injectés dans le JWT par Supabase Auth.
    // Ces données ne sont PAS modifiables par l'utilisateur via le SDK client.
    const jwtRole = currentSession?.user?.app_metadata?.role;
    if (jwtRole) return jwtRole;
    
    // Par défaut, on considère l'utilisateur comme un client simple.
    // Le rôle réel sera vérifié via la table 'profiles' dans fetchProfileRole.
    return 'client';
  };

  const fetchProfileRole = async (userId: string) => {
    try {
      // Vérification directe en base de données (Source de vérité)
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setRole(data.role);
      }
    } catch (error) {
      console.error("[Auth] Database role verification failed:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          setRole(extractRole(initialSession));
          // Double vérification contre la base de données
          await fetchProfileRole(initialSession.user.id);
        }
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        setRole(extractRole(newSession));
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchProfileRole(newSession.user.id);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-bold text-primary animate-pulse">Sécurisation de la session...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);