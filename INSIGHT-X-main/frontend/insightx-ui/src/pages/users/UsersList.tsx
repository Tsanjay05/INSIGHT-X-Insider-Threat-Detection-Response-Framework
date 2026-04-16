/**
 * Users List page - admin only
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser } from '@/hooks/useUser';
import { UserAvatar } from '@/components/users/UserAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { UserForm, UserFormData } from '@/components/users/UserForm';
import { useCreateUser } from '@/hooks/useUser';
import { useToast } from '@/components/ui/Toast';
import { UserFilters, UserRole, UserStatus } from '@/api/users.types';

export function UsersList() {
    const [filters, setFilters] = useState<UserFilters>({ page: 1, pageSize: 20 });
    const { data, isLoading, error } = useUsers(filters);
    const deleteUserMutation = useDeleteUser();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const createUserMutation = useCreateUser();
    const { toast } = useToast();

    const handleSearch = (search: string) => {
        setFilters({ ...filters, search, page: 1 });
    };

    const handleCreateUser = async (data: UserFormData) => {
        try {
            await createUserMutation.mutateAsync({
                ...data,
                permissions: [], // Default permissions
            });
            setIsCreateModalOpen(false);
            toast({
                title: 'User Created',
                description: `${data.name} has been successfully created.`,
                variant: 'success',
            });
        } catch (error) {
            toast({
                title: 'Creation Failed',
                description: (error as Error).message || 'Failed to create user.',
                variant: 'danger',
            });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteUserMutation.mutateAsync(id);
                toast({
                    title: 'User Deleted',
                    description: `${name} has been successfully removed.`,
                    variant: 'success',
                });
            } catch (error) {
                toast({
                    title: 'Deletion Failed',
                    description: (error as Error).message || 'Failed to delete user.',
                    variant: 'danger',
                });
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Users</h1>
                    <p className="text-text-secondary">Manage system users</p>
                </div>

                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    + Create User
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex items-center space-x-4">
                    <Input
                        placeholder="Search users..."
                        value={filters.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1"
                    />

                    <select
                        value={filters.role || ''}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value as UserRole })}
                        className="px-3 py-2 bg-bg-tertiary border border-border-default rounded-lg text-text-primary"
                    >
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SECURITY_ANALYST">Security Analyst</option>
                        <option value="ANALYST">Analyst</option>
                        <option value="VIEWER">Viewer</option>
                    </select>

                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as UserStatus })}
                        className="px-3 py-2 bg-bg-tertiary border border-border-default rounded-lg text-text-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </Card>

            {/* Users Table */}
            {isLoading ? (
                <Card>
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent mb-4"></div>
                        <p className="text-text-secondary">Loading users...</p>
                    </div>
                </Card>
            ) : error ? (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-semantic-danger-400">{error.message}</p>
                    </div>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border-default">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">User</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-text-tertiary">Last Login</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-text-tertiary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.users.map((user) => (
                                    <tr key={user.id} className="border-b border-border-subtle hover:bg-bg-tertiary/30">
                                        <td className="py-3 px-4">
                                            <Link to={`/users/${user.id}`} className="flex items-center space-x-3">
                                                <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                                                <span className="text-text-primary font-medium hover:text-primary-400">
                                                    {user.name}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 rounded">
                                                {user.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded ${user.status === 'ACTIVE'
                                                    ? 'bg-semantic-success-bg text-semantic-success-400'
                                                    : 'bg-neutral-700 text-neutral-400'
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-text-secondary text-sm">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <Link to={`/users/${user.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(user.id, user.name)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-default">
                        <p className="text-sm text-text-secondary">
                            Showing {data?.users.length || 0} of {data?.total || 0} users
                        </p>

                        <div className="flex space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={(data?.users.length || 0) < (filters.pageSize || 20)}
                                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Create User Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <ModalHeader onClose={() => setIsCreateModalOpen(false)}>Create New User</ModalHeader>
                <ModalBody>
                    <UserForm
                        onSubmit={handleCreateUser}
                        isLoading={createUserMutation.isPending}
                    />
                </ModalBody>
            </Modal>
        </div>
    );
}
