export enum Role {
  LANDLORD = 'Landlord',
  TENANT = 'Tenant',
}

export enum PropertyType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  STUDENT = 'Student Housing',
}

export enum UnitStatus {
  OCCUPIED = 'Occupied',
  VACANT = 'Vacant',
  MAINTENANCE = 'Maintenance',
}

export enum TicketStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  COMPLETED = 'Completed',
  DEFERRED = 'Deferred',
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  EMERGENCY = 'Emergency',
}

export enum PaymentMethod {
  MPESA = 'M-Pesa',
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
}
