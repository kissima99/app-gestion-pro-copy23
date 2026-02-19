import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Utilitaires pour la conversion de casse
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const mapKeys = (obj: any, fn: (key: string) => string) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.keys(obj).reduce((acc, key) => {
    acc[fn(key)] = obj[key];
    return acc;
  }, {} as any);
};

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
      
      const mappedData = (result || []).map(item => mapKeys(item, toCamelCase));
      setData(mappedData);
    } catch (error: any) {
      console.error(`[useSupabaseData] Error fetching ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addItem = async (item: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const dbItem = mapKeys(item, toSnakeCase);
      if (user) dbItem.user_id = user.id;

      const { data: result, error } = await supabase
        .from(tableName)
        .insert([dbItem])
        .select();

      if (error) throw error;
      
      const newItem = mapKeys(result[0], toCamelCase);
      setData(prev => [newItem, ...prev]);
      toast.success("Ajouté avec succès");
      return newItem;
    } catch (error: any) {
      const msg = error.message || "Erreur lors de l'ajout";
      toast.error(msg);
      return null;
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
      const msg = error.message || "Erreur lors de la suppression";
      toast.error(msg);
    }
  };

  return { data, setData, loading, addItem, deleteItem, refresh: fetchData };
}