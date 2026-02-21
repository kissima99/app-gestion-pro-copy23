import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Liste blanche des clés autorisées pour l'import/export (préférences UI uniquement)
const ALLOWED_PREFERENCE_KEYS = [
  'theme',
  'last_active_tab',
  'ui_compact_mode'
];

const SecureDataSchema = z.object({
  metadata: z.object({
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
    
    // On n'exporte que les préférences UI autorisées
    ALLOWED_PREFERENCE_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          payload[key] = JSON.parse(value);
        } catch {
          payload[key] = value;
        }
      }
    });
    
    const exportObject = {
      metadata: {
        exported_at: new Date().toISOString(),
        version: "3.0"
      },
      payload
    };
    
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preferences_ui_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Préférences UI exportées !");
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);
        const validatedData = SecureDataSchema.parse(rawData);
        
        // On ne restaure que les clés autorisées présentes dans le payload
        let importedCount = 0;
        Object.keys(validatedData.payload).forEach(key => {
          if (ALLOWED_PREFERENCE_KEYS.includes(key)) {
            const value = typeof validatedData.payload[key] === 'string' 
              ? validatedData.payload[key] 
              : JSON.stringify(validatedData.payload[key]);
            localStorage.setItem(key, value);
            importedCount++;
          }
        });
        
        if (importedCount > 0) {
          toast.success(`${importedCount} préférences restaurées !`);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error("Aucune préférence valide trouvée dans le fichier.");
        }
      } catch (err) {
        toast.error("Fichier de configuration invalide ou corrompu.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-5 h-5" /> Gestion des Préférences Locales
        </CardTitle>
        <CardDescription>
          Toutes vos données métier (Agences, Contrats, Locataires) sont désormais **exclusivement** gérées sur nos serveurs sécurisés.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportData} variant="outline" className="bg-white border-primary/20">
            <Download className="w-4 h-4 mr-2" /> Exporter Préférences UI
          </Button>
          <div className="relative">
            <input type="file" id="import-db" className="hidden" accept=".json" onChange={importData} />
            <Button variant="default" onClick={() => document.getElementById('import-db')?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Importer Préférences UI
            </Button>
          </div>
        </div>
        <div className="p-3 bg-green-100/50 border border-green-200 rounded-lg">
          <p className="text-[10px] text-green-800 flex items-start gap-2">
            <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0" /> 
            <span>
              **Sécurité renforcée :** L'importation de données sensibles via JSON a été désactivée. Vos données sont protégées par votre compte utilisateur et les politiques RLS de Supabase.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};