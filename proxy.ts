import { updateSession } from '../utils/supabase/middleware'

export default function proxy(req) {
  return updateSession(req)
}
