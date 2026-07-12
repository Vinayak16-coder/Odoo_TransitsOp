import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check for the httpOnly refresh cookie.
  // If it's not present, the user is definitely not logged in.
  const refreshToken = request.cookies.get('refreshToken');
  
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Basic route protection based on role cookie (if we store it)
  // For strictly secure checks, we rely on the client-side RoleGate and backend API
  // but we can block /settings entirely if we know role isn't FLEET_MANAGER
  const role = request.cookies.get('role')?.value;
  if (pathname.startsWith('/settings') && role !== 'FLEET_MANAGER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
