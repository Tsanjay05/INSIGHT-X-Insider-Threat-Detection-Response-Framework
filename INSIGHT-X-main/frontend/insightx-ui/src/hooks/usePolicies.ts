/**
 * Policy hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as policiesApi from '@/api/policies';

export const usePolicies = (filters?: Parameters<typeof policiesApi.getPolicies>[0]) => {
    return useQuery({
        queryKey: ['policies', filters],
        queryFn: () => policiesApi.getPolicies(filters),
    });
};

export const usePolicy = (id: string) => {
    return useQuery({
        queryKey: ['policy', id],
        queryFn: () => policiesApi.getPolicyById(id),
        enabled: !!id,
    });
};

export const useTogglePolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
            policiesApi.togglePolicy(id, enabled),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['policy', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['policies'] });
        },
    });
};
