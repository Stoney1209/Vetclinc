import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      try {
        const res = await reportsApi.getDashboardKPIs();
        return res.data;
      } catch (error: any) {
        console.error('Dashboard KPIs error:', error?.response?.status, error?.message);
        return undefined;
      }
    },
    refetchInterval: 60000,
    retry: 1,
    throwOnError: false,
  });
}

export function useRevenueByDay(days?: number) {
  return useQuery({
    queryKey: ['revenue-by-day', days],
    queryFn: async () => {
      try {
        const res = await reportsApi.getRevenue(days);
        return res.data;
      } catch (error: any) {
        console.error('Revenue by day error:', error?.response?.status, error?.message);
        return [];
      }
    },
    retry: 1,
    throwOnError: false,
  });
}

export function useAppointmentsByType(days?: number) {
  return useQuery({
    queryKey: ['appointments-by-type', days],
    queryFn: async () => {
      try {
        const res = await reportsApi.getAppointmentsByType(days);
        return res.data;
      } catch (error: any) {
        console.error('Appointments by type error:', error?.response?.status, error?.message);
        return [];
      }
    },
    retry: 1,
    throwOnError: false,
  });
}
