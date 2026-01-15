import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { BarChart3, TrendingUp, DollarSign, Calendar, Users, Dog } from 'lucide-react'

const mockReportData = {
  totalRevenue: 12450,
  monthlyGrowth: 15,
  totalAppointments: 156,
  avgPerAppointment: 79.81,
  topServices: [
    { name: 'Full Groom', count: 67, revenue: 5695 },
    { name: 'Bath & Brush', count: 45, revenue: 2025 },
    { name: 'Nail Trim', count: 32, revenue: 800 },
    { name: 'De-shedding', count: 12, revenue: 780 },
  ],
  monthlyData: [
    { month: 'Jan', revenue: 8200 },
    { month: 'Feb', revenue: 9100 },
    { month: 'Mar', revenue: 10500 },
    { month: 'Apr', revenue: 12450 },
  ],
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Business analytics and performance metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${mockReportData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={{ value: mockReportData.monthlyGrowth, label: 'vs last month' }}
        />
        <StatCard
          title="Appointments"
          value={mockReportData.totalAppointments}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Avg per Visit"
          value={`$${mockReportData.avgPerAppointment}`}
          icon={TrendingUp}
          color="rose"
        />
        <StatCard
          title="Active Humans"
          value={42}
          icon={Users}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Monthly Revenue
          </h3>
          <div className="space-y-3">
            {mockReportData.monthlyData.map((item) => (
              <div key={item.month} className="flex items-center gap-4">
                <span className="w-10 text-sm text-gray-500">{item.month}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.revenue / 15000) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">${item.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Services */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Dog className="w-5 h-5 text-rose-600" />
            Top Services
          </h3>
          <div className="space-y-3">
            {mockReportData.topServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{service.count} appointments</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">${service.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">89%</p>
            <p className="text-sm text-gray-500">Retention Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">4.8</p>
            <p className="text-sm text-gray-500">Avg Rating</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">23</p>
            <p className="text-sm text-gray-500">New Humans</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">1.2h</p>
            <p className="text-sm text-gray-500">Avg Service Time</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
