import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  subtitle?: string
  color?: 'rose' | 'blue' | 'green' | 'amber'
}

const colorMap = {
  rose: 'bg-rose-50 text-rose-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, color = 'rose' }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-2',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
          {subtitle && (
            <p className="text-xs mt-2 text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  )
}
