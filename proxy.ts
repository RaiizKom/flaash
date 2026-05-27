import { NextResponse, type NextRequest } from "next/server";

// TEMPORARY: proxy disabled to diagnose Vercel 404
// The full proxy with Supabase auth is in git history.
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|public|api/webhooks).*)",
  ],
};
