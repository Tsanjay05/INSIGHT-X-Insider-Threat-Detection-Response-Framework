/**
 * Report hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as reportsApi from '@/api/reports';
import type { ReportType, ReportFormat } from '@/api/reports.types';

export const useReports = (filters?: Parameters<typeof reportsApi.getReports>[0]) => {
    return useQuery({
        queryKey: ['reports', filters],
        queryFn: () => reportsApi.getReports(filters),
    });
};

export const useReport = (id: string) => {
    return useQuery({
        queryKey: ['report', id],
        queryFn: () => reportsApi.getReportById(id),
        enabled: !!id,
    });
};

export const useGenerateReport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { title: string; type: ReportType; format: ReportFormat; dateRangeStart: string; dateRangeEnd: string }) =>
            reportsApi.generateReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
    });
};
