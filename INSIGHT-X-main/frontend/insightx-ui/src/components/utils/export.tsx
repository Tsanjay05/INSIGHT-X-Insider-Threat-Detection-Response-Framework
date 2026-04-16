import { Download } from 'lucide-react';
import { Button } from '../ui/Button';

export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    // Get headers from first item
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes
                const stringValue = String(value ?? '').replace(/"/g, '""');
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',')
        )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

export function exportToJSON(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
}

interface ExportButtonProps {
    data: any[];
    filename: string;
    format?: 'csv' | 'json';
}

export function ExportButton({ data, filename, format = 'csv' }: ExportButtonProps) {
    const handleExport = () => {
        if (format === 'csv') {
            exportToCSV(data, filename);
        } else {
            exportToJSON(data, filename);
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={handleExport}
            disabled={!data || data.length === 0}
        >
            <Download className="w-4 h-4 mr-2" />
            Export {format.toUpperCase()}
        </Button>
    );
}
