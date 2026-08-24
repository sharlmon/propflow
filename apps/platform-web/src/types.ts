import { Role, PropertyType, UnitStatus, TicketStatus, TicketPriority, PaymentMethod } from './enums';

export { Role, PropertyType, UnitStatus, TicketStatus, TicketPriority, PaymentMethod };

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string; // Links to a Tenant record if role is TENANT
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  units: number;
  amenities: string[];
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  rentAmount: number;
  status: UnitStatus;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyId: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  balance: number;
  status: 'Active' | 'Late' | 'Pending';
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  unitId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  submittedAt: string;
  imageUrl?: string;
  vendorId?: string;
}

export interface FinancialRecord {
  id: string;
  propertyId: string;
  type: 'Income' | 'Expense';
  amount: number;
  date: string;
  category: string;
  description: string;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
}

export interface Vendor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  rating: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Normal' | 'Urgent';
}

export interface UtilityUsage {
  type: 'Water' | 'Electricity';
  currentReading: string;
  lastReading: string;
  status: 'Active' | 'Pending Disconnection';
}
