/**
 * Reports API client
 */

import type {
    Report,
    ReportDetail,
    ReportListResponse,
    ReportFilters,
    ReportType,
    ReportFormat,
} from './reports.types';

import { get, post } from './client';

const API_BASE_PATH = '/api/v1/reports';

export const getReports = async (filters?: ReportFilters): Promise<ReportListResponse> => {
    return get<ReportListResponse>(API_BASE_PATH, filters as Record<string, any>);
};

export const getReportById = async (id: string): Promise<ReportDetail> => {
    return get<ReportDetail>(`${API_BASE_PATH}/${id}`);
};

export const generateReport = async (data: {
    title: string;
    type: ReportType;
    format: ReportFormat;
    dateRangeStart: string;
    dateRangeEnd: string;
}): Promise<Report> => {
    return post<Report>(`${API_BASE_PATH}/generate`, data);
};
