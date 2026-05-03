// api/config.js
// Safely exposes PUBLIC Supabase keys to the frontend
// SUPABASE_URL and SUPABASE_ANON_KEY are safe to use client-side
// (they're protected by Row Level Security — users can only see their own data)
// NEVER expose SUPABASE_SERVICE_ROLE_KEY or OPENAI_API_KEY here

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 hour

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(200).json({
      supabaseUrl: null,
      supabaseAnonKey: null,
      configured: false
    });
  }

  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
    configured: true
  });
}
