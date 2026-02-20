import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Building2, AlertCircle, ArrowRight, Wand2 } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });
  }, [navigate]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) return toast.error("Veuillez remplir tous les champs");
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bienvenue !");
      navigate('/');
    } catch (error: any) {
      setAuthError(error.message === "Invalid login credentials" ? "E-mail ou mot de passe incorrect." : error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email) return toast.error("Veuillez entrer votre adresse e-mail");

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("Lien magique envoyé ! Vérifiez votre boîte mail.");
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email || !password) return toast.error("Veuillez remplir tous les champs");

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Compte créé ! Vous pouvez maintenant vous connecter.");
    } catch (error: any) {
      setAuthError(error.message);
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
          <CardDescription>Accédez à votre espace professionnel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {magicLinkSent ? (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Mail className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Vérifiez vos e-mails</h3>
              <p className="text-sm text-muted-foreground">
                Nous avons envoyé un lien de connexion à <strong>{email}</strong>. 
                Cliquez sur le lien pour accéder à l'application.
              </p>
              <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="mt-4">
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="magic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="magic">Lien Magique</TabsTrigger>
                <TabsTrigger value="password">Mot de passe</TabsTrigger>
              </TabsList>

              <TabsContent value="magic" className="space-y-4">
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 w-4 h-4" />
                      <Input type="email" placeholder="nom@exemple.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full font-bold h-12" disabled={loading}>
                    {loading ? "Envoi..." : "Envoyer le lien magique"} <Wand2 className="ml-2 w-4 h-4" />
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    Un lien unique vous sera envoyé par e-mail pour une connexion instantanée.
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handlePasswordAuth} className="space-y-4">
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
                    {loading ? "Connexion..." : "Se connecter"} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleSignUp} className="w-full text-xs font-bold" disabled={loading}>
                    Créer un compte avec ce mot de passe
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;