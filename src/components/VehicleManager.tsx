import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from '../types/automobile';
import { Car, Plus, Search, Edit, Trash2, CarFront } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
}

const VEHICLE_TYPES = [
  { value: 'voiture', label: 'Voiture' },
  { value: 'moto', label: 'Moto' },
  { value: 'camion', label: 'Camion' },
  { value: 'utilitaire', label: 'Utilitaire' }
];

const VEHICLE_STATUS = {
  available: { label: 'Disponible', variant: 'default' as const },
  rented: { label: 'Loué', variant: 'secondary' as const },
  sold: { label: 'Vendu', variant: 'destructive' as const },
  maintenance: { label: 'Maintenance', variant: 'outline' as const }
};

export const VehicleManager = ({ vehicles, setVehicles }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    type: 'voiture',
    status: 'available',
    purchaseDate: new Date().toISOString().split('T')[0],
    mileage: 0,
    dailyRate: 0
  });

  const addVehicle = () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.registration) {
      alert("Veuillez remplir les champs obligatoires : marque, modèle et immatriculation");
      return;
    }

    const vehicle: Vehicle = {
      ...newVehicle as Vehicle,
      id: Date.now().toString(),
      mileage: Number(newVehicle.mileage) || 0,
      dailyRate: Number(newVehicle.dailyRate) || 0,
      salePrice: Number(newVehicle.salePrice) || undefined,
      year: Number(newVehicle.year) || new Date().getFullYear()
    };

    setVehicles([vehicle, ...vehicles]);
    setNewVehicle({
      type: 'voiture',
      status: 'available',
      purchaseDate: new Date().toISOString().split('T')[0],
      mileage: 0,
      dailyRate: 0
    });
  };

  const deleteVehicle = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  const updateVehicleStatus = (id: string, status: Vehicle['status']) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status } : v));
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    `${vehicle.brand} ${vehicle.model} ${vehicle.registration}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Ajouter un Véhicule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Type de véhicule</Label>
            <Select value={newVehicle.type} onValueChange={(v: Vehicle['type']) => setNewVehicle({...newVehicle, type: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marque</Label>
            <Input 
              value={newVehicle.brand} 
              onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})}
              placeholder="Ex: Toyota"
            />
          </div>
          <div className="space-y-2">
            <Label>Modèle</Label>
            <Input 
              value={newVehicle.model} 
              onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
              placeholder="Ex: Corolla"
            />
          </div>
          <div className="space-y-2">
            <Label>Immatriculation</Label>
            <Input 
              value={newVehicle.registration} 
              onChange={e => setNewVehicle({...newVehicle, registration: e.target.value})}
              placeholder="Ex: DK-1234-AB"
            />
          </div>
          <div className="space-y-2">
            <Label>Année</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newVehicle.year || ''} 
              onChange={e => setNewVehicle({...newVehicle, year: Number(e.target.value.replace(/[^0-9]/g, ''))})}
              placeholder="Ex: 2022"
            />
          </div>
          <div className="space-y-2">
            <Label>Couleur</Label>
            <Input 
              value={newVehicle.color} 
              onChange={e => setNewVehicle({...newVehicle, color: e.target.value})}
              placeholder="Ex: Rouge"
            />
          </div>
          <div className="space-y-2">
            <Label>Kilométrage</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newVehicle.mileage || ''} 
              onChange={e => setNewVehicle({...newVehicle, mileage: Number(e.target.value.replace(/[^0-9]/g, ''))})}
              placeholder="Ex: 50000"
            />
          </div>
          <div className="space-y-2">
            <Label>Tarif journalier (FCFA)</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newVehicle.dailyRate || ''} 
              onChange={e => setNewVehicle({...newVehicle, dailyRate: Number(e.target.value.replace(/[^0-9]/g, ''))})}
              placeholder="Ex: 25000"
            />
          </div>
          <div className="space-y-2">
            <Label>Prix de vente (FCFA)</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newVehicle.salePrice || ''} 
              onChange={e => setNewVehicle({...newVehicle, salePrice: Number(e.target.value.replace(/[^0-9]/g, ''))})}
              placeholder="Optionnel"
            />
          </div>
          <Button onClick={addVehicle} className="md:col-span-2 lg:col-span-3 mt-2">
            <Plus className="w-4 h-4 mr-2" /> Ajouter le véhicule
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          className="pl-10" 
          placeholder="Rechercher un véhicule..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map(vehicle => {
          const statusInfo = VEHICLE_STATUS[vehicle.status];
          return (
            <Card key={vehicle.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <CarFront className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.registration}</p>
                    </div>
                  </div>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </div>
                
                <div className="space-y-2 text-sm mb-4">
                  <p><span className="font-medium">Année:</span> {vehicle.year}</p>
                  <p><span className="font-medium">Kilométrage:</span> {vehicle.mileage.toLocaleString()} km</p>
                  <p><span className="font-medium">Tarif:</span> {vehicle.dailyRate.toLocaleString()} FCFA/jour</p>
                  {vehicle.salePrice && (
                    <p><span className="font-medium">Prix vente:</span> {vehicle.salePrice.toLocaleString()} FCFA</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={vehicle.status} onValueChange={(v: Vehicle['status']) => updateVehicleStatus(vehicle.id, v)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VEHICLE_STATUS).map(([value, info]) => (
                        <SelectItem key={value} value={value}>{info.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteVehicle(vehicle.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};