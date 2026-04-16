/**
 * Login page
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';

export function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login({ email, password, rememberMe });
            navigate(from, { replace: true });
        } catch (err) {
            // Error is set in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 to-bg-primary px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">INSIGHT-X</h1>
                    <p className="text-text-secondary">Zero-Trust Insider Threat Detection</p>
                </div>

                {/* Login Card */}
                <div className="bg-bg-secondary/60 backdrop-blur-xl border border-border-default rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-text-primary mb-6">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <FormInput
                            type="email"
                            label="Email"
                            placeholder="admin@insightx.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                            error={error}
                        />

                        {/* Password */}
                        <div className="relative">
                            <FormInput
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-text-tertiary hover:text-text-secondary"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-semantic-danger-bg border border-semantic-danger-400 rounded-lg">
                                <p className="text-sm text-semantic-danger-400">{error}</p>
                            </div>
                        )}

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2">
                                <FormInput
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-border-default bg-bg-tertiary text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-text-secondary">Remember me</span>
                            </label>

                            <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Demo credentials hint */}
                    <div className="mt-6 p-4 bg-semantic-info-bg border border-semantic-info-400 rounded-lg">
                        <p className="text-xs text-semantic-info-400 font-medium mb-1">Demo Credentials:</p>
                        <p className="text-xs text-text-tertiary">Email: admin@insightx.com</p>
                        <p className="text-xs text-text-tertiary">Password: password</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
