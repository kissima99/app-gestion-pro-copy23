import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OwnerManager } from '../components/OwnerManager';
import { TenantManager } from '../components/TenantManager';
import { ReceiptManager } from '../components/ReceiptManager';
import { ExpenseManager } from '../components/ExpenseManager';
import { ArrearsManager } from '../components/ArrearsManager';
import { MonthlySummary } from '../components/MonthlySummary';
import { OwnerFinanceSummary } from '../components/OwnerFinanceSummary';
import { AgencyForm } from '../components/AgencyForm';
import { DataManagement } from '../components/DataManagement';
import { useSupabaseData } from '../hooks/use-supabase-data';
import { useLocalStorage } from '../hooks/use-local-storage';
import { Owner, Tenant, Receipt, Expense, Agency, Arrear } from '../types/rental';
import { Users, Moon, Sun, Building2, Wallet, Car, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Utilisation des hooks Supabase pour les données réelles
  const ownersData = useSupabaseData<Owner>('owners');
  const tenantsData = useSupabaseData<Tenant>('tenants');
  const receiptsData = useSupabaseData<Receipt>('receipts');
  const expensesData = useSupabaseData<Expense>('expenses');
  const arrearsData = useSupabaseData<Arrear>('arrears');

  const [agency, setAgency] = useLocalStorage<Agency>('rental_agency', {
    name: '', address: '', phone: '', email: '', ninea: '', rccm: '', commissionRate: 10
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      // Récupérer le profil pour vérifier le rôle
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(prof);
    };

    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-inner">
            <Building2 className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight leading-none">GESTION PRO</h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest mt-1">SaaS Multi-Clients</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="mr-2 border-white/20 text-white hover:bg-white/10">
            <Link to="/automobile">
              <Car className="w-4 h-4 mr-2" />
              Automobile
            </Link>
          </Button>
          
          {profile?.role === 'admin' && (
            <Button variant="secondary" size="sm" asChild className="mr-2">
              <Link to="/super-admin">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Panel Admin
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/20">
            <LogOut className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full hover:bg-white/20 text-white"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <Tabs defaultValue="locative" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-[600px] bg-muted p-1 rounded-2xl mb-8">
            <TabsTrigger value="locative" className="rounded-xl">GESTION LOCATIVE</TabsTrigger>
            <TabsTrigger value="finances" className="rounded-xl">FINANCES</TabsTrigger>
            <TabsTrigger value="admin" className="rounded-xl">ADMINISTRATION</TabsTrigger>
          </TabsList>

          <TabsContent value="locative" className="space-y-6">
            <Tabs defaultValue="tenants_list">
              <TabsList className="bg-transparent border-b w-full justify-start gap-6 mb-6">
                <TabsTrigger value="tenants_list" className="font-bold">Locataires</TabsTrigger>
                <TabsTrigger value="owners_list" className="font-bold">Propriétaires</TabsTrigger>
              </TabsList>
              <TabsContent value="tenants_list">
                <TenantManager tenants={tenantsData.data} setTenants={() => {}} owners={ownersData.data} />
              </TabsContent>
              <TabsContent value="owners_list">
                <OwnerManager owners={ownersData.data} setOwners={() => {}} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="finances">
            <MonthlySummary receipts={receiptsData.data} expenses={expensesData.data} agency={agency} />
            <div className="mt-8">
              <ReceiptManager 
                receipts={receiptsData.data} 
                setReceipts={() => {}} 
                tenants={tenantsData.data} 
                owners={ownersData.data}
                expenses={expensesData.data}
                agency={agency}
              />
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <div className="max-w-2xl mx-auto space-y-6">
              <AgencyForm agency={agency} setAgency={setAgency} />
              <DataManagement />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;