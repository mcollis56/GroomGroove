import { Suspense } from 'react'
import { NewAppointmentForm } from './NewAppointmentForm'

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <NewAppointmentForm />
    </Suspense>
  )
}
