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
  
  const commissionAmount = (totalCollected * (agency.commissionRate || 0)) / 100;
  const netToOwner = totalCollected - totalExpenses - commissionAmount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-green-700 uppercase tracking-wider">Total Encaissé</p>
              <h3 className="text-2xl font-black text-green-800 mt-1">{totalCollected.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-2xl">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Commission ({agency.commissionRate}%)</p>
              <h3 className="text-2xl font-black text-blue-800 mt-1">{commissionAmount.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-wider">Total Dépenses</p>
              <h3 className="text-2xl font-black text-red-800 mt-1">{totalExpenses.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-2xl">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground shadow-xl hover:scale-[1.02] transition-transform">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black opacity-80 uppercase tracking-wider">Net Propriétaires</p>
              <h3 className="text-2xl font-black mt-1">{netToOwner.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};