'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'

const variantStyles = {
  primary: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow active:bg-rose-700',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  outline: 'bg-transparent border border-rose-500 text-rose-500 hover:bg-rose-50',
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
