import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Expense, Agency } from '../types/rental';
import { PieChart, Wallet, ArrowDownCircle, ArrowUpCircle, Percent } from 'lucide-react';

interface Props {
  receipts: Receipt[];
  expenses: Expense[];
  agency: Agency;
}

export const MonthlySummary = ({ receipts, expenses, agency }: Props) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyReceipts = receipts.filter(r => {
    const d = new Date(r.paymentDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthlyExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalCollected = monthlyReceipts.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Calcul de la commission
  const commissionAmount = (totalCollected * (agency.commissionRate || 0)) / 100;
  const netToOwner = totalCollected - totalExpenses - commissionAmount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-700 uppercase">Total Encaissé</p>
              <h3 className="text-xl font-black text-green-800">{totalCollected.toLocaleString()} FCFA</h3>
            </div>
            <ArrowUpCircle className="w-8 h-8 text-green-500 opacity-50" />
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase">Commission Agence ({agency.commissionRate}%)</p>
              <h3 className="text-xl font-black text-blue-800">{commissionAmount.toLocaleString()} FCFA</h3>
            </div>
            <Percent className="w-8 h-8 text-blue-500 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-700 uppercase">Total Dépenses</p>
              <h3 className="text-xl font-black text-red-800">{totalExpenses.toLocaleString()} FCFA</h3>
            </div>
            <ArrowDownCircle className="w-8 h-8 text-red-500 opacity-50" />
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase">Net à Verser au Propriétaire</p>
              <h3 className="text-xl font-black">{netToOwner.toLocaleString()} FCFA</h3>
            </div>
            <Wallet className="w-8 h-8 opacity-30" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" /> Récapitulatif du Mois
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Nombre de quittances émises</span>
              <span className="font-bold">{monthlyReceipts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Nombre de dépenses enregistrées</span>
              <span className="font-bold">{monthlyExpenses.length}</span>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground italic">
                Note : Le montant net correspond au total encaissé moins les dépenses et la commission de l'agence.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};