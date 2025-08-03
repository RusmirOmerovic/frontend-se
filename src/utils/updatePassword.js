import { supabase } from '../supabaseClient.js';

// Setzt ein neues Passwort für den angemeldeten Nutzer
// und leitet bei Erfolg zum Login um
export const updatePassword = async (newPassword, navigate) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Fehler beim Ändern des Passworts:', error.message);
    alert(`Fehler beim Ändern des Passworts: ${error.message}`);
    return false;
  }

  alert('Passwort erfolgreich geändert. Bitte melde dich erneut an.');
  await supabase.auth.signOut();
  navigate('/login');
  return true;
};
