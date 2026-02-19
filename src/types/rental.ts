export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  telephone: string;
  commissionRate: number;
}

export interface Agency {
  name: string;
  ownerName?: string; // Nom du propriétaire de l'agence
  address: string;
  phone: string;
  email: string;
  ninea: string;
  rccm: string;
  logoUrl?: string;
  commissionRate: number;
}

export interface Tenant {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  unitName: string;
  roomsCount: number;
  idNumber: string;
  rentAmount: number;
  status: 'active' | 'terminated';
  startDate: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  tenantId: string;
  tenantName: string;
  paymentDate: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  unitName: string;
  propertyAddress: string;
  ownerId?: string;
}

export interface Expense {
  id: string;
  ownerId: string;
  description: string;
  amount: number;
  date: string;
  category: 'reparation' | 'taxe' | 'autre';
}

export interface Arrear {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  month: string;
  description: string;
  dateAdded: string;
}