import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Client } from '../types/automobile';
import { UserPlus, Search, User, Building, Trash2 } from 'lucide-react';

interface Props {
  clients: Client[];
  setClients: (clients: Client[]) => void;
}

export const ClientManager = ({ clients, setClients }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState<Partial<Client>>({
    clientType: 'individual',
    registrationDate: new Date().toISOString().split('T')[0]
  });

  const addClient = () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.phone || !newClient.idNumber) {
      alert("Veuillez remplir les champs obligatoires : nom, prénom, téléphone et numéro d'identité");
      return;
    }

    const client: Client = {
      ...newClient as Client,
      id: Date.now().toString()
    };

    setClients([client, ...clients]);
    setNewClient({
      clientType: 'individual',
      registrationDate: new Date().toISOString().split('T')[0]
    });
  };

  const deleteClient = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(client =>
    `${client.firstName} ${client.lastName} ${client.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Client
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Type de client</Label>
            <Select value={newClient.clientType} onValueChange={(v: Client['clientType']) => setNewClient({...newClient, clientType: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Particulier</SelectItem>
                <SelectItem value="company">Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newClient.clientType === 'company' && (
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input 
                value={newClient.companyName} 
                onChange={e => setNewClient({...newClient, companyName: e.target.value})}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Prénom</Label>
            <Input 
              value={newClient.firstName} 
              onChange={e => setNewClient({...newClient, firstName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Nom</Label>
            <Input 
              value={newClient.lastName} 
              onChange={e => setNewClient({...newClient, lastName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input 
              value={newClient.phone} 
              onChange={e => setNewClient({...newClient, phone: e.target.value})}
              placeholder="+221 ..."
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email"
              value={newClient.email} 
              onChange={e => setNewClient({...newClient, email: e.target.value})}
              placeholder="Optionnel"
            />
          </div>
          <div className="space-y-2">
            <Label>Numéro d'identité</Label>
            <Input 
              value={newClient.idNumber} 
              onChange={e => setNewClient({...newClient, idNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Permis de conduire</Label>
            <Input 
              value={newClient.driverLicense} 
              onChange={e => setNewClient({...newClient, driverLicense: e.target.value})}
              placeholder="Optionnel"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Adresse</Label>
            <Input 
              value={newClient.address} 
              onChange={e => setNewClient({...newClient, address: e.target.value})}
            />
          </div>
          <Button onClick={addClient} className="md:col-span-2 mt-2">
            <UserPlus className="w-4 h-4 mr-2" /> Ajouter le client
          </Button>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          className="pl-10" 
          placeholder="Rechercher un client..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredClients.map(client => (
          <Card key={client.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {client.clientType === 'company' ? (
                    <Building className="w-8 h-8 text-primary" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{client.firstName} {client.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{client.phone}</p>
                  </div>
                </div>
                <Badge variant={client.clientType === 'company' ? 'secondary' : 'default'}>
                  {client.clientType === 'company' ? 'Entreprise' : 'Particulier'}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm mb-4">
                <p><span className="font-medium">ID:</span> {client.idNumber}</p>
                {client.companyName && (
                  <p><span className="font-medium">Entreprise:</span> {client.companyName}</p>
                )}
                <p><span className="font-medium">Adresse:</span> {client.address}</p>
                {client.driverLicense && (
                  <p><span className="font-medium">Permis:</span> {client.driverLicense}</p>
                )}
              </div>

              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteClient(client.id)}>
                <Trash2 className="w-4 h-4 mr-1" /> Supprimer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};