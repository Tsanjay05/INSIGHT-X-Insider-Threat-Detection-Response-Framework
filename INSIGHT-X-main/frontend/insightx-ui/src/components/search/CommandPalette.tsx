import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent } from '../ui';

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl">
                <Command className="[&_[cmdk-root]]:h-full w-full">
                    <div className="flex items-center border-b border-border-default px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50 text-text-primary"
                            placeholder="Type a command or search..."
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm text-text-tertiary">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-text-tertiary px-2 py-1.5 text-xs font-medium">
                            <Command.Item
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-bg-tertiary aria-selected:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => navigate('/'))}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-bg-tertiary aria-selected:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => navigate('/cases'))}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Cases</span>
                            </Command.Item>
                            <Command.Item
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-bg-tertiary aria-selected:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => navigate('/alerts'))}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                <span>Alerts</span>
                            </Command.Item>
                            <Command.Item
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-bg-tertiary aria-selected:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                onSelect={() => runCommand(() => navigate('/controls'))}
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Controls</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
