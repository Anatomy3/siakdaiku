// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware for static files and API routes
  if (path === '/api/login' || path === '/api/logout' || path === '/api/dashboard') {
    return NextResponse.next();
  }

  // Skip middleware for static assets
  if (
    path.startsWith('/_next') ||
    path.includes('/daiku/') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.svg') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  const userId = request.cookies.get('userId')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Handle login route
  if (path === '/login') {
    if (userId) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!userId && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle admin-only routes
  const adminOnlyRoutes = ['/kelola_karyawan'];
  if (adminOnlyRoutes.includes(path)) {
    if (userRole !== 'admin' && userRole !== 'karyawan dan admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder files (like images)
    '/((?!api|_next/static|_next/image|favicon.ico|daiku|assets|public).*)',
  ],
};