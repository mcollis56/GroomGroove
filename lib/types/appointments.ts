// Database types for appointment confirmation system
// These match the approved schema from STEP 1

export type AppointmentStatus = 'pending_confirmation' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface Appointment {
  id: string
  customer_id: string
  dog_id: string
  scheduled_at: string // ISO datetime
  status: AppointmentStatus
  services: string[]
  notes?: string
  created_at: string
  updated_at: string
  confirmed_at?: string
  cancelled_at?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  sms_consent: boolean
}

export interface Dog {
  id: string
  customer_id: string
  name: string
  breed?: string
  notes?: string
}

export interface Payment {
  id: string
  customer_id: string
  appointment_id?: string // The completed appointment
  next_appointment_id?: string // The proposed next appointment
  amount_cents: number
  services: string[]
  paid_at: string
  receipt_number: string
}

export type SMSNotificationType = 'confirmation_request' | 'reminder'

export interface SMSNotification {
  id: string
  appointment_id: string
  type: SMSNotificationType
  sent_at: string
  delivered: boolean
  customer_response?: 'YES' | 'NO'
  response_at?: string
}

// Joined types for queries
export interface AppointmentWithRelations extends Appointment {
  customer: Customer
  dog: Dog
}

export interface PaymentWithRelations extends Payment {
  customer: Customer
  appointment?: Appointment
  next_appointment?: Appointment
}
