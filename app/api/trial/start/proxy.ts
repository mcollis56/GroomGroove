import { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api (API routes)
     * - logo.png (App logo)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|api/|logo.png).*)',
  ],
}

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}
