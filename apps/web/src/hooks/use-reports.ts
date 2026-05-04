import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => reportsApi.getDashboardKPIs().then((res) => res.data),
    refetchInterval: 60000,
    retry: 1,
    throwOnError: false,
  });
}

export function useRevenueByDay(days?: number) {
  return useQuery({
    queryKey: ['revenue-by-day', days],
    queryFn: () => reportsApi.getRevenue(days).then((res) => res.data),
    retry: 1,
    throwOnError: false,
  });
}

export function useAppointmentsByType(days?: number) {
  return useQuery({
    queryKey: ['appointments-by-type', days],
    queryFn: () => reportsApi.getAppointmentsByType(days).then((res) => res.data),
    retry: 1,
    throwOnError: false,
  });
}
