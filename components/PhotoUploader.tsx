'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Upload, Camera, X } from 'lucide-react'

export default function PhotoUploader({ dogs }: { dogs: any[] }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDogId, setSelectedDogId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const supabase = createClient()

  // Handle file selection (happens FIRST)
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setShowModal(true) // Show dog selection modal
  }

  // Handle upload (happens AFTER dog selection)
  const handleUpload = async () => {
    if (!selectedFile || !selectedDogId) return

    setUploading(true)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `${selectedDogId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dog-photos')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('dog-photos')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('dogs')
        .update({ photo_url: publicUrl })
        .eq('id', selectedDogId)

      if (updateError) throw updateError

      alert('✅ Photo uploaded successfully!')
      window.location.reload()
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setShowModal(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setSelectedDogId('')
  }

  return (
    <>
      {/* Always-Active Upload Buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-8 mb-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-blue-900">
            <Camera className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Add Dog Photos</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Upload photos from your computer or take new ones with your camera
          </p>
          
          <div className="flex gap-4 justify-center">
            {/* Upload from Files */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
              <div className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Photo
              </div>
            </label>

            {/* Take Photo */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelected}
                className="hidden"
              />
              <div className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Take Photo
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Modal: Select Dog AFTER Photo Chosen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Which dog is this?</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Photo Preview */}
            {previewUrl && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Dog Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dog
              </label>
              <select
                value={selectedDogId}
                onChange={(e) => setSelectedDogId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={uploading}
              >
                <option value="">Choose a dog...</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} {dog.customer_name ? `(${dog.customer_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedDogId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}