'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0A] text-center px-4 transition-opacity duration-700">
      <div className="space-y-4">
        <div className="mx-auto w-28 h-28 rounded-2xl bg-[#0A0A0A] border border-[#D4AF37]/30 flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20">
          <svg viewBox="0 0 512 512" className="w-20 h-20">
            <defs>
              <linearGradient id="gold-s" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9F1D5"/>
                <stop offset="40%" stopColor="#D4AF37"/>
                <stop offset="100%" stopColor="#996515"/>
              </linearGradient>
            </defs>
            <path d="M155 215 C 190 170, 310 170, 355 210 C 330 230, 240 220, 180 240 C 130 255, 140 310, 200 315 C 270 320, 335 285, 365 255" fill="none" stroke="url(#gold-s)" stroke-width="22" stroke-linecap="round"/>
            <path d="M135 295 C 180 345, 320 355, 395 285" fill="none" stroke="url(#gold-s)" stroke-width="12" stroke-linecap="round"/>
            <circle cx="403" cy="275" r="5" fill="url(#gold-s)"/>
            <circle cx="413" cy="264" r="4" fill="url(#gold-s)"/>
            <circle cx="421" cy="253" r="3" fill="url(#gold-s)"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-[#D4AF37]">
            Shahriar Enterprise
          </h1>
          <p className="text-[11px] tracking-wide text-neutral-400 mt-1">
            Govt. Enlisted ABC Contractor Builders, Suppliers
          </p>
        </div>
      </div>
    </div>
  )
}
