import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { AlertTriangle, Clock } from 'lucide-react'
import type { WatchlistItem } from '@/lib/actions/dashboard'

interface TodaysWatchlistProps {
  items: WatchlistItem[]
}

export function TodaysWatchlist({ items }: TodaysWatchlistProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>⚠️</span> Today&apos;s Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No dogs requiring special attention today</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>⚠️</span> Today&apos;s Watchlist
        </CardTitle>
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
          {items.length} {items.length === 1 ? 'dog' : 'dogs'}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              href={`/dogs/${item.dogId}`}
              key={item.appointmentId}
              className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <div className="p-1.5 bg-amber-100 rounded-md mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {item.dogName}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </div>
                </div>
                <p className="text-sm text-amber-700 mt-0.5">
                  {item.reason}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
