/**
 * Unauthorized 403 page
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-semantic-danger-bg mb-4">
                        <svg className="w-10 h-10 text-semantic-danger-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-6xl font-bold text-text-primary mb-2">403</h1>
                    <h2 className="text-2xl font-semibold text-text-primary mb-3">Access Denied</h2>
                    <p className="text-text-secondary mb-6">
                        You do not have permission to access this resource. Please contact your administrator if you believe this is an error.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button
                        variant="primary"
                        onClick={() => navigate('/dashboard')}
                        className="w-full"
                    >
                        Go to Dashboard
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="w-full"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
