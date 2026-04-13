import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsApi, medicalRecordsFollowUpApi } from '@/lib/api';
import { toast } from 'sonner';
import type { CreatePrescriptionDto, ScheduleFollowUpDto } from '@/types';

export function usePrescriptions(recordId: string) {
  return useQuery({
    queryKey: ['prescriptions', recordId],
    queryFn: () => prescriptionsApi.getByMedicalRecord(recordId).then((res) => res.data),
    enabled: !!recordId,
  });
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionsApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrescriptionDto) => prescriptionsApi.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', variables.medicalRecordId] });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      toast.success('Prescripción creada');
    },
    onError: () => {
      toast.error('Error al crear la prescripción');
    },
  });
}

export function useScheduleFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: ScheduleFollowUpDto }) =>
      medicalRecordsFollowUpApi.scheduleFollowUp(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      toast.success('Seguimiento programado');
    },
    onError: () => {
      toast.error('Error al programar seguimiento');
    },
  });
}

export function useUpcomingFollowUps() {
  return useQuery({
    queryKey: ['follow-ups'],
    queryFn: async () => {
      try {
        const res = await medicalRecordsFollowUpApi.getUpcoming();
        return res.data;
      } catch (error: any) {
        console.error('Follow-ups error:', error?.response?.status);
        return [];
      }
    },
  });
}
