'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: React.ReactNode
}

const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200'

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
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
    // When href is provided, render as Link
    // Don't pass button-specific props to Link
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
