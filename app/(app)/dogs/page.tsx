import { getAllDogs } from '@/lib/actions/dogs'
import { DogsPageClient } from './DogsPageClient'

/**
 * Dogs Page (Server Component)
 * Fetches all dogs and passes them to the client component for interactivity.
 * The client component handles the modal for viewing dog details.
 */
export default async function DogsPage() {
  const dogs = await getAllDogs()

  return <DogsPageClient dogs={dogs} />
}
