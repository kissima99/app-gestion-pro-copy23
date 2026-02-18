import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Tenant, Owner, Expense, Agency } from '../types/rental';
import { generateReceiptPDF } from '../lib/pdf-service';
import { Receipt as ReceiptIcon, Download, TrendingUp, Wallet, User } from 'lucide-react';

interface Props {
  receipts: Receipt[];
  setReceipts: (receipts: Receipt[]) => void;
  tenants: Tenant[];
  owners: Owner[];
  expenses: Expense[];
  agency: Agency;
}

export const ReceiptManager = ({ receipts, setReceipts, tenants, owners, expenses, agency }: Props) => {
  const [amountInput, setAmountInput] = useState('');
  const [newReceipt, setNewReceipt] = useState<Partial<Receipt>>({
    periodStart: '', periodEnd: '', paymentDate: new Date().toISOString().split('T')[0]
  });
  const [selectedTenantId, setSelectedTenantId] = useState('');

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Fonction pour lier automatiquement le loyer
  const handleTenantChange = (id: string) => {
    setSelectedTenantId(id);
    const tenant = tenants.find(t => t.id === id);
    if (tenant) {
      setAmountInput(tenant.rentAmount.toString());
    }
  };

  const createReceipt = () => {
    const tenant = tenants.find(t => t.id === selectedTenantId);
    const owner = owners.find(o => o.id === tenant?.ownerId);
    const numericAmount = parseInt(amountInput.replace(/[^0-9]/g, ''), 10);
    
    if (!tenant || !owner || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Veuillez sélectionner un locataire valide et saisir un montant.");
      return;
    }

    const receipt: Receipt = {
      ...newReceipt as Receipt,
      id: Date.now().toString(),
      receiptNumber: `Q-${Date.now().toString().slice(-6)}`,
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      unitName: tenant.unitName,
      propertyAddress: owner.address,
      amount: numericAmount,
      ownerId: owner.id
    };

    setReceipts([receipt, ...receipts]);
    generateReceiptPDF(receipt);
    setAmountInput(''); 
    setSelectedTenantId('');
  };

  // Calcul du bilan pour le propriétaire du locataire sélectionné
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const selectedOwner = owners.find(o => o.id === selectedTenant?.ownerId);
  
  const ownerReceipts = receipts.filter(r => {
    const t = tenants.find(ten => ten.id === r.tenantId);
    return t?.ownerId === selectedOwner?.id;
  });
  const ownerExpenses = expenses.filter(e => e.ownerId === selectedOwner?.id);
  
  const totalOwnerCollected = ownerReceipts.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOwnerExpenses = ownerExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const commission = (totalOwnerCollected * (agency.commissionRate || 10)) / 100;
  const netToOwner = totalOwnerCollected - totalOwnerExpenses - commission;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Revenu Total Agence</p>
              <h3 className="text-2xl font-bold">{formatFCFA(receipts.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0))} FCFA</h3>
            </div>
            <TrendingUp className="w-8 h-8 opacity-20" />
          </CardContent>
        </Card>
        
        {selectedOwner && (
          <Card className="bg-blue-600 text-white md:col-span-2 animate-in fade-in slide-in-from-right-4">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase opacity-80">Bilan Propriétaire : {selectedOwner.firstName} {selectedOwner.lastName}</p>
                <div className="flex gap-6 mt-2">
                  <div>
                    <p className="text-[10px] uppercase opacity-70">Total Encaissé</p>
                    <p className="font-bold">{formatFCFA(totalOwnerCollected)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase opacity-70">Net à reverser</p>
                    <p className="font-black text-lg">{formatFCFA(netToOwner)} FCFA</p>
                  </div>
                </div>
              </div>
              <Wallet className="w-10 h-10 opacity-20" />
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <ReceiptIcon className="w-5 h-5" /> Nouvelle Quittance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Locataire</Label>
            <Select onValueChange={handleTenantChange} value={selectedTenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un locataire" />
              </SelectTrigger>
              <SelectContent>
                {tenants.filter(t => t.status === 'active').map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.unitName})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Montant du loyer (FCFA) - <span className="text-primary font-bold">Auto</span></Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={amountInput} 
              onChange={e => setAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Montant automatique"
            />
          </div>
          <div className="space-y-2">
            <Label>Début période</Label>
            <Input type="date" value={newReceipt.periodStart} onChange={e => setNewReceipt({...newReceipt, periodStart: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Période de fin</Label>
            <Input type="date" value={newReceipt.periodEnd} onChange={e => setNewReceipt({...newReceipt, periodEnd: e.target.value})} />
          </div>
          <Button onClick={createReceipt} className="md:col-span-2 h-12 font-bold">Générer & Télécharger PDF</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ReceiptIcon className="w-5 h-5 text-primary" /> Historique des Quittances
        </h3>
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">N°</th>
                  <th className="p-3 text-left">Locataire</th>
                  <th className="p-3 text-left">Montant</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipts.map(r => (
                  <tr key={r.id} className="hover:bg-muted/50">
                    <td className="p-3 font-medium">{r.receiptNumber}</td>
                    <td className="p-3">{r.tenantName}</td>
                    <td className="p-3 font-bold">{formatFCFA(Number(r.amount))} FCFA</td>
                    <td className="p-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => generateReceiptPDF(r)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};