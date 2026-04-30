import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'conmunity.session-token',
  });

  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && (!token || token.role !== 'ADMIN')) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  if (pathname.startsWith('/auth/signin') && token?.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/signin'],
};

