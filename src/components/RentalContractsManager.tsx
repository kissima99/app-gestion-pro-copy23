import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RentalContract, Vehicle, Client } from '../types/automobile';
import { generateRentalContractPDF } from '../lib/automobile-pdf-service';
import { FileText, Download, Plus, Calendar, DollarSign } from 'lucide-react';

interface Props {
  rentalContracts: RentalContract[];
  setRentalContracts: (contracts: RentalContract[]) => void;
  vehicles: Vehicle[];
  clients: Client[];
}

export const RentalContractsManager = ({ rentalContracts, setRentalContracts, vehicles, clients }: Props) => {
  const [newContract, setNewContract] = useState<Partial<RentalContract>>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    insuranceIncluded: true,
    status: 'active',
    paymentStatus: 'pending',
    createdDate: new Date().toISOString().split('T')[0]
  });

  const availableVehicles = vehicles.filter(v => v.status === 'available');
  const availableClients = clients;

  const calculateTotalDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const createContract = () => {
    const vehicle = vehicles.find(v => v.id === newContract.vehicleId);
    const client = clients.find(c => c.id === newContract.clientId);

    if (!vehicle || !client || !newContract.startDate || !newContract.endDate) {
      alert("Veuillez sélectionner un véhicule, un client et définir les dates de location");
      return;
    }

    const totalDays = calculateTotalDays(newContract.startDate, newContract.endDate);
    const totalAmount = totalDays * vehicle.dailyRate;

    const contract: RentalContract = {
      ...newContract as RentalContract,
      id: Date.now().toString(),
      contractNumber: `LOC-${Date.now().toString().slice(-6)}`,
      vehicleDetails: `${vehicle.brand} ${vehicle.model} (${vehicle.registration})`,
      clientName: `${client.firstName} ${client.lastName}`,
      totalDays,
      dailyRate: vehicle.dailyRate,
      totalAmount
    };

    setRentalContracts([contract, ...rentalContracts]);
    
    // Mettre à jour le statut du véhicule
    vehicles.forEach(v => {
      if (v.id === vehicle.id) {
        v.status = 'rented';
      }
    });

    // Générer le PDF
    generateRentalContractPDF(contract, vehicle, client);

    setNewContract({
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      insuranceIncluded: true,
      status: 'active',
      paymentStatus: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    });
  };

  const updateContractStatus = (id: string, status: RentalContract['status']) => {
    setRentalContracts(rentalContracts.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nouveau Contrat de Location
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Véhicule</Label>
            <Select onValueChange={(v) => setNewContract({...newContract, vehicleId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.registration}) - {v.dailyRate.toLocaleString()} FCFA/jour
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Client</Label>
            <Select onValueChange={(v) => setNewContract({...newContract, clientId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {availableClients.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Input 
              type="date" 
              value={newContract.startDate} 
              onChange={e => setNewContract({...newContract, startDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Input 
              type="date" 
              value={newContract.endDate} 
              onChange={e => setNewContract({...newContract, endDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Statut du paiement</Label>
            <Select value={newContract.paymentStatus} onValueChange={(v: RentalContract['paymentStatus']) => setNewContract({...newContract, paymentStatus: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="partial">Partiel</SelectItem>
                <SelectItem value="paid">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Options supplémentaires</Label>
            <Input 
              value={newContract.additionalOptions} 
              onChange={e => setNewContract({...newContract, additionalOptions: e.target.value})}
              placeholder="Ex: Siège bébé, GPS..."
            />
          </div>
          <Button onClick={createContract} className="md:col-span-2">
            <FileText className="w-4 h-4 mr-2" /> Générer le contrat
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Contrats de Location</h3>
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">N° Contrat</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Véhicule</th>
                <th className="p-3 text-left">Période</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Statut</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rentalContracts.map(contract => {
                const vehicle = vehicles.find(v => v.id === contract.vehicleId);
                const client = clients.find(c => c.id === contract.clientId);
                return (
                  <tr key={contract.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{contract.contractNumber}</td>
                    <td className="p-3">{contract.clientName}</td>
                    <td className="p-3">{contract.vehicleDetails}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {contract.totalDays} jours
                      </div>
                    </td>
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {contract.totalAmount.toLocaleString()} FCFA
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                        {contract.status === 'active' ? 'Actif' : 'Terminé'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => {
                        if (vehicle && client) {
                          generateRentalContractPDF(contract, vehicle, client);
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