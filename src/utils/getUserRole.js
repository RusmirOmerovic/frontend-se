import { supabase } from '../supabaseClient';

export async function getUserRole(userId) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Fehler beim Abrufen der Rolle:', error);
    return null;
  }
  return data?.role;
}

