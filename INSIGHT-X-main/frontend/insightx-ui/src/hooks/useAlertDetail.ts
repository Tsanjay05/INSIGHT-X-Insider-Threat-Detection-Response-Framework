/**
 * Alert detail hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as alertsApi from '@/api/alerts';
import type { AlertStatus } from '@/api/alerts.types';

export const useAlert = (id: string) => {
    return useQuery({
        queryKey: ['alert', id],
        queryFn: () => alertsApi.getAlertById(id),
        enabled: !!id,
    });
};

export const useAlerts = (filters?: Parameters<typeof alertsApi.getAlerts>[0]) => {
    return useQuery({
        queryKey: ['alerts', filters],
        queryFn: () => alertsApi.getAlerts(filters),
    });
};

export const useUpdateAlertStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: AlertStatus }) =>
            alertsApi.updateAlertStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['alert', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        },
    });
};

export const useAddAlertComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            alertsApi.addAlertComment(id, content),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['alert', variables.id] });
        },
    });
};
