import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Owner } from '../types/rental';
import { UserPlus, Trash2, Phone, MapPin, User } from 'lucide-react';

interface Props {
  owners: Owner[];
  onAdd: (owner: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export const OwnerManager = ({ owners, onAdd, onDelete }: Props) => {
  const [newOwner, setNewOwner] = useState<Partial<Owner>>({
    firstName: '', lastName: '', address: '', telephone: '', commissionRate: 10
  });

  const handleAdd = async () => {
    if (!newOwner.firstName || !newOwner.lastName) return;
    await onAdd(newOwner);
    setNewOwner({ firstName: '', lastName: '', address: '', telephone: '', commissionRate: 10 });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Propriétaire
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input 
              value={newOwner.firstName} 
              onChange={(e) => setNewOwner({...newOwner, firstName: e.target.value})}
              placeholder="Ex: Jean"
            />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input 
              value={newOwner.lastName} 
              onChange={(e) => setNewOwner({...newOwner, lastName: e.target.value})}
              placeholder="Ex: Dupont"
            />
          </div>
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input 
              value={newOwner.address} 
              onChange={(e) => setNewOwner({...newOwner, address: e.target.value})}
              placeholder="Ex: Dakar Plateau"
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input 
              value={newOwner.telephone} 
              onChange={(e) => setNewOwner({...newOwner, telephone: e.target.value})}
              placeholder="+221 ..."
            />
          </div>
          <Button onClick={handleAdd} className="md:col-span-2">Enregistrer le propriétaire</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {owners.map(owner => (
          <Card key={owner.id} className="overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> {owner.firstName} {owner.lastName}
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {owner.address}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {owner.telephone}</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => onDelete(owner.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {owners.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">Aucun propriétaire enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};