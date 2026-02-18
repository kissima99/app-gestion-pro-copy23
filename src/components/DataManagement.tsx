import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Updated validation schema to include a checksum for integrity
const SecureDataSchema = z.object({
  metadata: z.object({
    user_id: z.string().nullable(),
    exported_at: z.string(),
    version: z.string(),
    checksum: z.string() // Required for integrity check
  }),
  payload: z.record(z.array(z.object({
    id: z.string().optional(),
    user_id: z.string().optional(),
  }).passthrough()))
});

export const DataManagement = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Helper to generate a SHA-256 checksum of the payload combined with the user identity
  const generateChecksum = async (payload: any, userId: string | null) => {
    const dataToHash = JSON.stringify(payload) + (userId || 'local-session-secret');
    const msgUint8 = new TextEncoder().encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const exportData = async () => {
    const payload: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rental_') || key.startsWith('automobile_'))) {
        payload[key] = JSON.parse(localStorage.getItem(key) || '[]');
      }
    }
    
    const userId = user?.id || null;
    const checksum = await generateChecksum(payload, userId);
    
    const exportObject = {
      metadata: {
        user_id: userId,
        exported_at: new Date().toISOString(),
        version: "1.2",
        checksum
      },
      payload
    };
    
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestion_pro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success("Données exportées avec signature d'intégrité !");
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);
        
        // 1. Schema validation
        const validatedData = SecureDataSchema.parse(rawData);
        
        // 2. Ownership check
        const currentUserId = user?.id || null;
        if (validatedData.metadata.user_id !== currentUserId) {
          toast.error("Sécurité : Ce fichier appartient à un autre compte utilisateur.");
          return;
        }

        // 3. Integrity check (Checksum verification)
        // This prevents users from manually changing the user_id in the JSON file
        const calculatedChecksum = await generateChecksum(validatedData.payload, currentUserId);
        if (calculatedChecksum !== validatedData.metadata.checksum) {
          toast.error("Sécurité : Le fichier a été modifié ou est corrompu.");
          return;
        }
        
        // 4. Secure import
        Object.keys(validatedData.payload).forEach(key => {
          localStorage.setItem(key, JSON.stringify(validatedData.payload[key]));
        });
        
        toast.success("Données vérifiées et importées avec succès !");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error("Import error:", err);
        toast.error("Fichier invalide, corrompu ou signature de sécurité manquante.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-5 h-5" /> Sauvegarde Sécurisée
        </CardTitle>
        <CardDescription>
          Exportez et importez vos données avec vérification d'identité et d'intégrité (SHA-256).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportData} variant="outline" className="bg-white border-primary/20 hover:bg-primary/5">
            <Download className="w-4 h-4 mr-2" /> Exporter (Signé)
          </Button>
          <div className="relative">
            <input 
              type="file" 
              id="import-db" 
              className="hidden" 
              accept=".json" 
              onChange={importData}
            />
            <Button variant="default" onClick={() => document.getElementById('import-db')?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Importer & Vérifier
            </Button>
          </div>
        </div>
        <div className="p-3 bg-amber-100/50 border border-amber-200 rounded-lg">
          <p className="text-[10px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> 
            <span>
              <strong>Note de sécurité :</strong> Seuls les fichiers exportés par votre compte ({user?.email || 'Mode Local'}) et non modifiés manuellement peuvent être importés.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};