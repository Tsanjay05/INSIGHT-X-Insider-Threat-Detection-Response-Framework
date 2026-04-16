import { cn } from '../../lib/utils';
import { useUIStore } from '../../store/uiStore';
import {
    LayoutDashboard,
    FolderOpen,
    Network,
    Archive,
    Shield,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Cases', icon: FolderOpen, path: '/cases' },
    { label: 'Campaigns', icon: Network, path: '/campaigns' },
    { label: 'Provenance', icon: Archive, path: '/provenance' },
    { label: 'Controls', icon: Shield, path: '/controls' },
    { label: 'Settings', icon: Settings, path: '/settings' },
];

export function Sidebar() {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border-subtle bg-bg-secondary transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "w-16" : "w-60"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border-subtle">
                <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap", sidebarCollapsed && "justify-center w-full")}>
                    <Activity className="h-6 w-6 text-primary-400 shrink-0" />
                    {!sidebarCollapsed && <span className="font-bold text-lg tracking-tight">INSIGHT-X</span>}
                </div>
                {!sidebarCollapsed && (
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2 mt-4">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary-400/10 text-primary-400 border-l-2 border-primary-400"
                                : "text-text-secondary hover:bg-white/5 hover:text-white",
                            sidebarCollapsed ? "justify-center px-0" : ""
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Mobile Collapse Trigger (only visible when collapsed on desktop usually, but handled by Header above) 
          Actually, we might want a bottom toggle if sidebar is collapsed.
      */}
            {sidebarCollapsed && (
                <div className="absolute bottom-4 left-0 w-full flex justify-center">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </aside>
    );
}
