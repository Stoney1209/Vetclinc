import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';

export function useVeterinarians() {
  return useQuery({
    queryKey: ['veterinarians'],
    queryFn: () => usersApi.getVeterinarians().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}
