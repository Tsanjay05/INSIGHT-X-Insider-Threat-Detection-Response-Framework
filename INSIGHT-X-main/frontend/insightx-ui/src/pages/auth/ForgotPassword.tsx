/**
 * Forgot Password page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await requestPasswordReset({ email });
            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-bg-primary px-4">
                <div className="w-full max-w-md">
                    <div className="bg-bg-secondary/60 backdrop-blur-xl border border-border-default rounded-xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-semantic-success-bg rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-semantic-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-semibold text-text-primary mb-2">Check Your Email</h2>
                        <p className="text-text-secondary mb-6">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>

                        <Link to="/login">
                            <Button variant="primary" className="w-full">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-bg-primary px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">INSIGHT-X</h1>
                </div>

                <div className="bg-bg-secondary/60 backdrop-blur-xl border border-border-default rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">Forgot Password?</h2>
                    <p className="text-text-secondary mb-6">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormInput
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            error={error}
                        />

                        {error && (
                            <div className="p-3 bg-semantic-danger-bg border border-semantic-danger-400 rounded-lg">
                                <p className="text-sm text-semantic-danger-400">{error}</p>
                            </div>
                        )}

                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'SendReset Link'}
                        </Button>

                        <Link to="/login" className="block text-center text-sm text-primary-500 hover:text-primary-400">
                            Back to Login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
