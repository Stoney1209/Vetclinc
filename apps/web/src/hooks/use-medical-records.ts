import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsApi } from '@/lib/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { CreateMedicalRecordDto, UpdateMedicalRecordDto, ApiError } from '@/types';

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
    mutationFn: (data: CreateMedicalRecordDto) => medicalRecordsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Nota médica creada');
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message || 'Error al crear la nota médica');
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMedicalRecordDto }) =>
      medicalRecordsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Nota médica actualizada');
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.message || 'Error al actualizar la nota médica');
    },
  });
}
