import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleManager } from '../components/VehicleManager';
import { ClientManager } from '../components/ClientManager';
import { RentalContractsManager } from '../components/RentalContractsManager';
import { SaleContractsManager } from '../components/SaleContractsManager';
import { useLocalStorage } from '../hooks/use-local-storage';
import { Vehicle, Client, RentalContract, SaleContract } from '../types/automobile';
import { Car, Users, FileText, DollarSign } from 'lucide-react';

const AutomobileManagement = () => {
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('automobile_vehicles', []);
  const [clients, setClients] = useLocalStorage<Client[]>('automobile_clients', []);
  const [rentalContracts, setRentalContracts] = useLocalStorage<RentalContract[]>('automobile_rental_contracts', []);
  const [saleContracts, setSaleContracts] = useLocalStorage<SaleContract[]>('automobile_sale_contracts', []);

  const sellers = [{ id: '1', name: 'Agence Automobile' }]; // Exemple de vendeur

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary p-3 rounded-xl">
              <Car className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">GESTION AUTOMOBILE</h1>
              <p className="text-muted-foreground">Gestion complète de votre flotte de véhicules</p>
            </div>
          </div>
        </header>

        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="grid grid-cols-4 bg-muted p-1 rounded-xl mb-6">
            <TabsTrigger value="vehicles" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Car className="w-4 h-4 mr-2" /> Véhicules
            </TabsTrigger>
            <TabsTrigger value="clients" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Clients
            </TabsTrigger>
            <TabsTrigger value="rental" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" /> Location
            </TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              <DollarSign className="w-4 h-4 mr-2" /> Vente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleManager vehicles={vehicles} setVehicles={setVehicles} />
          </TabsContent>

          <TabsContent value="clients">
            <ClientManager clients={clients} setClients={setClients} />
          </TabsContent>

          <TabsContent value="rental">
            <RentalContractsManager 
              rentalContracts={rentalContracts} 
              setRentalContracts={setRentalContracts}
              vehicles={vehicles}
              clients={clients}
            />
          </TabsContent>

          <TabsContent value="sales">
            <SaleContractsManager 
              saleContracts={saleContracts} 
              setSaleContracts={setSaleContracts}
              vehicles={vehicles}
              sellers={sellers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AutomobileManagement;