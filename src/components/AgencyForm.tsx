import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ShieldCheck, MapPin, Phone, Mail, User, Percent } from 'lucide-react';
import { Agency } from '../types/rental';

interface Props {
  agency: Agency;
  setAgency: (agency: Agency) => void;
}

export const AgencyForm = ({ agency, setAgency }: Props) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl">Profil de l'Agence</CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Ces informations apparaîtront sur vos documents officiels.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency-name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Nom de l'Agence
                </Label>
                <Input 
                  id="agency-name"
                  value={agency.name} 
                  onChange={(e) => setAgency({...agency, name: e.target.value})}
                  placeholder="Ex: Excellence Immobilier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-owner" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Propriétaire de l'Agence
                </Label>
                <Input 
                  id="agency-owner"
                  value={agency.ownerName || ''} 
                  onChange={(e) => setAgency({...agency, ownerName: e.target.value})}
                  placeholder="Nom complet du gérant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency-address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Adresse Siège
                </Label>
                <Input 
                  id="agency-address"
                  value={agency.address} 
                  onChange={(e) => setAgency({...agency, address: e.target.value})}
                  placeholder="Ex: Dakar Plateau"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Téléphone
                </Label>
                <Input 
                  id="agency-phone"
                  value={agency.phone} 
                  onChange={(e) => setAgency({...agency, phone: e.target.value})}
                  placeholder="+221 33 000 00 00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agency-ninea" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> NINEA
                </Label>
                <Input 
                  id="agency-ninea"
                  value={agency.ninea} 
                  onChange={(e) => setAgency({...agency, ninea: e.target.value})}
                  placeholder="NINEA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency-commission" className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" /> Commission (%)
                </Label>
                <Input 
                  id="agency-commission"
                  type="text"
                  value={agency.commissionRate || ''} 
                  onChange={(e) => setAgency({...agency, commissionRate: Number(e.target.value.replace(/[^0-9]/g, ''))})}
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};