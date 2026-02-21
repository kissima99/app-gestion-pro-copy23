import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, AlertOctagon } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SuperAdmin = () => {
  const { role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // Double-check: Even if the UI let us in, RLS will block unauthorized queries
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) {
        setError("Accès refusé. Vous n'avez pas les permissions nécessaires pour voir ces données.");
      } else if (data) {
        setUsers(data);
        // If we only get 1 result and it's ourselves, but we're supposed to see everyone
        if (data.length <= 1 && role !== 'admin') {
          setError("Accès restreint par les politiques de sécurité (RLS).");
        }
      }
      setLoading(false);
    };

    if (role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (role !== 'admin' && !loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Accès Non Autorisé</AlertTitle>
          <AlertDescription>
            Cette interface est réservée aux administrateurs. Votre tentative a été enregistrée.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-3 rounded-2xl shadow-lg">
          <ShieldCheck className="text-white w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">PANNEAU SUPER-ADMIN</h1>
          <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Gouvernance & Sécurité de la plateforme</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Erreur de sécurité</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase">Utilisateurs Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{users.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl border-primary/10 overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="text-lg">Répertoire des comptes utilisateurs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">ID Utilisateur</TableHead>
                <TableHead className="font-bold">Rôle</TableHead>
                <TableHead className="font-bold">Statut</TableHead>
                <TableHead className="font-bold">Inscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-[10px] text-muted-foreground">{u.id}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="font-bold">
                      {u.role.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={u.has_paid ? "bg-green-500 font-bold" : "bg-amber-500 font-bold"}>
                      {u.has_paid ? "ABONNÉ" : "ESSAI"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">
                    {new Date(u.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    Aucune donnée accessible via les politiques RLS actuelles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdmin;