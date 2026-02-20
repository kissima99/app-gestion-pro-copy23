import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from '../types/automobile';
import { Car, Plus, Search, Trash2, CarFront, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface Props {
  vehicles: Vehicle[];
  onAdd: (v: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const VEHICLE_TYPES = ["voiture", "moto", "camion", "utilitaire"];

export const VehicleManager = ({ vehicles, onAdd, onDelete }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    type: 'voiture', status: 'available', mileage: 0, dailyRate: 0, year: new Date().getFullYear()
  });

  const handleAdd = async () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.registration) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      await onAdd(newVehicle);
      setNewVehicle({ type: 'voiture', status: 'available', mileage: 0, dailyRate: 0, year: new Date().getFullYear() });
    } finally {
      setLoading(false);
    }
  };

  // Style harmonisé (Noir et Gras)
  const inputStyle = "border-2 border-primary/30 text-black font-bold focus:border-primary focus:ring-primary h-11 bg-white";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl bg-white">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Ajouter un Véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="font-black text-primary text-xs uppercase">Marque *</Label>
              <Input value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} className={inputStyle} placeholder="Ex: Toyota" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-primary text-xs uppercase">Modèle *</Label>
              <Input value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className={inputStyle} placeholder="Ex: Corolla" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-primary text-xs uppercase">Immatriculation *</Label>
              <Input value={newVehicle.registration} onChange={e => setNewVehicle({...newVehicle, registration: e.target.value})} className={inputStyle} placeholder="Ex: AA-000-AA" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-primary text-xs uppercase">Tarif Jour (FCFA) *</Label>
              <Input type="text" inputMode="numeric" value={newVehicle.dailyRate || ''} onChange={e => setNewVehicle({...newVehicle, dailyRate: Number(e.target.value.replace(/[^0-9]/g, ''))})} className={inputStyle} placeholder="Prix par jour" />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full mt-6 h-12 font-black text-lg uppercase tracking-wider shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Car className="mr-2 w-5 h-5" />}
            ENREGISTRER LE VÉHICULE
          </Button>
        </CardContent>
      </Card>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
        <Input 
          className="pl-10 h-12 border-2 border-primary/20 font-bold text-black text-lg" 
          placeholder="Rechercher un véhicule..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.filter(v => `${v.brand} ${v.model} ${v.registration}`.toLowerCase().includes(searchTerm.toLowerCase())).map(v => (
          <Card key={v.id} className="border-l-8 border-primary shadow-md bg-white hover:scale-[1.01] transition-transform">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CarFront className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-black text-primary uppercase text-lg">{v.brand} {v.model}</p>
                    <Badge variant="outline" className="font-bold border-primary/30 text-primary">{v.registration}</Badge>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(v.id!)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-primary/20 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase">Tarif Journalier</span>
                <span className="font-black text-lg text-black">{v.dailyRate?.toLocaleString()} FCFA</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};