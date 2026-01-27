'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export function LiveClock() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Set initial time
    setTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }))

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Avoid hydration mismatch by rendering nothing until mounted
  if (!time) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col items-center justify-center h-full min-h-[160px]">
        <div className="animate-pulse bg-slate-100 h-8 w-24 rounded"></div>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-col items-center justify-center h-full min-h-[160px] relative overflow-hidden group hover:border-blue-400 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Clock className="w-24 h-24 text-blue-600 -rotate-12" />
      </div>

      <div className="z-10 text-center">
        <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
            {time}
        </div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            Sydney Time
        </div>
      </div>
    </div>
  )
}
