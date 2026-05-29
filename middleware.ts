// Middleware disabled — @supabase/ssr is incompatible with Vercel Edge Runtime.
// Session refresh is handled directly in each Server Component via createClient().
export const config = { matcher: [] };
