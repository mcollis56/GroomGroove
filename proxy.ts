import { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/_next',
    '/static',
    '/logo.png',
  ],
}

export async function proxy(request: NextRequest) {
  return updateSession(request)
}
