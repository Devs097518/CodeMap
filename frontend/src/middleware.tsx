import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const { pathname } = req.nextUrl

  if (!token) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const role = payload.role as string


    if (pathname.startsWith('/login') || pathname.startsWith('/cadastro')) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/staff/inicio', req.url))
      }
      return NextResponse.redirect(new URL('/dashboard/user/inicio', req.url))
    }

    if (pathname.startsWith('/dashboard/staff') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/user/inicio', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/cadastro'],
}