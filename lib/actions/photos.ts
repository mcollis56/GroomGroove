'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Upload a dog photo to Supabase Storage and update the dog record
 */
export async function uploadDogPhoto(
  dogId: string,
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient()

  const file = formData.get('photo') as File
  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' }
  }

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${dogId}-${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('dog-photos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) {
    console.error('[Photos] Upload failed:', uploadError)
    return { 
      success: false, 
      error: `Failed to upload photo: ${uploadError.message || 'Please try again.'}` 
    }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('dog-photos')
    .getPublicUrl(filename)

  const photoUrl = urlData.publicUrl

  // Update dog record with photo URL
  const { error: updateError } = await supabase
    .from('dogs')
    .update({
      photo_url: photoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', dogId)

  if (updateError) {
    console.error('[Photos] Update dog failed:', updateError)
    // Try to clean up uploaded file
    await supabase.storage.from('dog-photos').remove([filename])
    return { success: false, error: 'Failed to update dog record.' }
  }

  revalidatePath(`/dogs/${dogId}`)
  revalidatePath('/dogs')
  revalidatePath('/photos')

  return { success: true, url: photoUrl }
}

/**
 * Delete a dog's photo
 */
export async function deleteDogPhoto(
  dogId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current photo URL
  const { data: dog, error: fetchError } = await supabase
    .from('dogs')
    .select('photo_url')
    .eq('id', dogId)
    .single()

  if (fetchError || !dog?.photo_url) {
    return { success: false, error: 'No photo to delete' }
  }

  // Extract filename from URL
  const url = new URL(dog.photo_url)
  const filename = url.pathname.split('/').pop()

  if (filename) {
    // Delete from storage
    await supabase.storage.from('dog-photos').remove([filename])
  }

  // Clear photo_url from dog record
  const { error: updateError } = await supabase
    .from('dogs')
    .update({
      photo_url: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', dogId)

  if (updateError) {
    console.error('[Photos] Clear photo_url failed:', updateError)
    return { success: false, error: 'Failed to update dog record.' }
  }

  revalidatePath(`/dogs/${dogId}`)
  revalidatePath('/dogs')
  revalidatePath('/photos')

  return { success: true }
}

/**
 * Get all dogs with photos for the pin board
 */
export async function getDogsWithPhotos(): Promise<{
  id: string
  name: string
  breed: string | null
  photo_url: string
  customer_name: string | null
}[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dogs')
    .select(`
      id,
      name,
      breed,
      photo_url,
      customer:customers(name)
    `)
    .not('photo_url', 'is', null)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[Photos] Fetch dogs with photos failed:', error)
    return []
  }

  return (data || []).map(dog => ({
    id: dog.id,
    name: dog.name,
    breed: dog.breed,
    photo_url: dog.photo_url!,
    customer_name: Array.isArray(dog.customer) ? dog.customer[0]?.name : (dog.customer as { name: string } | null)?.name || null
  }))
}
