
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { TimelineEventItem } from '../components/timeline/TimelineEventItem';
import { Input } from '../components/ui/Input';
import { Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Timeline() {
    return (
        <div className="space-y-6">
            <Breadcrumbs />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Global Timeline</h1>
                    <p className="text-text-secondary">Chronological view of all security events and activities.</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search timeline..."
                        icon={<Search className="h-4 w-4" />}
                        className="w-full md:w-64"
                    />
                    <Button variant="secondary" className="px-3">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default">
                <div className="space-y-0">
                    <TimelineEventItem
                        timestamp="10:45 AM"
                        title="Policy Violation Detected"
                        description="User accessed sensitive file pattern matching 'confidentail*'."
                        riskScore={55}
                        severity="medium"
                        user="alex.dev@corp.com"
                    />
                    <TimelineEventItem
                        timestamp="10:30 AM"
                        title="Remote Login Success"
                        description="Successful login from VPN endpoint."
                        severity="low"
                        user="alex.dev@corp.com"
                    />
                    <TimelineEventItem
                        timestamp="09:00 AM"
                        title="Shift Started"
                        description="User shift detected based on first activity."
                        severity="low"
                        user="system"
                    />
                </div>
            </div>
        </div>
    );
}
