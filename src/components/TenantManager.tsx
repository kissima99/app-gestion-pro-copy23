import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, FileText, Trash2, Home, User, Loader2, ShieldCheck, Layers } from 'lucide-react';
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
const ROOM_COUNTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

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
      toast.success("Locataire enregistré avec succès !");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter(t => 
    `${t.firstName} ${t.lastName} ${t.unitName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Style commun pour tous les inputs pour assurer la visibilité (Police noire et gras)
  const inputStyle = "border-2 border-primary/30 text-black font-bold focus:border-primary focus:ring-primary h-11 bg-white";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Locataire
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Propriétaire du logement *</Label>
              <Select onValueChange={(v) => setNewTenant({...newTenant, ownerId: v})} value={newTenant.ownerId}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Choisir le propriétaire" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map(owner => (
                    <SelectItem key={owner.id} value={owner.id} className="font-bold">
                      {owner.firstName} {owner.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Prénom *</Label>
              <Input 
                value={newTenant.firstName} 
                onChange={e => setNewTenant({...newTenant, firstName: e.target.value})} 
                className={inputStyle}
                placeholder="Ex: Moussa"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Nom *</Label>
              <Input 
                value={newTenant.lastName} 
                onChange={e => setNewTenant({...newTenant, lastName: e.target.value})} 
                className={inputStyle}
                placeholder="Ex: Ndiaye"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Type de Local *</Label>
              <Select onValueChange={(v) => setNewTenant({...newTenant, unitName: v})} value={newTenant.unitName}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Choisir le local" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map(type => (
                    <SelectItem key={type} value={type} className="font-bold">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Nombre de pièces</Label>
              <Select onValueChange={(v) => setNewTenant({...newTenant, roomsCount: parseInt(v)})} value={newTenant.roomsCount?.toString()}>
                <SelectTrigger className={inputStyle}>
                  <SelectValue placeholder="Nb pièces" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_COUNTS.map(count => (
                    <SelectItem key={count} value={count} className="font-bold">{count} pièce(s)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">Loyer Mensuel (FCFA) *</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                value={newTenant.rentAmount || ''} 
                onChange={e => setNewTenant({...newTenant, rentAmount: Number(e.target.value.replace(/[^0-9]/g, ''))})} 
                className={`${inputStyle} text-lg text-primary`}
                placeholder="Montant du loyer"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black text-primary text-sm uppercase">NCI / Passeport</Label>
              <Input 
                value={newTenant.idNumber} 
                onChange={e => setNewTenant({...newTenant, idNumber: e.target.value})} 
                className={inputStyle}
                placeholder="Numéro d'identité"
              />
            </div>
          </div>
          
          <Button onClick={handleAdd} className="w-full md:w-fit mt-8 h-12 px-16 font-black text-lg shadow-xl uppercase tracking-wider" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 w-5 h-5" />}
            ENREGISTRER LE LOCATAIRE
          </Button>
        </CardContent>
      </Card>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
        <Input 
          className="pl-10 h-12 border-2 border-primary/20 font-bold text-black text-lg" 
          placeholder="Rechercher par nom ou local..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredTenants.map(tenant => {
          const owner = owners.find(o => o.id === tenant.ownerId);
          return (
            <Card key={tenant.id} className="overflow-hidden border-l-8 border-l-primary shadow-lg bg-white hover:scale-[1.01] transition-transform">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-primary uppercase leading-tight">{tenant.firstName} {tenant.lastName}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-muted/30 p-1 px-2 rounded w-fit">
                      <Home className="w-4 h-4" /> {tenant.unitName} • {tenant.roomsCount} pièce(s)
                    </div>
                  </div>
                  <Badge className="bg-primary font-black px-3 py-1 text-sm tracking-widest">{tenant.status === 'active' ? 'ACTIF' : 'RÉSILIÉ'}</Badge>
                </div>

                <div className="bg-primary/5 p-3 rounded-xl mb-5 border border-primary/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary/60 uppercase">Propriétaire</span>
                    <span className="font-black text-black text-sm uppercase">
                      {owner ? `${owner.firstName} ${owner.lastName}` : "Non spécifié"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary/60 uppercase">Loyer</span>
                    <span className="font-black text-primary text-lg">{tenant.rentAmount?.toLocaleString()} FCFA</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="flex-1 font-black bg-primary hover:bg-primary/90 shadow-md" onClick={() => owner && generateLeasePDF(owner, tenant, agency)}>
                    <FileText className="w-4 h-4 mr-2" /> BAIL PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 font-black border-2 border-primary text-primary hover:bg-primary/10 shadow-sm" onClick={() => owner && generateCautionPDF(owner, tenant, agency)}>
                    <ShieldCheck className="w-4 h-4 mr-2" /> CAUTION PDF
                  </Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => {
                    if(confirm("Supprimer définitivement ce locataire ?")) onDelete(tenant.id!);
                  }}>
                    <Trash2 className="w-5 h-5" />
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