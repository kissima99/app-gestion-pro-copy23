import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Owner, Receipt, Expense, Agency, Tenant } from '../types/rental';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Percent, User } from 'lucide-react';

interface Props {
  owners: Owner[];
  tenants: Tenant[];
  receipts: Receipt[];
  expenses: Expense[];
  agency: Agency;
}

export const OwnerFinanceSummary = ({ owners, tenants, receipts, expenses, agency }: Props) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>("");

  const selectedOwner = owners.find(o => o.id === selectedOwnerId);
  
  // Filtrer les quittances pour ce propriétaire
  const ownerTenants = tenants.filter(t => t.ownerId === selectedOwnerId);
  const ownerTenantIds = ownerTenants.map(t => t.id);
  
  const ownerReceipts = receipts.filter(r => ownerTenantIds.includes(r.tenantId));
  const ownerExpenses = expenses.filter(e => e.ownerId === selectedOwnerId);

  const totalCollected = ownerReceipts.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenses = ownerExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const commissionRate = selectedOwner?.commissionRate || agency.commissionRate || 0;
  const commissionAmount = (totalCollected * commissionRate) / 100;
  const netToOwner = totalCollected - totalExpenses - commissionAmount;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" /> Sélectionner un Propriétaire pour le Bilan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedOwnerId} value={selectedOwnerId}>
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Choisir un propriétaire..." />
            </SelectTrigger>
            <SelectContent>
              {owners.map(o => (
                <SelectItem key={o.id} value={o.id}>{o.firstName} {o.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedOwnerId ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-green-700 uppercase">Total Encaissé</p>
              <h3 className="text-xl font-black text-green-800">{totalCollected.toLocaleString()} FCFA</h3>
              <ArrowUpCircle className="w-4 h-4 text-green-500 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-blue-700 uppercase">Commission Agence ({commissionRate}%)</p>
              <h3 className="text-xl font-black text-blue-800">{commissionAmount.toLocaleString()} FCFA</h3>
              <Percent className="w-4 h-4 text-blue-500 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-red-700 uppercase">Dépenses / Travaux</p>
              <h3 className="text-xl font-black text-red-800">{totalExpenses.toLocaleString()} FCFA</h3>
              <ArrowDownCircle className="w-4 h-4 text-red-500 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <p className="text-xs font-bold opacity-80 uppercase">Net à reverser</p>
              <h3 className="text-xl font-black">{netToOwner.toLocaleString()} FCFA</h3>
              <Wallet className="w-4 h-4 opacity-50 mt-2" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">Veuillez sélectionner un propriétaire pour afficher son bilan financier.</p>
        </div>
      )}
    </div>
  );
};