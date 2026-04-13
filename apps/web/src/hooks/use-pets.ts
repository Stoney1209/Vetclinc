import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petsApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Pet } from '@/types';

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: CreatePetPayload }) =>
      petsApi.create(clientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota agregada exitosamente');
    },
    onError: () => {
      toast.error('Error al agregar la mascota');
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Mascota eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la mascota');
    },
  });
}

export interface CreatePetPayload {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  weight?: number;
  microchip?: string;
}
