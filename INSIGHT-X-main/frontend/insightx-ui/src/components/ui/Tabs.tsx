/**
 * Tabs component for detail page sections
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
    children: React.ReactNode | ((activeTab: string) => React.ReactNode);
    className?: string;
}

interface TabPanelProps {
    tabId: string;
    activeTab: string;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    return (
        <div className={className}>
            <div className="flex border-b border-border-subtle overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                            activeTab === tab.id
                                ? 'text-primary-400 border-primary-400'
                                : 'text-text-tertiary border-transparent hover:text-text-secondary hover:border-border-default'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                                    activeTab === tab.id
                                        ? 'bg-primary-400/20 text-primary-300'
                                        : 'bg-white/5 text-text-tertiary'
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
            {typeof children === 'function'
                ? (children as (activeTab: string) => React.ReactNode)(activeTab)
                : children}
        </div>
    );
}

export function TabPanel({ tabId, activeTab, children, className }: TabPanelProps) {
    if (tabId !== activeTab) return null;
    return <div className={cn('pt-4', className)}>{children}</div>;
}
