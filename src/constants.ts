export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' }, // Storing icon name string to avoid circular dependency or import issues if needed, but here we can just export the array and import icons in formatted file.
  // Actually, let's keep it simple and import icons in the component where used or re-export here if we import lucide.
  // The user code imported icon components directly into the constant array.
];

// Re-creating constants.ts based on user snippet
import { PropertyType, TicketStatus, TicketPriority, PaymentMethod } from './enums';
import type { Property, MaintenanceTicket, FinancialRecord, Vendor, Notice } from './types';
import { visibleRoutes } from './config/routes';

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    name: 'Amani Heights',
    type: PropertyType.RESIDENTIAL,
    address: 'Upper Hill, Nairobi',
    units: 48,
    amenities: ['Rooftop Pool', 'Smart Access', 'High-speed Elevators'],
  },
  {
    id: 'p2',
    name: 'Westlands Plaza',
    type: PropertyType.COMMERCIAL,
    address: 'Westlands, Nairobi',
    units: 12,
    amenities: ['24/7 Security', 'Fiber Optic', 'Ample Parking'],
  },
  {
    id: 'p3',
    name: 'Juja Student Suites',
    type: PropertyType.STUDENT,
    address: 'Near JKUAT, Juja',
    units: 120,
    amenities: ['Study Lounge', 'Laundry', 'Cafeteria'],
  },
];

export const MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 't1',
    propertyId: 'p1',
    unitId: 'A-101',
    title: 'Leaky Kitchen Faucet',
    description: 'The kitchen sink faucet has a persistent drip even when fully closed.',
    status: TicketStatus.PENDING,
    priority: TicketPriority.MEDIUM,
    submittedAt: '2024-05-18',
  },
  {
    id: 't2',
    propertyId: 'p1',
    unitId: 'B-205',
    title: 'Power Surge Issue',
    description: 'Tenant reported flickering lights in the living room after a heavy rain.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    submittedAt: '2024-05-19',
  },
];

export const FINANCIALS: FinancialRecord[] = [
  {
    id: 'f1',
    propertyId: 'p1',
    type: 'Income',
    amount: 845000,
    date: '2024-05-01',
    category: 'Rent',
    description: 'May Rent Collection - Amani Heights',
    paymentMethod: PaymentMethod.MPESA,
    transactionReference: 'RHE67T89QW',
  },
  {
    id: 'f2',
    propertyId: 'p1',
    type: 'Expense',
    amount: 45000,
    date: '2024-05-05',
    category: 'Maintenance',
    description: 'Pool Cleaning & Maintenance',
  },
  {
    id: 'f3',
    propertyId: 'p2',
    type: 'Income',
    amount: 1250000,
    date: '2024-05-01',
    category: 'Rent',
    description: 'Commercial Lease - Westlands Plaza',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    transactionReference: 'BANK-9921',
  },
];

export const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Nairobi Plumbers Ltd', specialty: 'Plumbing', phone: '254700111222', rating: 4.8 },
  { id: 'v2', name: 'Sparky Electricals', specialty: 'Electrical', phone: '254700333444', rating: 4.5 },
];

export const NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Scheduled Power Outage',
    content:
      'KPLC will conduct maintenance on June 2nd from 8 AM to 5 PM. Backup generator will support common areas only.',
    date: '2024-05-30',
    priority: 'Urgent',
  },
  {
    id: 'n2',
    title: 'Gym Equipment Upgrade',
    content:
      'New treadmills and weight racks are arriving this Friday. The gym will be closed for 4 hours during installation.',
    date: '2024-05-28',
    priority: 'Normal',
  },
];

export const NAV_ITEMS_FULL = visibleRoutes;
