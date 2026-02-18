import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaleContract, Vehicle } from '../types/automobile';
import { generateSaleContractPDF } from '../lib/automobile-pdf-service';
import { FileText, Download, Plus, DollarSign, User } from 'lucide-react';

interface Props {
  saleContracts: SaleContract[];
  setSaleContracts: (contracts: SaleContract[]) => void;
  vehicles: Vehicle[];
  sellers: any[];
}

export const SaleContractsManager = ({ saleContracts, setSaleContracts, vehicles, sellers }: Props) => {
  const [newContract, setNewContract] = useState<Partial<SaleContract>>({
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const vehiclesForSale = vehicles.filter(v => v.status === 'available' && v.salePrice);

  const createContract = () => {
    const vehicle = vehicles.find(v => v.id === newContract.vehicleId);
    const seller = sellers[0];

    if (!vehicle || !newContract.buyerName || !newContract.buyerPhone || !newContract.salePrice) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const contract: SaleContract = {
      ...newContract as SaleContract,
      id: Date.now().toString(),
      contractNumber: `VENTE-${Date.now().toString().slice(-6)}`,
      vehicleDetails: `${vehicle.brand} ${vehicle.model} (${vehicle.registration})`,
      sellerName: seller?.name || 'Vendeur',
      sellerId: seller?.id || '1'
    };

    setSaleContracts([contract, ...saleContracts]);
    
    vehicles.forEach(v => {
      if (v.id === vehicle.id) {
        v.status = 'sold';
      }
    });

    generateSaleContractPDF(contract, vehicle, seller);

    setNewContract({
      saleDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nouveau Contrat de Vente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Véhicule à vendre</Label>
            <Select onValueChange={(v) => setNewContract({...newContract, vehicleId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesForSale.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.registration}) - {v.salePrice?.toLocaleString()} FCFA
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nom de l'acheteur</Label>
            <Input 
              value={newContract.buyerName} 
              onChange={e => setNewContract({...newContract, buyerName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone acheteur</Label>
            <Input 
              value={newContract.buyerPhone} 
              onChange={e => setNewContract({...newContract, buyerPhone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Numéro d'identité acheteur</Label>
            <Input 
              value={newContract.buyerIdNumber} 
              onChange={e => setNewContract({...newContract, buyerIdNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Prix de vente (FCFA)</Label>
            <Input 
              type="number" 
              value={newContract.salePrice} 
              onChange={e => setNewContract({...newContract, salePrice: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label>Mode de paiement</Label>
            <Select value={newContract.paymentMethod} onValueChange={(v: SaleContract['paymentMethod']) => setNewContract({...newContract, paymentMethod: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
                <SelectItem value="credit">Crédit</SelectItem>
                <SelectItem value="installment">Échelonné</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={createContract} className="md:col-span-2">
            <FileText className="w-4 h-4 mr-2" /> Générer le contrat
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Contrats de Vente</h3>
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">N° Contrat</th>
                <th className="p-3 text-left">Acheteur</th>
                <th className="p-3 text-left">Véhicule</th>
                <th className="p-3 text-left">Prix</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {saleContracts.map(contract => {
                const vehicle = vehicles.find(v => v.id === contract.vehicleId);
                return (
                  <tr key={contract.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{contract.contractNumber}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {contract.buyerName}
                      </div>
                    </td>
                    <td className="p-3">{contract.vehicleDetails}</td>
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {contract.salePrice.toLocaleString()} FCFA
                      </div>
                    </td>
                    <td className="p-3">
                      <Select value={contract.status} onValueChange={(v: SaleContract['status']) => {
                        setSaleContracts(saleContracts.map(c => c.id === contract.id ? { ...c, status: v } : c));
                      }}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="completed">Finalisé</SelectItem>
                          <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => {
                        if (vehicle) {
                          generateSaleContractPDF(contract, vehicle, sellers[0]);
                        }
                      }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};