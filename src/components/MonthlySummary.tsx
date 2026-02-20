import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Expense, Agency } from '../types/rental';
import { PieChart, Wallet, ArrowDownCircle, ArrowUpCircle, Percent, TrendingUp } from 'lucide-react';

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
  
  const commissionAmount = (totalCollected * (agency.commissionRate || 10)) / 100;
  const netToOwner = totalCollected - totalExpenses - commissionAmount;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-green-50 border-green-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <CardContent className="p-6 flex items-center justify-between relative">
            <div className="z-10">
              <p className="text-xs font-black text-green-700 uppercase tracking-widest opacity-70">Total Encaissé</p>
              <h3 className="text-2xl font-black text-green-800 mt-1">{totalCollected.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <TrendingUp className="w-24 h-24 text-green-900" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <CardContent className="p-6 flex items-center justify-between relative">
            <div className="z-10">
              <p className="text-xs font-black text-blue-700 uppercase tracking-widest opacity-70">Commission ({agency.commissionRate || 10}%)</p>
              <h3 className="text-2xl font-black text-blue-800 mt-1">{commissionAmount.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <CardContent className="p-6 flex items-center justify-between relative">
            <div className="z-10">
              <p className="text-xs font-black text-red-700 uppercase tracking-widest opacity-70">Dépenses Travaux</p>
              <h3 className="text-2xl font-black text-red-800 mt-1">{totalExpenses.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground shadow-xl hover:scale-[1.02] transition-transform overflow-hidden relative group">
          <CardContent className="p-6 flex items-center justify-between relative">
            <div className="z-10">
              <p className="text-xs font-black opacity-80 uppercase tracking-widest">Net Propriétaires</p>
              <h3 className="text-2xl font-black mt-1">{netToOwner.toLocaleString()} FCFA</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};