import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-shimmer rounded-md bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:400%_100%]",
                className
            )}
            {...props}
        />
    );
}
