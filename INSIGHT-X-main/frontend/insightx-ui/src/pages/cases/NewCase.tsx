/**
 * New Case Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, ChevronLeft, Shield, AlertCircle } from 'lucide-react';
import { useCreateCase } from '@/hooks/useCases';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { CasePriority } from '@/api/cases.types';

export function NewCase() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const createCase = useCreateCase();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        priority: 'MEDIUM' as CasePriority,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.subject) {
            toast({
                title: 'Missing Information',
                description: 'Please provide at least a title and a subject.',
                variant: 'danger',
            });
            return;
        }

        try {
            const newCase = await createCase.mutateAsync(formData);
            toast({
                title: 'Case Created',
                description: `Successfully created case ${newCase.id}`,
                variant: 'success',
            });
            navigate(`/cases/${newCase.id}`);
        } catch (error) {
            toast({
                title: 'Creation Failed',
                description: (error as Error).message || 'Failed to create case',
                variant: 'danger',
            });
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Breadcrumbs />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Cases
                </Button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                        <FolderPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Create New Case</h1>
                        <p className="text-text-secondary">Initialize a new investigation for a security subject.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Case Title
                            </label>
                            <Input
                                placeholder="e.g., Suspected Data Exfiltration - Finance DB"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Subject (User ID, Email, or Entity)
                                </label>
                                <Input
                                    placeholder="e.g., john.doe@corp.com"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">
                                    Priority
                                </label>
                                <Select
                                    options={[
                                        { value: 'LOW', label: 'Low' },
                                        { value: 'MEDIUM', label: 'Medium' },
                                        { value: 'HIGH', label: 'High' },
                                        { value: 'CRITICAL', label: 'Critical' },
                                    ]}
                                    value={formData.priority}
                                    onChange={(val) => setFormData({ ...formData, priority: val as CasePriority })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full min-h-[120px] bg-bg-tertiary border border-border-default rounded-md p-3 text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                                placeholder="Provide context and initial findings for this case..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                <div className="bg-info-400/5 border border-info-400/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-info-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-text-primary font-medium mb-1">Investigation Best Practices</p>
                        <ul className="text-text-secondary list-disc list-inside space-y-1">
                            <li>Ensure the subject ID is accurate for linking automated alerts.</li>
                            <li>Provide a concise but descriptive title for easy tracking.</li>
                            <li>Cases can be linked to specific security controls during investigation.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" type="button" onClick={() => navigate('/cases')}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" loading={createCase.isPending}>
                        <Shield className="h-4 w-4 mr-2" />
                        Create Investigation
                    </Button>
                </div>
            </form>
        </div>
    );
}
