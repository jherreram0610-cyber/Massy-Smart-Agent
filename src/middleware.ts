import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/login",
  "/api/agent/message",
  "/api/webhooks/meta",
  "/api/webhooks/mercadolibre",
  "/api/slots",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublic) return NextResponse.next();

  const isPanelRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/knowledge-base") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/leads") ||
    pathname.startsWith("/api/appointments") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/knowledge-base") ||
    pathname.startsWith("/api/crm");

  if (!isPanelRoute) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|widget.js).*)",
  ],
};
