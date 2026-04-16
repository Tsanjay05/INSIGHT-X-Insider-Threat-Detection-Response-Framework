import { AlertTriangle } from 'lucide-react';
import { env } from '@/config/env';


export function MockDataBanner() {
    // Check if mock data is enabled via environment variable
    const isMockData = env.enableMockData;


    // Don't show on login page if we had one, but we don't really have one yet that is separate layout?
    // Actually typically handled by layout.

    if (!isMockData) return null;

    return (
        <div className="bg-semantic-warning-bg border-b border-semantic-warning-400/20 px-4 py-2 flex items-center justify-center gap-2 text-sm text-semantic-warning-400 font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>Running in Mock Data Mode - Changes will not be persisted to backend.</span>
        </div>
    );
}
