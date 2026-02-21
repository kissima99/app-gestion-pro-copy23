import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const SecureDataSchema = z.object({
  metadata: z.object({
    user_id: z.string().nullable(),
    exported_at: z.string(),
    version: z.string()
  }),
  payload: z.record(z.any())
});

export const DataManagement = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const exportData = async () => {
    const payload: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rental_') || key.startsWith('automobile_'))) {
        payload[key] = JSON.parse(localStorage.getItem(key) || '[]');
      }
    }
    
    const exportObject = {
      metadata: {
        user_id: user?.id || null,
        exported_at: new Date().toISOString(),
        version: "2.0"
      },
      payload
    };
    
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_locale_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Paramètres locaux exportés !");
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);
        const validatedData = SecureDataSchema.parse(rawData);
        
        const currentUserId = user?.id || null;
        if (validatedData.metadata.user_id !== currentUserId) {
          toast.error("Ce fichier provient d'un autre compte.");
          return;
        }

        Object.keys(validatedData.payload).forEach(key => {
          localStorage.setItem(key, JSON.stringify(validatedData.payload[key]));
        });
        
        toast.success("Paramètres locaux restaurés !");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error("Fichier de configuration invalide.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-5 h-5" /> Gestion des Paramètres Locaux
        </CardTitle>
        <CardDescription>
          Vos données de contrats (Immobilier & Automobile) sont désormais sécurisées sur nos serveurs. Cet outil ne gère que vos préférences locales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportData} variant="outline" className="bg-white border-primary/20">
            <Download className="w-4 h-4 mr-2" /> Exporter Préférences
          </Button>
          <div className="relative">
            <input type="file" id="import-db" className="hidden" accept=".json" onChange={importData} />
            <Button variant="default" onClick={() => document.getElementById('import-db')?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Importer Préférences
            </Button>
          </div>
        </div>
        <div className="p-3 bg-blue-100/50 border border-blue-200 rounded-lg">
          <p className="text-[10px] text-blue-800 flex items-start gap-2">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> 
            <span>
              <strong>Note de sécurité :</strong> Les contrats sont protégés par votre compte utilisateur et ne peuvent plus être injectés via un fichier JSON.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};