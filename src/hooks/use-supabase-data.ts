import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSupabaseData<T extends { id?: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (error: any) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = async (item: any) => {
    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([item])
        .select();

      if (error) throw error;
      setData(prev => [result[0], ...prev]);
      toast.success("Ajouté avec succès");
      return result[0];
    } catch (error: any) {
      toast.error("Erreur lors de l'ajout");
      throw error;
    }
  };

  const updateItem = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      toast.success("Mis à jour");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour");
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      setData(prev => prev.filter(item => item.id !== id));
      toast.success("Supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
      throw error;
    }
  };

  return { data, setData, loading, addItem, updateItem, deleteItem, refresh: fetchData };
}