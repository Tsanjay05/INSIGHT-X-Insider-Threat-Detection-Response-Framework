/**
 * User Detail page
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUserActivity, useUpdateUser, useUserSessions, useRevokeSession, useDeleteUser } from '@/hooks/useUser';
import { UserAvatar } from '@/components/users/UserAvatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { UserForm, UserFormData } from '@/components/users/UserForm';
import { useToast } from '@/components/ui/Toast';
import { Smartphone, Globe, Monitor, Clock, LogOut, Trash2 } from 'lucide-react';

export function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isLoading, error } = useUser(id!);
    const { data: activityLog } = useUserActivity(id!, 1, 10);
    const { data: sessions } = useUserSessions(id!);
    const updateUserMutation = useUpdateUser(id!);
    const revokeSessionMutation = useRevokeSession(id!);
    const deleteUserMutation = useDeleteUser();
    const { toast } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleUpdateUser = async (data: UserFormData) => {
        try {
            await updateUserMutation.mutateAsync(data);
            setIsEditModalOpen(false);
            toast({
                title: 'User Updated',
                description: `${data.name} has been successfully updated.`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: (error as Error).message || 'Failed to update user.',
                variant: 'danger',
            });
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await revokeSessionMutation.mutateAsync(sessionId);
            toast({
                title: 'Session Revoked',
                description: 'The session has been successfully revoked.',
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Revocation Failed',
                description: (error as Error).message || 'Failed to revoke session.',
                variant: 'danger',
            });
        }
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            try {
                await deleteUserMutation.mutateAsync(id!);
                toast({
                    title: 'User Deleted',
                    description: 'User has been successfully removed.',
                    variant: 'success',
                });
                navigate('/users');
            } catch (error) {
                toast({
                    title: 'Deletion Failed',
                    description: (error as Error).message || 'Failed to delete user.',
                    variant: 'danger',
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
                        <p className="text-text-secondary">Loading user...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <p className="text-semantic-danger-400">Failed to load user</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <UserAvatar name={user.name} avatar={user.avatar} size="xl" />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
                        <p className="text-text-secondary">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}>Edit User</Button>
                    <Button variant="ghost" className="text-semantic-danger-400 hover:text-semantic-danger-500 hover:bg-semantic-danger-bg" onClick={handleDeleteUser}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-text-tertiary">Role</label>
                            <p className="text-text-primary font-medium">{user.role.replace('_', ' ')}</p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Status</label>
                            <p className="text-text-primary">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded ${user.status === 'ACTIVE'
                                        ? 'bg-semantic-success-bg text-semantic-success-400'
                                        : 'bg-neutral-700 text-neutral-400'
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Department</label>
                            <p className="text-text-primary">{user.department || 'Not specified'}</p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Trust Score</label>
                            <p className="text-text-primary font-semibold text-lg">{user.trustScore || 'N/A'}</p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Risk Level</label>
                            <p className="text-text-primary">{user.riskLevel || 'N/A'}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Activity</h3>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-text-tertiary">Last Login</label>
                            <p className="text-text-primary">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Last Activity</label>
                            <p className="text-text-primary">
                                {user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'N/A'}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Active Sessions</label>
                            <p className="text-text-primary">{user.sessionCount || 0}</p>
                        </div>

                        <div>
                            <label className="text-sm text-text-tertiary">Member Since</label>
                            <p className="text-text-primary">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>

                {activityLog && activityLog.activities.length > 0 ? (
                    <div className="space-y-3">
                        {activityLog.activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                            >
                                <div>
                                    <p className="text-text-primary font-medium">{activity.action}</p>
                                    <p className="text-sm text-text-tertiary">
                                        {activity.resource} • {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>

                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded ${activity.success
                                        ? 'bg-semantic-success-bg text-semantic-success-400'
                                        : 'bg-semantic-danger-bg text-semantic-danger-400'
                                        }`}
                                >
                                    {activity.success ? 'Success' : 'Failed'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-center py-8">No recent activity</p>
                )}
            </Card>

            {/* User Sessions */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Active Sessions</h3>
                {sessions && sessions.length > 0 ? (
                    <div className="space-y-4">
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-bg-tertiary/50 rounded-lg border border-border-subtle">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary-500/10 rounded-lg">
                                        {session.device === 'Mobile' ? <Smartphone className="h-5 w-5 text-primary-400" /> : <Monitor className="h-5 w-5 text-primary-400" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-text-primary">{session.browser} on {session.device}</p>
                                            {session.isCurrent && (
                                                <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-semantic-success-bg text-semantic-success-400 rounded border border-semantic-success-500/20">
                                                    Current Session
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-text-tertiary">
                                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {session.ipAddress}</span>
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last active {new Date(session.lastActive).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-text-tertiary hover:text-semantic-danger-400"
                                        onClick={() => handleRevokeSession(session.id)}
                                        loading={revokeSessionMutation.isPending && revokeSessionMutation.variables === session.id}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-center py-8">No active sessions</p>
                )}
            </Card>

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader onClose={() => setIsEditModalOpen(false)}>Edit User</ModalHeader>
                <ModalBody>
                    {user && (
                        <UserForm
                            isEditing
                            defaultValues={{
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                status: user.status,
                                department: user.department,
                            }}
                            onSubmit={handleUpdateUser}
                            isLoading={updateUserMutation.isPending}
                        />
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
}
