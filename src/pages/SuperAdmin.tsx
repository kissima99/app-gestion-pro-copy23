import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, Activity } from 'lucide-react';

const SuperAdmin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (!error) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-3 rounded-2xl">
          <ShieldCheck className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">PANNEAU SUPER-ADMIN</h1>
          <p className="text-muted-foreground">Gestion de vos clients et de la plateforme</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs / Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <th className="text-left p-4">ID Utilisateur</th>
                <th className="text-left p-4">Rôle</th>
                <th className="text-left p-4">Statut Paiement</th>
                <th className="text-left p-4">Dernière mise à jour</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs">{u.id}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={u.has_paid ? "bg-green-500" : "bg-amber-500"}>
                      {u.has_paid ? "Payé" : "Essai"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(u.updated_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdmin;