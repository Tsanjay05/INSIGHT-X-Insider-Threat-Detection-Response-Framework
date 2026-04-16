import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';
import { MockDataBanner } from '../ui/MockDataBanner';

export function AppLayout() {
    const { sidebarCollapsed } = useUIStore();

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
            <MockDataBanner />
            <Sidebar />

            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "ml-16" : "ml-60"
                )}
            >
                <TopBar />
                <main className="container mx-auto p-6 max-w-[1920px]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
