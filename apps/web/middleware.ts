import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from './lib/auth';
import { ROLE_ROUTES, ROUTE_ROLES } from './lib/routes';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = await getRequestUser(req);

  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL(ROLE_ROUTES[user.role], req.url));
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const rule = ROUTE_ROLES.find(({ prefix }) => pathname.startsWith(prefix));
  if (rule && !rule.roles.includes(user.role)) {
    return NextResponse.redirect(new URL(ROLE_ROUTES[user.role], req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
