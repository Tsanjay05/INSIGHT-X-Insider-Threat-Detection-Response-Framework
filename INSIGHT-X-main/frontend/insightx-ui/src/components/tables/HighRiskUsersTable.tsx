import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MoreVertical } from 'lucide-react';
import type { User } from '../../api/auth.types';
import { formatTimeAgo } from '../../lib/utils';

interface HighRiskUsersTableProps {
    users?: User[];
    maxRows?: number;
    onViewAll?: () => void;
}

const getRiskLevel = (score: number): 'danger' | 'warning' | 'info' => {
    if (score < 50) return 'danger';
    if (score < 70) return 'warning';
    return 'info';
};

const getRiskLabel = (score: number): string => {
    if (score < 50) return 'critical';
    if (score < 70) return 'high';
    return 'medium';
};

export function HighRiskUsersTable({ users = [], maxRows = 5, onViewAll }: HighRiskUsersTableProps) {
    const riskyUsers = users
        .filter((u) => (u.trustScore ?? 0) < 70)
        .sort((a, b) => (a.trustScore ?? 0) - (b.trustScore ?? 0))
        .slice(0, maxRows);

    return (
        <Card variant="default" className="col-span-12 lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>High Risk Users</CardTitle>
                {onViewAll ? (
                    <Button variant="ghost" size="sm" onClick={onViewAll}>View All</Button>
                ) : (
                    <Button variant="ghost" size="sm" disabled>View All</Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b [&_tr]:border-border-default">
                            <tr className="border-b transition-colors hover:bg-white/5 data-[state=selected]:bg-white/5">
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary">User</th>
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary">Role</th>
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary">Trust Score</th>
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary">Risk Level</th>
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary">Last Active</th>
                                <th className="h-12 px-4 align-middle font-medium text-text-secondary text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {riskyUsers.length > 0 ? (
                                riskyUsers.map((user, index) => {
                                    const trustScore = user.trustScore ?? 0;
                                    const riskLevel = getRiskLevel(trustScore);
                                    const riskLabel = getRiskLabel(trustScore);

                                    return (
                                        <tr
                                            key={`${user.id || user.email || 'user'}-${index}`}
                                            className="border-b border-border-subtle transition-colors hover:bg-white/5 data-[state=selected]:bg-white/5"
                                        >
                                            <td className="p-4 align-middle font-medium text-text-primary">{user.email}</td>
                                            <td className="p-4 align-middle text-text-secondary">{user.role}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{trustScore}</span>
                                                    <div className="h-1.5 w-16 rounded-full bg-white/10">
                                                        <div
                                                            className={`h-full rounded-full ${trustScore < 50 ? 'bg-semantic-danger-400' : trustScore < 70 ? 'bg-semantic-warning-400' : 'bg-semantic-success-400'}`}
                                                            style={{ width: `${trustScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={riskLevel}>{riskLabel}</Badge>
                                            </td>
                                            <td className="p-4 align-middle text-text-tertiary">
                                                {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="icon" disabled>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-text-tertiary">
                                        No high-risk users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
