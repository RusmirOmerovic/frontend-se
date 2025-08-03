import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { userId } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: 'Missing userId' });
    return;
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ success: true });
}
