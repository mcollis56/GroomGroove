import { getGroomers } from '@/lib/actions/groomers'
import { GroomersPageClient } from './GroomersPageClient'

export default async function GroomersPage() {
  const groomers = await getGroomers()

  return <GroomersPageClient initialGroomers={groomers} />
}
