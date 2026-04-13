import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { toast } from 'sonner';
import type { PaginationParams } from '@/types';

export function useProducts(params?: PaginationParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const res = await inventoryApi.getAll(params);
        return res.data;
      } catch (error: any) {
        console.error('Products error:', error?.response?.status);
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
    },
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      try {
        const res = await inventoryApi.getLowStock();
        return res.data;
      } catch (error: any) {
        console.error('Low stock error:', error?.response?.status);
        return [];
      }
    },
  });
}

export function useExpiringProducts(days?: number) {
  return useQuery({
    queryKey: ['expiring-products', days],
    queryFn: () => inventoryApi.getExpiring(days).then((res) => res.data),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => inventoryApi.getCategories().then((res) => res.data),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => inventoryApi.getById(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => inventoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error al crear el producto');
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryApi.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-products'] });
      toast.success('Stock ajustado');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error al ajustar el stock');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-products'] });
      toast.success('Producto actualizado');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error al actualizar el producto');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-products'] });
      toast.success('Producto eliminado');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error al eliminar el producto');
    },
  });
}
