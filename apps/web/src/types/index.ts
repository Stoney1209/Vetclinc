export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST' | 'INVENTORY_MANAGER';
  specialty?: string;
  licenseNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  rfc?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pets?: Pet[];
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
  gender?: string;
  color?: string;
  weight?: number;
  microchip?: string;
  photoUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  client?: Pick<Client, 'id' | 'firstName' | 'lastName' | 'phone'>;
  vaccinations?: Vaccination[];
  weightHistory?: WeightRecord[];
  medicalRecords?: MedicalRecord[];
}

export interface Vaccination {
  id: string;
  vaccineName: string;
  batch?: string;
  applicationDate: string;
  nextDueDate?: string;
  veterinarian?: string;
  notes?: string;
  petId: string;
}

export interface WeightRecord {
  id: string;
  weight: number;
  recordedAt: string;
  notes?: string;
  petId: string;
}

export interface Appointment {
  id: string;
  dateTime: string;
  duration: number;
  type: 'CONSULTATION' | 'URGENCY' | 'SURGERY' | 'VACCINATION' | 'GROOMING';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  colorCode?: string;
  petId: string;
  doctorId: string;
  roomId?: string;
  pet: Pet & { client: Pick<Client, 'id' | 'firstName' | 'lastName'> };
  doctor: Pick<User, 'id' | 'firstName' | 'lastName'>;
  confirmedAt?: string;
  confirmationChannel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  recordDate: string;
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
  followUpNotes?: string;
  dischargedAt?: string;
  petId: string;
  veterinarianId: string;
  pet?: Pet;
  veterinarian?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  attachments?: Attachment[];
  prescriptions?: Prescription[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  medicalRecordId: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  batch?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  imageUrl?: string;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  status: string;
  clientId?: string;
  client?: Pick<Client, 'id' | 'firstName' | 'lastName'>;
  userId: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  items: SaleItem[];
  createdAt: string;
}

export interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  saleId: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'sku'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalTax: number;
  totalItems: number;
  salesCount: number;
  salesByPayment: Record<string, number>;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  rfc?: string;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {}

export interface CreateAppointmentDto {
  petId: string;
  doctorId: string;
  dateTime: string;
  duration: number;
  type: string;
  notes?: string;
}

export interface CreateSaleDto {
  clientId?: string;
  paymentMethod?: string;
  items: { productId: string; quantity: number }[];
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  categoryId: string;
  expiryDate?: string;
  batch?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface AdjustStockDto {
  quantity: number;
  reason?: string;
}

export interface CreateCategoryDto {
  name: string;
  type: string;
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

export interface CreatePetDto {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  weight?: number;
  microchip?: string;
  color?: string;
  dateOfBirth?: string;
}

export interface UpdatePetDto extends Partial<CreatePetDto> {}

export interface AddWeightDto {
  weight: number;
  notes?: string;
}

export interface AddVaccinationDto {
  vaccineName: string;
  batch?: string;
  applicationDate: string;
  nextDueDate?: string;
  veterinarian?: string;
  notes?: string;
}

export interface CreateMedicalRecordDto {
  petId: string;
  appointmentId?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  diagnosis?: string;
  treatment?: string;
}

export interface UpdateMedicalRecordDto extends Partial<CreateMedicalRecordDto> {}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'VETERINARIAN' | 'RECEPTIONIST' | 'INVENTORY_MANAGER';
  specialty?: string;
  licenseNumber?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  specialty?: string;
  licenseNumber?: string;
  isActive?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

export interface PrescriptionItem {
  id: string;
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  productId?: string;
  product?: { id: string; name: string; sku: string };
}

export interface Prescription {
  id: string;
  notes?: string;
  medicalRecordId: string;
  veterinarianId: string;
  veterinarian: { id: string; firstName: string; lastName: string };
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionItemDto {
  productName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  productId?: string;
}

export interface CreatePrescriptionDto {
  medicalRecordId: string;
  notes?: string;
  items: CreatePrescriptionItemDto[];
}

export interface ScheduleFollowUpDto {
  followUpDate: string;
  followUpNotes?: string;
}

export interface DashboardKPIs {
  appointments: { today: number; yesterday: number; delta: number };
  revenue: { currentMonth: number; previousMonth: number; delta: number };
  clients: { newThisMonth: number; total: number };
  noShowRate: { rate: number; noShows: number; completed: number };
  followUps: { pending: number };
  confirmation: { unconfirmed: number };
}

export interface RevenueByDay {
  date: string;
  total: number;
}

export interface AppointmentsByType {
  type: string;
  count: number;
}
