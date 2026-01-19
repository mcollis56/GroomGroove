"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form State
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (data) {
        setBusinessName(data.business_name || "")
        setEmail(data.contact_email || "")
        setPhone(data.phone || "")
        setAddress(data.address || "")
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("business_settings")
      .upsert({
        user_id: user.id,
        business_name: businessName,
        contact_email: email,
        phone: phone,
        address: address,
        updated_at: new Date().toISOString()
      })

    setSaving(false)
    if (error) {
      alert("Error saving settings: " + error.message)
    } else {
      alert("Settings saved!")
    }
  }

  if (loading) return <div className="p-8">Loading settings...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Business Settings</h1>
      
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input 
            value={businessName} 
            onChange={(e) => setBusinessName(e.target.value)} 
            placeholder="My Grooming Salon" 
          />
        </div>

        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="hello@salon.com" 
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="(555) 123-4567" 
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="123 Dog St..." 
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
