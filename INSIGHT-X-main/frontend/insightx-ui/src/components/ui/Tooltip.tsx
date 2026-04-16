import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 200, className }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    let timeout: NodeJS.Timeout;

    const show = () => {
        timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hide = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            {children}
            {isVisible && (
                <div
                    className={cn(
                        "absolute z-50 px-3 py-2 text-sm font-medium text-white bg-bg-secondary border border-border-strong rounded-md shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200",
                        positionClasses[position],
                        className
                    )}
                    role="tooltip"
                >
                    {content}
                </div>
            )}
        </div>
    );
}
