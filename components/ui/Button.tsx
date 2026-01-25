'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles = {
  primary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow active:bg-teal-800',
  secondary: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 hover:border-stone-300',
  ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
  outline: 'bg-transparent border border-teal-500 text-teal-600 hover:bg-teal-50',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClassName}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={combinedClassName} {...props}>
      {children}
    </button>
  )
}
