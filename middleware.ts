import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const runtime = "nodejs";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "seusegredoseguro");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger apenas rotas do painel admin
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }
  // Para outras rotas, segue normalmente
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
}; 