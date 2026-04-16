/**
 * User Profile page - current user
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, changePassword } from '@/api/auth';
import { UserAvatar } from '@/components/users/UserAvatar';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Card } from '@/components/ui/Card';

export function Profile() {
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile form
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [department, setDepartment] = useState(user?.department || '');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const updated = await updateProfile({ name, email, department });
            setUser(updated);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setIsSaving(true);
        try {
            await changePassword({ currentPassword, newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
            alert('Password changed successfully!');
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">My Profile</h1>
                <p className="text-text-secondary">Manage your personal information</p>
            </div>

            {/* Profile Information */}
            <Card>
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <UserAvatar name={user.name} avatar={user.avatar} size="xl" />
                        <div>
                            <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
                            <p className="text-text-secondary">{user.email}</p>
                            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 rounded">
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>
                    </div>

                    {!isEditing && (
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <FormInput
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <FormInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FormInput
                            label="Department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />

                        <div className="flex space-x-3">
                            <Button
                                variant="primary"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(user.name);
                                    setEmail(user.email);
                                    setDepartment(user.department || '');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-text-tertiary">Department</label>
                            <p className="text-text-primary">{user.department || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-text-tertiary">Last Login</label>
                            <p className="text-text-primary">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Change Password */}
            <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>

                {!isChangingPassword ? (
                    <Button variant="secondary" onClick={() => setIsChangingPassword(true)}>
                        Change Password
                    </Button>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <FormInput
                            type="password"
                            label="Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <FormInput
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <FormInput
                            type="password"
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {passwordError && (
                            <div className="p-3 bg-semantic-danger-bg border border-semantic-danger-400 rounded-lg">
                                <p className="text-sm text-semantic-danger-400">{passwordError}</p>
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <Button type="submit" variant="primary" disabled={isSaving}>
                                {isSaving ? 'Updating...' : 'Update Password'}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsChangingPassword(false);
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setPasswordError('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}
