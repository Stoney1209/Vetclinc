import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useMedicalRecords(petId: string) {
  return useQuery({
    queryKey: ['medical-records', petId],
    queryFn: () =>
      medicalRecordsApi.getByPet(petId).then((res) => res.data),
    enabled: !!petId,
  });
}

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: ['medical-record', id],
    queryFn: () => medicalRecordsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => medicalRecordsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Nota médica creada');
    },
    onError: () => {
      toast.error('Error al crear la nota médica');
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      medicalRecordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Nota médica actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la nota médica');
    },
  });
}
