/**
 * Case management hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as casesApi from '@/api/cases';
import type { CaseStatus, CasePriority } from '@/api/cases.types';

export const useCases = (filters?: Parameters<typeof casesApi.getCases>[0]) => {
    return useQuery({
        queryKey: ['cases', filters],
        queryFn: () => casesApi.getCases(filters),
    });
};

export const useCase = (id: string) => {
    return useQuery({
        queryKey: ['case', id],
        queryFn: () => casesApi.getCaseById(id),
        enabled: !!id,
    });
};

export const useCreateCase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { title: string; description: string; subject: string; priority: CasePriority }) =>
            casesApi.createCase(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cases'] });
        },
    });
};

export const useUpdateCaseStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: CaseStatus }) =>
            casesApi.updateCaseStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['cases'] });
        },
    });
};

export const useAddCaseComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content, isInternal }: { id: string; content: string; isInternal?: boolean }) =>
            casesApi.addCaseComment(id, content, isInternal),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['case', variables.id] });
        },
    });
};
