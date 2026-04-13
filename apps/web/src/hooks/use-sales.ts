import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useSales(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesApi.getAll(params).then((res) => res.data),
  });
}

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: ['daily-summary', date],
    queryFn: () => salesApi.getDailySummary(date).then((res) => res.data),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => salesApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
      toast.success('Venta creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la venta');
    },
  });
}
