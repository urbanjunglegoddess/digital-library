import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Keeps the Supabase auth session fresh (see lib/supabase/middleware.ts) and
 * redirects signed-out visitors away from account-only routes.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Everything except the paths that never need a session:
     *   _next/static, _next/image  — build output
     *   favicon / common assets    — static files
     * Auth cookies must still be refreshed on API routes, so those are matched.
     */
    "/((?!_next/static|_next/image|favicon.ico|playgrounds/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|css|js|map)$).*)",
  ],
};
