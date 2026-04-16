/**
 * User avatar component with fallback to initials
 */

import { cn } from '@/lib/utils';

interface UserAvatarProps {
    name?: string;
    avatar?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'away';
    className?: string;
}

const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
};

const statusColors = {
    online: 'bg-semantic-success-500',
    offline: 'bg-neutral-500',
    away: 'bg-semantic-warning-500',
};

/**
 * Get initials from name
 */
const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export function UserAvatar({
    name = 'User',
    avatar,
    size = 'md',
    status,
    className,
}: UserAvatarProps) {
    const initials = getInitials(name);

    return (
        <div className={cn('relative inline-block', className)}>
            <div
                className={cn(
                    'rounded-full flex items-center justify-center font-medium',
                    'bg-primary-500 text-white',
                    sizeClasses[size]
                )}
            >
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="h-full w-full rounded-full object-cover"
                    />
                ) : (
                    <span>{initials}</span>
                )}
            </div>

            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0 block rounded-full ring-2 ring-bg-primary',
                        statusColors[status],
                        size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'
                    )}
                />
            )}
        </div>
    );
}
