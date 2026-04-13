import axios from 'axios';
import type {
  Client,
  Pet,
  Appointment,
  MedicalRecord,
  Product,
  Sale,
  Category,
  User,
  PaginatedResponse,
  DailySummary,
  CreateClientDto,
  UpdateClientDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateSaleDto,
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
  CreateCategoryDto,
  CreatePetDto,
  UpdatePetDto,
  AddWeightDto,
  AddVaccinationDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  CreateUserDto,
  UpdateUserDto,
  PaginationParams,
  Prescription,
  CreatePrescriptionDto,
  ScheduleFollowUpDto,
  DashboardKPIs,
  RevenueByDay,
  AppointmentsByType,
} from '@/types';

let redirectHandler: (url: string) => void = (url) => {
  if (typeof window !== 'undefined') window.location.href = url;
};

export const setRedirectHandler = (handler: (url: string) => void) => {
  redirectHandler = handler;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Evitar loop en la ruta de refresh
    if (originalRequest.url === '/auth/refresh') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        redirectHandler('/login');
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) {
          throw new Error('No refresh token exists');
        }

        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        
        processQueue(null, data.accessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          redirectHandler('/login');
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password }),
  register: (data: CreateUserDto) => api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', data),
  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get<User>('/auth/profile'),
};

export const usersApi = {
  getAll: () => api.get<PaginatedResponse<User>>('/users'),
  getVeterinarians: () => api.get<User[]>('/users/veterinarians'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: string, data: UpdateUserDto) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const clientsApi = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Client>>('/clients', { params }),
  getById: (id: string) => api.get<Client>(`/clients/${id}`),
  create: (data: CreateClientDto) => api.post<Client>('/clients', data),
  update: (id: string, data: UpdateClientDto) => api.patch<Client>(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const petsApi = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Pet>>('/pets', { params }),
  getById: (id: string) => api.get<Pet>(`/pets/${id}`),
  create: (clientId: string, data: CreatePetDto) =>
    api.post<Pet>(`/pets/client/${clientId}`, data),
  update: (id: string, data: UpdatePetDto) => api.patch<Pet>(`/pets/${id}`, data),
  addWeight: (id: string, data: AddWeightDto) => api.post(`/pets/${id}/weight`, data),
  getVaccinations: (id: string) => api.get(`/pets/${id}/vaccinations`),
  addVaccination: (id: string, data: AddVaccinationDto) =>
    api.post(`/pets/${id}/vaccinations`, data),
  delete: (id: string) => api.delete(`/pets/${id}`),
};

export const appointmentsApi = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Appointment>>('/appointments', { params }),
  getCalendar: (startDate: string, endDate: string) =>
    api.get<Appointment[]>('/appointments/calendar', { params: { startDate, endDate } }),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: CreateAppointmentDto) => api.post<Appointment>('/appointments', data),
  update: (id: string, data: UpdateAppointmentDto) => api.patch<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

export const medicalRecordsApi = {
  getByPet: (petId: string) => api.get<MedicalRecord[]>(`/medical-records/pet/${petId}`),
  getById: (id: string) => api.get<MedicalRecord>(`/medical-records/${id}`),
  create: (data: CreateMedicalRecordDto) => api.post<MedicalRecord>('/medical-records', data),
  update: (id: string, data: UpdateMedicalRecordDto) => api.patch<MedicalRecord>(`/medical-records/${id}`, data),
};

export const inventoryApi = {
  getAll: (params?: PaginationParams) =>
    api.get<PaginatedResponse<Product>>('/inventory', { params }),
  getLowStock: () => api.get<Product[]>('/inventory/low-stock'),
  getExpiring: (days?: number) =>
    api.get<Product[]>('/inventory/expiring', { params: { days } }),
  getCategories: () => api.get<Category[]>('/inventory/categories'),
  getById: (id: string) => api.get<Product>(`/inventory/${id}`),
  create: (data: CreateProductDto) => api.post<Product>('/inventory', data),
  update: (id: string, data: UpdateProductDto) => api.patch<Product>(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  adjustStock: (id: string, data: AdjustStockDto) =>
    api.patch(`/inventory/${id}/adjust-stock`, data),
  createCategory: (data: CreateCategoryDto) => api.post<Category>('/inventory/categories', data),
};

export const salesApi = {
  getAll: (params?: PaginationParams) => api.get<PaginatedResponse<Sale>>('/sales', { params }),
  getDailySummary: (date?: string) =>
    api.get<DailySummary>('/sales/daily-summary', { params: { date } }),
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (data: CreateSaleDto) => api.post<Sale>('/sales', data),
  cancel: (id: string) => api.patch<Sale>(`/sales/${id}/cancel`),
};

export const prescriptionsApi = {
  create: (data: CreatePrescriptionDto) => api.post<Prescription>('/prescriptions', data),
  getByMedicalRecord: (recordId: string) =>
    api.get<Prescription[]>(`/prescriptions/medical-record/${recordId}`),
  getById: (id: string) => api.get<Prescription>(`/prescriptions/${id}`),
};

export const medicalRecordsFollowUpApi = {
  scheduleFollowUp: (recordId: string, data: ScheduleFollowUpDto) =>
    api.patch(`/medical-records/${recordId}/follow-up`, data),
  getUpcoming: () =>
    api.get('/medical-records/follow-ups/upcoming'),
};

export const appointmentsConfirmApi = {
  confirm: (id: string) => api.post(`/appointments/${id}/confirm`),
  resendConfirmation: (id: string) => api.post(`/appointments/${id}/resend-confirmation`),
};

export const reportsApi = {
  getDashboardKPIs: () => api.get<DashboardKPIs>('/reports/dashboard'),
  getRevenue: (days?: number) =>
    api.get<RevenueByDay[]>('/reports/revenue', { params: { days } }),
  getAppointmentsByType: (days?: number) =>
    api.get<AppointmentsByType[]>('/reports/appointments-by-type', { params: { days } }),
};
