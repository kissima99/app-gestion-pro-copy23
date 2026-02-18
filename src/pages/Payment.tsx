import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, Zap, ArrowRight, Smartphone, Wallet, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from "sonner";

const Payment = () => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Veuillez vous connecter pour effectuer le paiement");

      // Call the secure Edge Function instead of updating the DB directly
      // This prevents users from bypassing the payment via the browser console
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        method: 'POST',
        body: { 
          // In a real app, you would pass a transaction reference here
          transactionId: "SIMULATED_TX_" + Date.now() 
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Paiement validé ! Accès illimité activé.");
      
      // Small delay to allow the DB update to propagate before redirecting
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error("Erreur lors de la validation : " + (error.message || "Une erreur est survenue"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Période d'essai terminée
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Continuez avec l'accès <span className="text-primary">Illimité</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Vos 2 utilisations gratuites sont épuisées. Activez votre compte pour continuer à gérer vos biens.
          </p>
          
          <ul className="space-y-4">
            {["Quittances illimitées", "Contrats de bail", "Tableau de bord", "Support 24/7"].map((f, i) => (
              <li key={i} className="flex items-center gap-3 font-medium">
                <CheckCircle2 className="text-green-500 w-5 h-5" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <Card className="border-primary/20 shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8">
            <CardTitle className="text-2xl">Abonnement Annuel</CardTitle>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-black">50.000</span>
              <span className="text-xl font-bold">FCFA</span>
              <span className="text-sm opacity-70 ml-2">/ an</span>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-xl flex flex-col items-center gap-2 bg-secondary/30">
                <Smartphone className="w-6 h-6 text-orange-500" />
                <span className="text-[10px] font-bold">Orange Money</span>
              </div>
              <div className="p-3 border rounded-xl flex flex-col items-center gap-2 bg-secondary/30">
                <Wallet className="w-6 h-6 text-blue-500" />
                <span className="text-[10px] font-bold">Wave</span>
              </div>
              <div className="p-3 border rounded-xl flex flex-col items-center gap-2 bg-secondary/30">
                <CreditCard className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-bold">Visa / Master</span>
              </div>
              <div className="p-3 border rounded-xl flex flex-col items-center gap-2 bg-secondary/30">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <span className="text-[10px] font-bold">PayPal</span>
              </div>
            </div>

            <Button onClick={handlePayment} className="w-full h-16 text-xl font-bold shadow-xl" disabled={loading}>
              {loading ? "Validation sécurisée..." : "Payer maintenant"}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Paiement sécurisé par cryptage SSL
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;