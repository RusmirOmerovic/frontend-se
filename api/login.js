// Serverless Function: /api/login  -> gibt { access_token } zurück
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;        // z.B. https://dzvxcps...supabase.co
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;  // anon key (serverseitig ok)

function getRefFromUrl(url) {
  try { return new URL(url).host.split(".")[0]; } catch { return null; }
}
const REF = getRefFromUrl(SUPABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!REF || !SUPABASE_ANON) { res.status(500).json({ error: 'Missing SUPABASE envs' }); return; }

  const { email, password } = req.body ?? {};
  if (!email || !password) { res.status(400).json({ error: 'email/password required' }); return; }

  try {
    const r = await fetch(`https://${REF}.supabase.co/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const out = await r.json();
    if (!r.ok) { res.status(r.status).json(out); return; }

    res.status(200).json({ access_token: out.access_token });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
