import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, appointmentsConfirmApi } from '@/lib/api';
import { toast } from 'sonner';
import type { PaginationParams } from '@/types';

export function useAppointments(params?: PaginationParams) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: async () => {
      try {
        const res = await appointmentsApi.getAll(params);
        return res.data;
      } catch (error: any) {
        console.error('Appointments error:', error?.response?.status);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    },
  });
}

export function useCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['calendar', startDate, endDate],
    queryFn: () =>
      appointmentsApi.getCalendar(startDate, endDate).then((res) => res.data),
    enabled: !!startDate && !!endDate,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Cita creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear la cita');
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Cita actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la cita');
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Cita cancelada');
    },
    onError: () => {
      toast.error('Error al cancelar la cita');
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsConfirmApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Cita confirmada');
    },
    onError: () => {
      toast.error('Error al confirmar la cita');
    },
  });
}

export function useResendConfirmation() {
  return useMutation({
    mutationFn: (id: string) => appointmentsConfirmApi.resendConfirmation(id),
    onSuccess: () => {
      toast.success('Confirmación reenviada');
    },
    onError: () => {
      toast.error('Error al reenviar confirmación');
    },
  });
}
