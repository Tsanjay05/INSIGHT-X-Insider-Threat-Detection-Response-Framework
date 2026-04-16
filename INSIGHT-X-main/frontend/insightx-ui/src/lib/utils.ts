import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Timestamp formatting
export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(date);
}

export function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

// Color utilities for badges
export function getRiskLevelColor(riskLevel: string): string {
    const colors: Record<string, string> = {
        CRITICAL: 'text-danger-400 bg-danger-400/10 border-danger-400/20',
        HIGH: 'text-warning-400 bg-warning-400/10 border-warning-400/20',
        MEDIUM: 'text-info-400 bg-info-400/10 border-info-400/20',
        LOW: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
    };
    return colors[riskLevel] || colors.LOW;
}

export function getControlStatusColor(status: string): string {
    const colors: Record<string, string> = {
        ACTIVE: 'text-success-400 bg-success-400/10 border-success-400/20',
        REVOKED: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/20',
        EXPIRED: 'text-warning-400 bg-warning-400/10 border-warning-400/20',
    };
    return colors[status] || colors.ACTIVE;
}

// String utilities
export function capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str: string, length: number): string {
    if (!str || str.length <= length) return str;
    return `${str.slice(0, length)}...`;
}
