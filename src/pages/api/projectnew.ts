import type { NextApiRequest, NextApiResponse } from "next";
const REF = process.env.NEXT_PUBLIC_SUPABASE_REF!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const auth = req.headers.authorization || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing Authorization: Bearer <token>" });
  }

  const r = await fetch(`https://${REF}.functions.supabase.co/projectnew`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": auth },
    body: JSON.stringify(req.body ?? {})
  });

  const out = await r.json().catch(() => ({}));
  return res.status(r.status).json(out);
}
