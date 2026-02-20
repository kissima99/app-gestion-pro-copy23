import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, FileText, Trash2, Home, User, Loader2, Hash, ShieldCheck } from 'lucide-react';
import { Tenant, Owner, Agency } from '../types/rental';
import { generateLeasePDF, generateCautionPDF } from '../lib/pdf-service';
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocalStorage } from '../hooks/use-local-storage';

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
  const [agency] = useLocalStorage<Agency>('rental_agency', {
    name: '', address: '', phone: '', email: '', ninea: '', rccm: '', commissionRate: 10
  });

  const [newTenant, setNewTenant] = useState<Partial<Tenant>>({
    firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, status: 'active', ownerId: ''
  });

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newTenant.firstName || !newTenant.lastName || !newTenant.unitName || !newTenant.ownerId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      setIsSubmitting(true);
      await onAdd({
        ...newTenant,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        rentAmount: Number(newTenant.rentAmount) || 0,
        roomsCount: Number(newTenant.roomsCount) || 1
      });
      setNewTenant({ firstName: '', lastName: '', birthDate: '', birthPlace: '', unitName: '', roomsCount: 1, idNumber: '', rentAmount: 0, ownerId: '' });
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
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-bold text-primary">Propriétaire du logement</Label>
              <Select onValueChange={(v) => setNewTenant({...newTenant, ownerId: v})} value={newTenant.ownerId}>
                <SelectTrigger className="border-primary/20">
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
                <SelectTrigger className="border-primary/20"><SelectValue placeholder="Choisir le local" /></SelectTrigger>
                <SelectContent>{UNIT_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">Loyer (FCFA)</Label>
              <Input type="text" inputMode="numeric" value={newTenant.rentAmount || ''} onChange={e => setNewTenant({...newTenant, rentAmount: Number(e.target.value.replace(/[^0-9]/g, ''))})} className="border-primary/20 font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary">NCI / Passport</Label>
              <Input value={newTenant.idNumber} onChange={e => setNewTenant({...newTenant, idNumber: e.target.value})} className="border-primary/20" />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full md:w-fit mt-6 h-12 px-12 font-black shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "ENREGISTRER"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTenants.map(tenant => {
          const owner = owners.find(o => o.id === tenant.ownerId);
          return (
            <Card key={tenant.id} className="overflow-hidden border-l-8 border-l-primary shadow-md">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg text-primary uppercase">{tenant.firstName} {tenant.lastName}</h3>
                    <p className="text-xs font-bold text-muted-foreground">{tenant.unitName} - {tenant.rentAmount?.toLocaleString()} FCFA</p>
                  </div>
                  <Badge>{tenant.status === 'active' ? 'ACTIF' : 'RÉSILIÉ'}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex-1 font-bold" onClick={() => owner && generateLeasePDF(owner, tenant, agency)}>
                    <FileText className="w-4 h-4 mr-1" /> BAIL
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 font-bold border-primary text-primary hover:bg-primary/10" onClick={() => owner && generateCautionPDF(owner, tenant, agency)}>
                    <ShieldCheck className="w-4 h-4 mr-1" /> CAUTION
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => onDelete(tenant.id!)}>
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