import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refreshToken')?.value;

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Basic route protection based on role cookie (if we store it)
  // For strictly secure checks, we rely on the client-side RoleGate and backend API
  // but we can block /settings entirely if we know role isn't FLEET_MANAGER
  const role = request.cookies.get('role')?.value;
  if (request.nextUrl.pathname.startsWith('/settings') && role !== 'FLEET_MANAGER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
