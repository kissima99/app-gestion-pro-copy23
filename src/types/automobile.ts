export interface Vehicle {
  id: string;
  type: 'voiture' | 'moto' | 'camion' | 'utilitaire';
  brand: string;
  model: string;
  year: number;
  registration: string;
  color: string;
  mileage: number;
  dailyRate: number;
  salePrice?: number;
  status: 'available' | 'rented' | 'sold' | 'maintenance';
  insuranceNumber?: string;
  technicalInspection?: string;
  purchaseDate: string;
  notes?: string;
}

export interface RentalContract {
  id: string;
  contractNumber: string;
  vehicleId: string;
  vehicleDetails: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyRate: number;
  totalAmount: number;
  deposit?: number;
  insuranceIncluded: boolean;
  additionalOptions?: string;
  status: 'active' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'partial';
  createdDate: string;
}

export interface SaleContract {
  id: string;
  contractNumber: string;
  vehicleId: string;
  vehicleDetails: string;
  sellerId: string;
  sellerName: string;
  buyerName: string;
  buyerPhone: string;
  buyerIdNumber: string;
  saleDate: string;
  salePrice: number;
  paymentMethod: 'cash' | 'transfer' | 'credit' | 'installment';
  deposit?: number;
  balance?: number;
  warrantyMonths?: number;
  status: 'draft' | 'completed' | 'cancelled';
  notes?: string;
  createdDate: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  idNumber: string;
  address: string;
  driverLicense?: string;
  clientType: 'individual' | 'company';
  companyName?: string;
  registrationDate: string;
  notes?: string;
}