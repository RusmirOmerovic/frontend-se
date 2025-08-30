// Serverless Function: /api/projectnew  -> leitet mit Bearer JWT an deine Supabase Edge Function weiter
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
function getRefFromUrl(url) {
  try { return new URL(url).host.split(".")[0]; } catch { return null; }
}
const REF = getRefFromUrl(SUPABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!REF) { res.status(500).json({ error: 'Missing SUPABASE URL/REF' }); return; }

  const auth = req.headers.authorization || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ error: 'Missing Authorization: Bearer <token>' }); return;
  }

  try {
    const r = await fetch(`https://${REF}.functions.supabase.co/projectnew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': auth },
      body: JSON.stringify(req.body ?? {})
    });
    const out = await r.json().catch(() => ({}));
    res.status(r.status).json(out);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
