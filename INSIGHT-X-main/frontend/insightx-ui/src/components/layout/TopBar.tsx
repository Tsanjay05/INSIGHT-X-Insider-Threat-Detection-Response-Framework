import { Search, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { CommandPalette } from '../search/CommandPalette';

export function TopBar() {
    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md px-6">
            <CommandPalette />

            {/* Search Trigger */}
            <div className="w-96 hidden md:block">
                <Button
                    variant="outline"
                    className="w-full justify-start text-text-tertiary bg-bg-tertiary border-border-subtle hover:text-text-primary hover:bg-bg-elevated"
                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search cases, events...</span>
                    <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border border-border-default bg-bg-secondary px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Connection Status */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-tertiary border border-border-subtle">
                    <div className="h-2 w-2 rounded-full bg-semantic-success-500 animate-pulse" />
                    <span className="text-xs font-medium text-text-secondary">Live</span>
                </div>

                {/* Alerts */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-text-secondary" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-semantic-danger-500 ring-2 ring-bg-primary" />
                </Button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-text-primary">Jane Analyst</p>
                        <p className="text-xs text-text-tertiary">Senior Analyst</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white ring-2 ring-border-subtle overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Jane+Analyst&background=0D4FCC&color=fff" alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
}
