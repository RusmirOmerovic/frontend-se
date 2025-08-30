import type { NextApiRequest, NextApiResponse } from "next";

const REF  = process.env.NEXT_PUBLIC_SUPABASE_REF!;  // z.B. dzvxcps...
const ANON = process.env.SUPABASE_ANON_KEY!;         // server-only

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email/password required" });

  const r = await fetch(`https://${REF}.supabase.co/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "apikey": ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const out = await r.json();
  if (!r.ok) return res.status(r.status).json(out);

  return res.status(200).json({ access_token: out.access_token });
}
