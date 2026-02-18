import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, FileText, UserMinus, Trash2, Home, User } from 'lucide-react';
import { Tenant, Owner } from '../types/rental';
import { generateLeasePDF } from '../lib/pdf-service';
import { Badge } from "@/components/ui/badge";

interface Props {
  tenants: Tenant[];
  setTenants: (tenants: Tenant[]) => void;
  owners: Owner[];
}

const UNIT_TYPES = [
  "Appartement",
  "Studio",
  "Chambre",
  "Magasin",
  "Bureau",
  "Villa"
];

export const TenantManager = ({ tenants, setTenants, owners }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, status: 'active', ownerId: ''
  });

  const addTenant = () => {
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.unitName || !newTenant.ownerId) {
      alert("Veuillez remplir tous les champs obligatoires, y compris le propriétaire.");
      return;
    }
    const tenant: Tenant = {
      ...newTenant as Tenant,
      id: Date.now().toString(),
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      rentAmount: Number(newTenant.rentAmount) || 0,
      roomsCount: Number(newTenant.roomsCount) || 1
    };
    setTenants([...tenants, tenant]);
    setNewTenant({ firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, ownerId: '' });
  };

  const terminateLease = (id: string) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, status: 'terminated' } : t));
  };

  const deleteTenant = (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
  };

  const filteredTenants = tenants.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Locataire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Propriétaire du logement</Label>
            <Select onValueChange={(v) => setNewTenant({...newTenant, ownerId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le propriétaire" />
              </SelectTrigger>
              <SelectContent>
                {owners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>{owner.firstName} {owner.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input value={newTenant.firstName} onChange={e => setNewTenant({...newTenant, firstName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input value={newTenant.lastName} onChange={e => setNewTenant({...newTenant, lastName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Date de naissance</Label>
            <Input type="date" value={newTenant.birthDate} onChange={e => setNewTenant({...newTenant, birthDate: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Lieu de naissance</Label>
            <Input value={newTenant.birthPlace} onChange={e => setNewTenant({...newTenant, birthPlace: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Local occupé</Label>
            <Select onValueChange={(v) => setNewTenant({...newTenant, unitName: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le local" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nombre de pièces</Label>
            <Input type="number" min="1" value={newTenant.roomsCount} onChange={e => setNewTenant({...newTenant, roomsCount: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Numero de CIN ou Passeport</Label>
            <Input value={newTenant.idNumber} onChange={e => setNewTenant({...newTenant, idNumber: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Montant du loyer (FCFA)</Label>
            <Input type="number" value={newTenant.rentAmount} onChange={e => setNewTenant({...newTenant, rentAmount: Number(e.target.value)})} />
          </div>
          <Button onClick={addTenant} className="md:col-span-2 lg:col-span-3 mt-2">Ajouter le locataire</Button>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          className="pl-10" 
          placeholder="Rechercher un locataire..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTenants.map(tenant => {
          const owner = owners.find(o => o.id === tenant.ownerId);
          return (
            <Card key={tenant.id} className={`overflow-hidden border-l-4 ${tenant.status === 'active' ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{tenant.firstName} {tenant.lastName}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Home className="w-3 h-3" /> {tenant.unitName} ({tenant.roomsCount} pièces)
                    </p>
                    {owner && (
                      <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" /> Proprio: {owner.firstName} {owner.lastName}
                      </p>
                    )}
                  </div>
                  <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
                    {tenant.status === 'active' ? 'Actif' : 'Résilié'}
                  </Badge>
                </div>
                <div className="text-sm space-y-1 mb-4">
                  <p>ID: {tenant.idNumber}</p>
                  <p>Loyer: {tenant.rentAmount?.toLocaleString()} FCFA</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => owner && generateLeasePDF(owner, tenant)}>
                    <FileText className="w-4 h-4 mr-1" /> Bail PDF
                  </Button>
                  {tenant.status === 'active' && (
                    <Button size="sm" variant="secondary" onClick={() => terminateLease(tenant.id)}>
                      <UserMinus className="w-4 h-4 mr-1" /> Résilier
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteTenant(tenant.id)}>
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