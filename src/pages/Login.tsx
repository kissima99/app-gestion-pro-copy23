import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Sparkles, ArrowRight, UserPlus, Building2 } from 'lucide-react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Veuillez entrer votre e-mail");
    
    try {
      setLoading(true);
      
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ 
          email,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        toast.success("Lien de connexion envoyé ! Vérifiez votre boîte de réception.");
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <Card className="w-full max-w-md border-primary/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-purple-400 to-primary" />
        
        <CardHeader className="text-center space-y-2 pt-10">
          <div className="mx-auto bg-primary w-20 h-20 rounded-3xl flex items-center justify-center mb-2 shadow-xl rotate-3 transition-transform hover:rotate-0 cursor-default">
            {isSignUp ? (
              <UserPlus className="text-white w-10 h-10" />
            ) : (
              <Building2 className="text-white w-10 h-10" />
            )}
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter text-primary">
              GESTION LOCATIVE PRO
            </CardTitle>
            <CardDescription className="text-base font-medium flex items-center justify-center gap-2">
              {isSignUp ? (
                <>Création de votre espace <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Gratuit</Badge></>
              ) : (
                "Expertise Immobilière Digitale"
              )}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest opacity-60">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="votre@agence.com" 
                  className="pl-10 h-12 border-primary/10 focus-visible:ring-primary bg-white/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {!useMagicLink && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-60">Mot de passe</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 w-5 h-5" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 border-primary/10 focus-visible:ring-primary bg-white/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg group transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
              {loading ? "Traitement..." : (
                <span className="flex items-center gap-2">
                  {useMagicLink ? "Envoyer le lien" : (isSignUp ? "Démarrer gratuitement" : "Se connecter")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="flex flex-col gap-4 pt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-white px-3 text-muted-foreground">Options</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"
                  onClick={() => {
                    setUseMagicLink(!useMagicLink);
                    setIsSignUp(false);
                  }}
                >
                  {useMagicLink ? (
                    <><Lock className="w-3.5 h-3.5 mr-2" /> Utiliser un mot de passe</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" /> Connexion sans mot de passe</>
                  )}
                </Button>
                
                <button 
                  type="button"
                  className="text-sm font-bold text-primary hover:underline decoration-2 underline-offset-4 transition-all"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setUseMagicLink(false);
                  }}
                >
                  {isSignUp ? "Déjà un compte ? Connectez-vous" : "Nouveau ? Créer un compte agence gratuit"}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <p className="fixed bottom-6 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
        © 2024 GESTION LOCATIVE PRO • Sécurisé par Supabase
      </p>
    </div>
  );
};

export default Login;