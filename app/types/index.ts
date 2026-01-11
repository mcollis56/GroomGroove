export type Dog = {
  id: string
  created_at: string
  owner_name: string
  owner_phone: string | null
  owner_email: string | null
  dog_name: string
  breed: string | null
  clipper_blade_size: string | null
  nail_clipper_size: string | null
  grooming_notes: string | null
  behavioral_notes: string | null
  user_id: string
}

export type Appointment = {
  id: string
  created_at: string
  dog_id: string
  start_time: string
  service_type: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes: string | null
  user_id: string
  dogs?: Dog // For joining data
}
