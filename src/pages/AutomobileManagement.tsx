import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleManager } from '../components/VehicleManager';
import { ClientManager } from '../components/ClientManager';
import { RentalContractsManager } from '../components/RentalContractsManager';
import { SaleContractsManager } from '../components/SaleContractsManager';
import { useSupabaseData } from '../hooks/use-supabase-data';
import { Vehicle, Client, RentalContract, SaleContract } from '../types/automobile';
import { Car, Building2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AutomobileManagement = () => {
  const vehiclesData = useSupabaseData<Vehicle>('vehicles');
  const clientsData = useSupabaseData<Client>('auto_clients');
  const rentalData = useSupabaseData<RentalContract>('rental_contracts');
  const saleData = useSupabaseData<SaleContract>('sale_contracts');

  const sellers = [{ id: '1', name: 'Agence Automobile Pro' }];

  if (vehiclesData.loading || clientsData.loading || rentalData.loading || saleData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6" />
          <h1 className="font-black tracking-tight text-xl uppercase">GESTION AUTOMOBILE</h1>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/">
            <Building2 className="w-4 h-4 mr-2" /> IMMOBILIER
          </Link>
        </Button>
      </header>

      <main className="container max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="grid grid-cols-4 bg-muted p-1 rounded-xl mb-8">
            <TabsTrigger value="vehicles" className="font-bold">Véhicules</TabsTrigger>
            <TabsTrigger value="clients" className="font-bold">Clients</TabsTrigger>
            <TabsTrigger value="rental" className="font-bold">Location</TabsTrigger>
            <TabsTrigger value="sales" className="font-bold">Vente</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleManager 
              vehicles={vehiclesData.data} 
              onAdd={vehiclesData.addItem}
              onDelete={vehiclesData.deleteItem}
            />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManager 
              clients={clientsData.data} 
              onAdd={clientsData.addItem}
              onDelete={clientsData.deleteItem}
            />
          </TabsContent>

          <TabsContent value="rental">
            <RentalContractsManager 
              rentalContracts={rentalData.data} 
              setRentalContracts={() => {}} 
              vehicles={vehiclesData.data}
              clients={clientsData.data}
              onAdd={rentalData.addItem}
              onDelete={rentalData.deleteItem}
            />
          </TabsContent>

          <TabsContent value="sales">
            <SaleContractsManager 
              saleContracts={saleData.data} 
              vehicles={vehiclesData.data}
              sellers={sellers}
              onAdd={saleData.addItem}
              onDelete={saleData.deleteItem}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AutomobileManagement;