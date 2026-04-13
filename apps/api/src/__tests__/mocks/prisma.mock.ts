import { PrismaClient, Role, AppointmentType, AppointmentStatus } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';

export type PrismaMock = DeepMockProxy<PrismaClient>;

export const createPrismaMock = (): PrismaMock => {
  return mockDeep<PrismaClient>();
};

export const resetPrismaMock = (prismaMock: PrismaMock): void => {
  mockReset(prismaMock);
};

export const createMockUser = (overrides: Partial<any> = {}): any => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: '$2b$10$hashedpassword',
  role: Role.ADMIN,
  specialty: null,
  licenseNumber: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockClient = (overrides: Partial<any> = {}): any => ({
  id: 'test-client-id',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '5551234567',
  address: 'Calle 123',
  rfc: 'XAXX010101XXX',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  pets: [],
  ...overrides,
});

export const createMockProduct = (overrides: Partial<any> = {}): any => ({
  id: 'test-product-id',
  name: 'Producto Test',
  sku: 'TEST-001',
  description: 'Descripción test',
  price: 100,
  cost: 50,
  stock: 20,
  minStock: 5,
  categoryId: 'test-category-id',
  expiryDate: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAppointment = (overrides: Partial<any> = {}): any => ({
  id: 'test-appointment-id',
  dateTime: new Date(),
  duration: 30,
  type: AppointmentType.CONSULTATION,
  status: AppointmentStatus.SCHEDULED,
  notes: 'Test notes',
  colorCode: '#3b82f6',
  petId: 'test-pet-id',
  doctorId: 'test-doctor-id',
  roomId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockSale = (overrides: Partial<any> = {}): any => ({
  id: 'test-sale-id',
  total: 100,
  paymentMethod: 'CASH',
  subtotal: 86.21,
  tax: 13.79,
  clientId: 'test-client-id',
  userId: 'test-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
  ...overrides,
});

export const createMockPet = (overrides: Partial<any> = {}): any => ({
  id: 'test-pet-id',
  name: 'Fido',
  species: 'DOG',
  breed: 'Labrador',
  dateOfBirth: new Date('2020-01-01'),
  gender: 'MALE',
  color: 'Golden',
  weight: 25.5,
  microchip: '123456789',
  photoUrl: null,
  notes: 'Test pet',
  clientId: 'test-client-id',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockMedicalRecord = (overrides: Partial<any> = {}): any => ({
  id: 'test-record-id',
  petId: 'test-pet-id',
  veterinarianId: 'test-doctor-id',
  appointmentId: 'test-appointment-id',
  subjective: 'Patient appears healthy',
  objective: 'Vital signs normal',
  assessment: 'Good health',
  plan: 'Continue monitoring',
  diagnosis: 'Healthy',
  treatment: 'None required',
  recordDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockRoom = (overrides: Partial<any> = {}): any => ({
  id: 'test-room-id',
  name: 'Sala 1',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
