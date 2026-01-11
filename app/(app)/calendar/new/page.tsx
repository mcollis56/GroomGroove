import { createClient } from '@/utils/supabase/server'
import { NewAppointmentForm } from './NewAppointmentForm'

interface Customer {
  id: string
  name: string
}

interface Dog {
  id: string
  name: string
  breed: string | null
  customer_id: string
}

export default async function NewAppointmentPage() {
  const supabase = await createClient()

  // Fetch customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name')
    .order('name')

  // Fetch dogs with their customer_id
  const { data: dogs } = await supabase
    .from('dogs')
    .select('id, name, breed, customer_id')
    .order('name')

  return (
    <NewAppointmentForm
      customers={(customers || []) as Customer[]}
      dogs={(dogs || []) as Dog[]}
    />
  )
}
