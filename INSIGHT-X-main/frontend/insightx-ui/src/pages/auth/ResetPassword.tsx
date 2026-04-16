/**
 * Reset Password page (with token)
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const getPasswordStrength = (password: string): { strength: number; label: string } => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        return { strength, label: labels[strength - 1] || 'Very Weak' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (passwordStrength.strength < 3) {
            setError('Password is too weak. Please use a stronger password.');
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword({ token, newPassword });
            navigate('/login', { state: { message: 'Password reset successful! Please login.' } });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-bg-primary px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">INSIGHT-X</h1>
                </div>

                <div className="bg-bg-secondary/60 backdrop-blur-xl border border-border-default rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">Reset Password</h2>
                    <p className="text-text-secondary mb-6">Enter your new password below.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoFocus
                        />

                        {/* Password Strength Meter */}
                        {newPassword && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-text-tertiary">Password Strength:</span>
                                    <span className="text-xs text-text-secondary font-medium">
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${passwordStrength.strength >= 4
                                                ? 'bg-semantic-success-500'
                                                : passwordStrength.strength >= 3
                                                    ? 'bg-semantic-warning-500'
                                                    : 'bg-semantic-danger-500'
                                            }`}
                                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <FormInput
                            type="password"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="p-3 bg-semantic-danger-bg border border-semantic-danger-400 rounded-lg">
                                <p className="text-sm text-semantic-danger-400">{error}</p>
                            </div>
                        )}

                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
