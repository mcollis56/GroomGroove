'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AlertCircle, Dog, User } from 'lucide-react'
import { createClientWithDog } from '@/lib/actions/client-intake'

const formSchema = z.object({
  owner: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  }),
  dog: z.object({
    name: z.string().min(1, 'Dog name is required'),
    breed: z.string().optional().or(z.literal('')),
    weight: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
  }),
})

type FormState = z.infer<typeof formSchema>

const defaultState: FormState = {
  owner: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  },
  dog: {
    name: '',
    breed: '',
    weight: '',
    notes: '',
  },
}

export default function NewClientForm() {
  const router = useRouter()
  const [formState, setFormState] = useState<FormState>(defaultState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setField = (
    path: keyof FormState,
    field: keyof FormState['owner'] | keyof FormState['dog'],
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [path]: {
        ...prev[path],
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const parsed = formSchema.safeParse(formState)
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        nextErrors[path] = issue.message
      })
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createClientWithDog({
        owner: {
          firstName: parsed.data.owner.firstName,
          lastName: parsed.data.owner.lastName,
          phone: parsed.data.owner.phone,
          email: parsed.data.owner.email || undefined,
        },
        dog: {
          name: parsed.data.dog.name,
          breed: parsed.data.dog.breed || undefined,
          weight: parsed.data.dog.weight || undefined,
          notes: parsed.data.dog.notes || undefined,
        },
      })

      if (result.success) {
        if (result.dogId) {
          router.push(`/dogs/${result.dogId}`)
        } else {
          router.push('/dashboard')
        }
        return
      }

      setErrors({ form: result.error || 'Unable to create client' })
      setIsSubmitting(false)
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : 'Unable to create client',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Client</h1>
        <p className="text-gray-500">Add a client and their first dog in one step.</p>
      </div>

      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm">{errors.form}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    value={formState.owner.firstName}
                    onChange={(event) => setField('owner', 'firstName', event.target.value)}
                    placeholder="Jamie"
                  />
                  {errors['owner.firstName'] && (
                    <p className="text-xs text-red-500">{errors['owner.firstName']}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    value={formState.owner.lastName}
                    onChange={(event) => setField('owner', 'lastName', event.target.value)}
                    placeholder="Taylor"
                  />
                  {errors['owner.lastName'] && (
                    <p className="text-xs text-red-500">{errors['owner.lastName']}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input
                    value={formState.owner.phone}
                    onChange={(event) => setField('owner', 'phone', event.target.value)}
                    placeholder="0400 000 000"
                  />
                  {errors['owner.phone'] && (
                    <p className="text-xs text-red-500">{errors['owner.phone']}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={formState.owner.email ?? ''}
                    onChange={(event) => setField('owner', 'email', event.target.value)}
                    placeholder="jamie@example.com"
                  />
                  {errors['owner.email'] && (
                    <p className="text-xs text-red-500">{errors['owner.email']}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Dog className="w-5 h-5" />
                Dog Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Dog Name</label>
                  <Input
                    value={formState.dog.name}
                    onChange={(event) => setField('dog', 'name', event.target.value)}
                    placeholder="Luna"
                  />
                  {errors['dog.name'] && (
                    <p className="text-xs text-red-500">{errors['dog.name']}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Breed</label>
                  <Input
                    value={formState.dog.breed ?? ''}
                    onChange={(event) => setField('dog', 'breed', event.target.value)}
                    placeholder="Border Collie"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <Input
                    type="number"
                    value={formState.dog.weight ?? ''}
                    onChange={(event) => setField('dog', 'weight', event.target.value)}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <Textarea
                    value={formState.dog.notes ?? ''}
                    onChange={(event) => setField('dog', 'notes', event.target.value)}
                    placeholder="Temperament, allergies, grooming notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-gray-900">Save Client</h3>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create Client'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  )
}
