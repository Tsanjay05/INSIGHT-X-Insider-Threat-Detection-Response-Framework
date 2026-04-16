import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-bg-primary p-4 text-center">
                    <div className="mb-4 rounded-full bg-semantic-danger-bg p-4">
                        <AlertCircle className="h-12 w-12 text-semantic-danger-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-text-primary">Something went wrong</h1>
                    <p className="mb-6 max-w-md text-text-secondary">
                        {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                    </p>
                    <Button onClick={this.handleRetry} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reload Application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
