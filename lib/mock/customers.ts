// Mock data for customers - will be replaced with real DB calls later

export const mockCustomerStats = {
  totalCustomers: 32,
  activeThisMonth: 18,
  avgSpendPerCustomer: 86.40,
}

export const mockCustomers = [
  {
    id: '1',
    name: 'Sarah Miller',
    email: 'sarah@email.com',
    phone: '(555) 123-4567',
    dogs: ['Bella'],
    lastVisit: 'Jan 6',
    lifetimeSpend: 420,
    customerSince: 'Aug 2024',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'John Davis',
    email: 'john@email.com',
    phone: '(555) 234-5678',
    dogs: ['Max', 'Rocky'],
    lastVisit: 'Jan 3',
    lifetimeSpend: 780,
    customerSince: 'Mar 2024',
    status: 'vip' as const,
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@email.com',
    phone: '(555) 345-6789',
    dogs: ['Luna'],
    lastVisit: 'Dec 18',
    lifetimeSpend: 95,
    customerSince: 'Dec 2024',
    status: 'inactive' as const,
  },
  {
    id: '4',
    name: 'Mike Chen',
    email: 'mike@email.com',
    phone: '(555) 456-7890',
    dogs: ['Max'],
    lastVisit: 'Jan 3',
    lifetimeSpend: 340,
    customerSince: 'Jun 2024',
    status: 'active' as const,
  },
  {
    id: '5',
    name: 'Emma Wilson',
    email: 'emma@email.com',
    phone: '(555) 567-8901',
    dogs: ['Daisy'],
    lastVisit: 'Jan 7',
    lifetimeSpend: 620,
    customerSince: 'Apr 2024',
    status: 'vip' as const,
  },
]

export type Customer = typeof mockCustomers[number]
export type CustomerStatus = 'active' | 'vip' | 'inactive'
