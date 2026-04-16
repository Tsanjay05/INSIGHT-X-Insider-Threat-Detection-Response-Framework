import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { getPolicies, togglePolicy } from '../api/policies';

import { useNavigate } from 'react-router-dom';

export default function Policies() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: policies, isLoading, error } = useQuery({
        queryKey: ['policies'],
        queryFn: () => getPolicies(),
    });

    const toggleMutation = useMutation({
        mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
            togglePolicy(id, !enabled),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast({
                title: variables.enabled ? 'Policy Enabled' : 'Policy Disabled',
                description: `The policy has been ${variables.enabled ? 'enabled' : 'disabled'} successfully.`,
                variant: 'success',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Update Failed',
                description: error.message || 'Failed to update policy. Please try again.',
                variant: 'danger',
            });
        },
    });

    const handleToggle = (id: string, enabled: boolean) => {
        toggleMutation.mutate({ id, enabled: !enabled });
    };

    // Calculate stats
    const totalPolicies = policies?.total || 0;
    const activePolicies = policies?.policies?.filter(p => p.enabled).length || 0;
    const inactivePolicies = policies?.policies?.filter(p => !p.enabled).length || 0;

    if (isLoading) {
        return <LoadingState message="Loading security policies..." />;
    }

    if (error) {
        return <ErrorState message={(error as Error).message || 'Failed to load policies'} />;
    }

    return (
        <div className="space-y-6">
            <Breadcrumbs />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Policy Management</h1>
                    <p className="text-text-secondary">Configure and monitor security policies.</p>
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="Search policies..."
                        icon={<Search className="h-4 w-4" />}
                        className="w-full md:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button onClick={() => navigate('/policies/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Policy
                    </Button>
                </div>
            </div>

            {/* Policy Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Total Policies</p>
                        <p className="text-2xl font-bold text-text-primary">{totalPolicies}</p>
                    </div>
                    <div className="p-2 bg-bg-secondary rounded-lg">
                        <Shield className="h-6 w-6 text-primary-400" />
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Active</p>
                        <p className="text-2xl font-bold text-semantic-success-400">{activePolicies}</p>
                    </div>
                    <div className="p-2 bg-bg-secondary rounded-lg">
                        <CheckCircle className="h-6 w-6 text-semantic-success-400" />
                    </div>
                </Card>
                <Card className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Inactive</p>
                        <p className="text-2xl font-bold text-text-tertiary">{inactivePolicies}</p>
                    </div>
                    <div className="p-2 bg-bg-secondary rounded-lg">
                        <XCircle className="h-6 w-6 text-text-tertiary" />
                    </div>
                </Card>
            </div>

            {!policies?.policies || policies.policies.length === 0 ? (
                <Card>
                    <EmptyState
                        title="No Policies Found"
                        description="No security policies have been configured yet. Click 'New Policy' to create one."
                        icon={Plus}
                    />
                </Card>
            ) : (
                <div className="grid gap-4">
                    {policies.policies.map((policy) => (
                        <div
                            key={policy.id}
                            className="bg-bg-secondary p-5 rounded-lg border border-border-subtle flex items-start justify-between hover:border-border-default transition-colors"
                        >
                            <div className="flex-1 min-w-0 mr-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-1">
                                    {policy.name}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                    {policy.description}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-tertiary">
                                    <span className={`px-2 py-1 rounded border border-border-subtle ${policy.type === 'PREVENTION' ? 'bg-semantic-danger-bg/20 text-semantic-danger-400' :
                                        policy.type === 'DETECTION' ? 'bg-semantic-warning-bg/20 text-semantic-warning-400' :
                                            policy.type === 'RESPONSE' ? 'bg-semantic-info-bg/20 text-semantic-info-400' :
                                                'bg-bg-tertiary text-text-secondary'
                                        }`}>
                                        {policy.type}
                                    </span>
                                    <span>Trigger count: {policy.triggerCount}</span>
                                    {policy.lastTriggered && (
                                        <span>Last triggered: {new Date(policy.lastTriggered).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 flex-shrink-0">
                                <span className="text-sm text-text-tertiary">
                                    {policy.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <Toggle
                                    checked={policy.enabled}
                                    onCheckedChange={() => handleToggle(policy.id, policy.enabled)}
                                    disabled={toggleMutation.isPending}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
}
