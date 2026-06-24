import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdmin = user?.email === "admin@slam-global.com";
  const protectedPaths = ["/dashboard", "/mypage"];

  if ([...protectedPaths, "/admin"].some((p) => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin") && user && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if ((pathname === "/" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/signup", "/dashboard/:path*", "/mypage/:path*", "/admin", "/admin/:path*"],
};
