import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { Client, PaginatedResponse, CreateClientDto, UpdateClientDto, PaginationParams } from '@/types';

export function useClients(params?: PaginationParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsApi.getAll(params).then((res) => res.data),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      ErrorHandler.showSuccess('Cliente creado exitosamente');
      return response;
    },
    onError: (error) => {
      ErrorHandler.showError(error, 'Error al crear el cliente');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientDto }) =>
      clientsApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      ErrorHandler.showSuccess('Cliente actualizado');
      return response;
    },
    onError: (error) => {
      ErrorHandler.showError(error, 'Error al actualizar el cliente');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      ErrorHandler.showSuccess('Cliente eliminado');
      return response;
    },
    onError: (error) => {
      ErrorHandler.showError(error, 'Error al eliminar el cliente');
    },
  });
}
