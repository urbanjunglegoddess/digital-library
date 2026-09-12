import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /auth/signout — ends the session and returns to the home page.
 *
 * POST rather than GET on purpose: a GET sign-out can be triggered by any
 * image or link on another site, and by a prefetch of our own nav.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 303,
  });
}
