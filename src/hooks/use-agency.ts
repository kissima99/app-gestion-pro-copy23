import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Agency } from '../types/rental';
import { toast } from 'sonner';

export function useAgency() {
  const [agency, setAgency] = useState<Agency>({
    name: '', address: '', phone: '', email: '', ninea: '', rccm: '', commissionRate: 10
  });
  const [loading, setLoading] = useState(true);

  const fetchAgency = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAgency({
          id: data.id,
          name: data.name || '',
          ownerName: data.owner_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          ninea: data.ninea || '',
          rccm: data.rccm || '',
          commissionRate: Number(data.commission_rate) || 10
        });
      }
    } catch (error: any) {
      console.error("[useAgency] Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAgency = async (newAgency: Agency) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dbData = {
        name: newAgency.name,
        owner_name: newAgency.ownerName,
        address: newAgency.address,
        phone: newAgency.phone,
        email: newAgency.email,
        ninea: newAgency.ninea,
        rccm: newAgency.rccm,
        commission_rate: newAgency.commissionRate,
        user_id: user.id
      };

      let error;
      if (newAgency.id) {
        const { error: updateError } = await supabase
          .from('agencies')
          .update(dbData)
          .eq('id', newAgency.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('agencies')
          .insert([dbData]);
        error = insertError;
      }

      if (error) throw error;
      
      setAgency(newAgency);
      toast.success("Profil de l'agence mis à jour");
      fetchAgency(); // Refresh to get the ID if it was an insert
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAgency();
  }, []);

  return { agency, updateAgency, loading };
}