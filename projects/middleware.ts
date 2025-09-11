import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the request is for a protected route
  if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/admin"))) {
    // Allow the login pages
    if (req.nextUrl.pathname === "/dashboard" || req.nextUrl.pathname === "/admin") {
      return res
    }

    // Redirect to the login page for other protected routes
    const redirectUrl = req.nextUrl.pathname.startsWith("/admin") ? "/admin" : "/dashboard"

    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
