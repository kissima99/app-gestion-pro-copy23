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

  const inputStyle = "border-2 border-primary/20 text-black font-bold h-11 bg-white";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg bg-white">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Ajouter un Véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-bold uppercase text-xs">Marque *</Label>
            <Input value={newVehicle.brand} onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})} className={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label className="font-bold uppercase text-xs">Modèle *</Label>
            <Input value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} className={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label className="font-bold uppercase text-xs">Immatriculation *</Label>
            <Input value={newVehicle.registration} onChange={e => setNewVehicle({...newVehicle, registration: e.target.value})} className={inputStyle} />
          </div>
          <div className="space-y-2">
            <Label className="font-bold uppercase text-xs">Tarif Jour (FCFA) *</Label>
            <Input type="text" inputMode="numeric" value={newVehicle.dailyRate || ''} onChange={e => setNewVehicle({...newVehicle, dailyRate: Number(e.target.value.replace(/[^0-9]/g, ''))})} className={inputStyle} />
          </div>
          <Button onClick={handleAdd} className="md:col-span-2 lg:col-span-4 h-12 font-black" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "ENREGISTRER LE VÉHICULE"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {vehicles.filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase())).map(v => (
          <Card key={v.id} className="border-l-4 border-primary">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CarFront className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-black text-primary uppercase">{v.brand} {v.model}</p>
                  <p className="text-xs font-bold text-muted-foreground">{v.registration} • {v.dailyRate.toLocaleString()} FCFA/j</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => onDelete(v.id!)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};