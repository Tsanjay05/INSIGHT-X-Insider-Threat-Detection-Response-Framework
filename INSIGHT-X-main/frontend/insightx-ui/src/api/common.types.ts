export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    status: number;
    message: string;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}
