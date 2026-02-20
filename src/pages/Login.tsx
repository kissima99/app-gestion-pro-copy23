import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Building2, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) return toast.error("Veuillez remplir tous les champs");
    
    try {
      setLoading(true);
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Compte créé ! Connectez-vous maintenant.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate('/');
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Une erreur est survenue.";
      if (error.message.includes("rate_limit")) {
        message = "Trop de tentatives. Veuillez patienter un moment.";
      } else if (error.message.includes("Invalid login credentials")) {
        message = "E-mail ou mot de passe incorrect.";
      } else {
        message = error.message;
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-black text-primary uppercase">Gestion Locative Pro</CardTitle>
          <CardDescription>{isSignUp ? "Créer un nouveau compte" : "Accédez à votre espace agence"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full font-bold h-12" disabled={loading}>
              {loading ? "Chargement..." : isSignUp ? "S'inscrire" : "Se connecter"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full text-sm text-primary font-bold hover:underline">
              {isSignUp ? "Déjà un compte ? Connexion" : "Pas de compte ? Créer un compte"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;