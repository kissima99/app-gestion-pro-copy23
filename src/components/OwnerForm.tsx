import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Owner } from '../types/rental';
import { User } from 'lucide-react';

interface Props {
  owner: Owner;
  setOwner: (owner: Owner) => void;
}

export const OwnerForm = ({ owner, setOwner }: Props) => {
  return (
    <Card className="w-full mb-6 border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" /> Informations du Propriétaire
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner-firstname">Prénom</Label>
            <Input 
              id="owner-firstname"
              value={owner.firstName} 
              onChange={(e) => setOwner({...owner, firstName: e.target.value})}
              placeholder="Ex: Jean"
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner-lastname">Nom</Label>
            <Input 
              id="owner-lastname"
              value={owner.lastName} 
              onChange={(e) => setOwner({...owner, lastName: e.target.value})}
              placeholder="Ex: Dupont"
              className="focus-visible:ring-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner-address">Adresse de la maison</Label>
            <Input 
              id="owner-address"
              value={owner.address} 
              onChange={(e) => setOwner({...owner, address: e.target.value})}
              placeholder="Ex: 123 Rue de la Paix, Dakar"
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner-phone">Numéro de téléphone</Label>
            <Input 
              id="owner-phone"
              value={owner.telephone} 
              onChange={(e) => setOwner({...owner, telephone: e.target.value})}
              placeholder="Ex: +221 77 000 00 00"
              className="focus-visible:ring-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};