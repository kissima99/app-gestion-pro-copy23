import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Expense, Owner } from '../types/rental';
import { Wrench, Trash2, Plus } from 'lucide-react';

interface Props {
  expenses: Expense[];
  onAdd: (expense: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  owners: Owner[];
}

export const ExpenseManager = ({ expenses, onAdd, onDelete, owners }: Props) => {
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'autre', ownerId: ''
  });

  const handleAdd = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.ownerId) {
      alert("Veuillez remplir tous les champs, y compris le propriétaire.");
      return;
    }
    
    await onAdd({
      ...newExpense,
      amount: Number(newExpense.amount)
    });

    setNewExpense({ description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'autre', ownerId: '' });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" /> Enregistrer une Dépense
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
          <div className="space-y-2">
            <Label>Propriétaire</Label>
            <Select onValueChange={(v) => setNewExpense({...newExpense, ownerId: v})} value={newExpense.ownerId}>
              <SelectTrigger>
                <SelectValue placeholder="Proprio..." />
              </SelectTrigger>
              <SelectContent>
                {owners.map(o => (
                  <SelectItem key={o.id} value={o.id}>{o.firstName} {o.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="Ex: Réparation" />
          </div>
          <div className="space-y-2">
            <Label>Montant (FCFA)</Label>
            <Input 
              type="text" 
              inputMode="numeric"
              value={newExpense.amount || ''} 
              onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value.replace(/[^0-9]/g, ''))})} 
              placeholder="Ex: 15000"
            />
          </div>
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select onValueChange={(v: any) => setNewExpense({...newExpense, category: v})} value={newExpense.category}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reparation">Réparation</SelectItem>
                <SelectItem value="taxe">Taxe / Impôt</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </CardContent>
      </Card>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Propriétaire</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Montant</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {expenses.map(e => {
              const owner = owners.find(o => o.id === e.ownerId);
              return (
                <tr key={e.id} className="hover:bg-muted/50">
                  <td className="p-3">{e.date}</td>
                  <td className="p-3 font-medium">{owner ? `${owner.firstName} ${owner.lastName}` : 'Inconnu'}</td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 text-red-600">-{e.amount.toLocaleString()} FCFA</td>
                  <td className="p-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => onDelete(e.id!)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};