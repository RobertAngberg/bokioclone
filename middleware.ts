import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Skapa middleware funktionen
const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Auth routes - tillåt alltid
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public routes som inte behöver auth
  const publicRoutes = ["/"];
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Om inte inloggad och försöker komma åt skyddad sida
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
  }

  // Om inloggad och på public route, redirecta till dashboard
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/faktura", nextUrl));
  }

  return NextResponse.next();
});

// Exportera som både default och named export
export default authMiddleware;
export const middleware = authMiddleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
