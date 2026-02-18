import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tenant, Receipt, Arrear } from '../types/rental';
import { AlertTriangle, CheckCircle2, Clock, Plus, Trash2, Wallet } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  tenants: Tenant[];
  receipts: Receipt[];
  manualArrears: Arrear[];
  onAdd: (arrear: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export const ArrearsManager = ({ tenants, receipts, manualArrears, onAdd, onDelete }: Props) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [newArrear, setNewArrear] = useState<Partial<Arrear>>({
    tenantId: '', amount: 0, month: '', description: ''
  });

  const activeTenants = tenants.filter(t => t.status === 'active');
  
  const autoArrears = activeTenants.map(tenant => {
    const hasPaidThisMonth = receipts.some(r => {
      const payDate = new Date(r.paymentDate);
      return r.tenantId === tenant.id && 
             payDate.getMonth() === currentMonth && 
             payDate.getFullYear() === currentYear;
    });

    if (hasPaidThisMonth) return { tenant, status: 'paid' };
    if (currentDay <= 10) return { tenant, status: 'pending' };
    return { tenant, status: 'late' };
  });

  const lates = autoArrears.filter(a => a.status === 'late');
  const pendings = autoArrears.filter(a => a.status === 'pending');

  const handleAdd = async () => {
    const tenant = tenants.find(t => t.id === newArrear.tenantId);
    if (!tenant || !newArrear.amount) return;

    await onAdd({
      tenantId: tenant.id,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      amount: Number(newArrear.amount),
      month: newArrear.month || '',
      description: newArrear.description || 'Impayé manuel',
      dateAdded: new Date().toISOString().split('T')[0]
    });

    setNewArrear({ tenantId: '', amount: 0, month: '', description: '' });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
              <AlertTriangle className="w-5 h-5" /> Retards Confirmés (Après le 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lates.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-green-600">
                <CheckCircle2 className="w-8 h-8 mb-2" />
                <p className="text-sm font-bold">Aucun retard critique.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lates.map(({ tenant }) => (
                  <div key={tenant.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                    <div>
                      <p className="font-bold text-sm">{tenant.firstName} {tenant.lastName}</p>
                      <p className="text-xs text-muted-foreground">{tenant.unitName}</p>
                    </div>
                    <Badge variant="destructive">{tenant.rentAmount.toLocaleString()} FCFA</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 text-lg">
              <Clock className="w-5 h-5" /> En attente (Période de grâce)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Tous les paiements du mois sont reçus.
              </div>
            ) : (
              <div className="space-y-3">
                {pendings.map(({ tenant }) => (
                  <div key={tenant.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100 shadow-sm">
                    <div>
                      <p className="font-bold text-sm">{tenant.firstName} {tenant.lastName}</p>
                      <p className="text-xs text-muted-foreground">Délai : 10 du mois</p>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">À percevoir</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Enregistrer un Arriéré Manuel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>Locataire</Label>
            <Select onValueChange={(v) => setNewArrear({...newArrear, tenantId: v})} value={newArrear.tenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {activeTenants.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Montant de la dette</Label>
            <Input type="number" value={newArrear.amount} onChange={e => setNewArrear({...newArrear, amount: Number(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Mois / Motif</Label>
            <Input placeholder="Ex: Reliquat Janvier" value={newArrear.description} onChange={e => setNewArrear({...newArrear, description: e.target.value})} />
          </div>
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Enregistrer
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" /> Historique des Dettes & Arriérés
        </h3>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Locataire</th>
                <th className="p-4 text-left">Motif</th>
                <th className="p-4 text-left">Montant</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {manualArrears.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune dette enregistrée manuellement.</td>
                </tr>
              ) : (
                manualArrears.map(a => (
                  <tr key={a.id} className="hover:bg-muted/50">
                    <td className="p-4">{a.dateAdded}</td>
                    <td className="p-4 font-bold">{a.tenantName}</td>
                    <td className="p-4">{a.description}</td>
                    <td className="p-4 text-red-600 font-black">{a.amount.toLocaleString()} FCFA</td>
                    <td className="p-4 text-right">
                      <Button size="icon" variant="ghost" onClick={() => onDelete(a.id!)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};