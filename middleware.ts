cat <<EOF > middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Pass the request to Supabase to update the session
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclude static assets, images, and API routes from middleware processing
    '/((?!_next/static|_next/image|favicon.ico|images/|api/).*)',
  ],
}
EOF
