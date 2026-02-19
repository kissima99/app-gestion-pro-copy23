import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, FileText, Trash2, Home, User, Loader2, Hash } from 'lucide-react';
import { Tenant, Owner } from '../types/rental';
import { generateLeasePDF } from '../lib/pdf-service';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  tenants: Tenant[];
  onAdd: (tenant: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  owners: Owner[];
}

const UNIT_TYPES = ["Appartement", "Studio", "Chambre", "Magasin", "Bureau", "Villa"];

export const TenantManager = ({ tenants, onAdd, onDelete, owners }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, status: 'active', ownerId: ''
  });

  const handleAdd = async () => {
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.unitName || !newTenant.ownerId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const result = await onAdd({
        ...newTenant,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        rentAmount: Number(newTenant.rentAmount) || 0,
        roomsCount: Number(newTenant.roomsCount) || 1
      });

      if (result) {
        setNewTenant({ firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, ownerId: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Locataire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="font-bold text-primary">Propriétaire du logement</Label>
            <Select onValueChange={(v) => setNewTenant({...newTenant, ownerId: v})} value={newTenant.ownerId}>
              <SelectTrigger className="border-primary/20 focus:ring-primary">
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
            <Label className="font-bold text-primary">Prénom</Label>
            <Input value={newTenant.firstName} onChange={e => setNewTenant({...newTenant, firstName: e.target.value})} className="border-primary/20" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-primary">Nom</Label>
            <Input value={newTenant.lastName} onChange={e => setNewTenant({...newTenant, lastName: e.target.value})} className="border-primary/20" />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-primary">Local occupé</Label>
            <Select onValueChange={(v) => setNewTenant({...newTenant, unitName: v})} value={newTenant.unitName}>
              <SelectTrigger className="border-primary/20">
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
            <Label className="font-bold text-primary">Nombre de pièces</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <Input 
                type="text" 
                inputMode="numeric"
                value={newTenant.roomsCount || ''} 
                onChange={e => setNewTenant({...newTenant, roomsCount: Number(e.target.value.replace(/[^0-9]/g, ''))})} 
                className="border-primary/20 pl-10"
                placeholder="Ex: 3"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-primary">Loyer (FCFA)</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newTenant.rentAmount || ''} 
              onChange={e => setNewTenant({...newTenant, rentAmount: Number(e.target.value.replace(/[^0-9]/g, ''))})} 
              className="border-primary/20 font-bold text-primary" 
              placeholder="Saisie manuelle du montant"
            />
          </div>
          <Button onClick={handleAdd} className="md:col-span-2 lg:col-span-1 mt-8 h-12 font-black shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "ENREGISTRER"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTenants.map(tenant => {
          const owner = owners.find(o => o.id === tenant.ownerId);
          return (
            <Card key={tenant.id} className={`overflow-hidden border-l-8 shadow-md hover:shadow-xl transition-all ${tenant.status === 'active' ? 'border-l-primary bg-primary/5' : 'border-l-red-500 bg-red-50'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-white p-2 rounded-xl">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-primary uppercase">{tenant.firstName} {tenant.lastName}</h3>
                      <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Home className="w-3 h-3" /> {tenant.unitName} ({tenant.roomsCount} pièces)
                      </p>
                    </div>
                  </div>
                  <Badge className={tenant.status === 'active' ? 'bg-primary' : 'bg-red-500'}>
                    {tenant.status === 'active' ? 'ACTIF' : 'RÉSILIÉ'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white/50 rounded-xl border border-primary/10">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Loyer Mensuel</p>
                    <p className="font-black text-primary">{tenant.rentAmount?.toLocaleString()} FCFA</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Propriétaire</p>
                    <p className="font-bold text-xs truncate">{owner ? `${owner.firstName} ${owner.lastName}` : '...'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="default" className="flex-1 font-bold" onClick={() => owner && generateLeasePDF(owner, tenant)}>
                    <FileText className="w-4 h-4 mr-2" /> BAIL PDF
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(tenant.id!)}>
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