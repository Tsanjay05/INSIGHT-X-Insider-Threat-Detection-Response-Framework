interface TrustScoreBadgeProps {
    score: number;
    confidence?: number;
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

export function TrustScoreBadge({
    score,
    confidence,
    size = 'medium',
    showLabel = false
}: TrustScoreBadgeProps) {
    // Determine trust range per design.json
    const getTrustRange = (value: number) => {
        if (value >= 80) return {
            level: 'high',
            label: 'High Trust',
            startColor: '#30F0B3',
            endColor: '#16B383'
        };
        if (value >= 60) return {
            level: 'medium',
            label: 'Medium Trust',
            startColor: '#306FFF',
            endColor: '#0A3E99'
        };
        if (value >= 40) return {
            level: 'low',
            label: 'Low Trust',
            startColor: '#FAD670',
            endColor: '#D4A820'
        };
        return {
            level: 'critical',
            label: 'Critical Trust',
            startColor: '#FF5C5C',
            endColor: '#E61A1A'
        };
    };

    const range = getTrustRange(score);

    const sizeClasses = {
        small: { dimensions: 'w-16 h-16', fontSize: 'text-lg', strokeWidth: '6' },
        medium: { dimensions: 'w-24 h-24', fontSize: 'text-2xl', strokeWidth: '8' },
        large: { dimensions: 'w-32 h-32', fontSize: 'text-3xl', strokeWidth: '8' },
    };

    const { dimensions, fontSize, strokeWidth } = sizeClasses[size];
    const circumference = 2 * Math.PI * 40; // radius = 40%
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative ${dimensions}`}>
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r="40%"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle with gradient */}
                    <defs>
                        <linearGradient id={`gradient-${score}-${range.level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={range.startColor} />
                            <stop offset="100%" stopColor={range.endColor} />
                        </linearGradient>
                    </defs>
                    <circle
                        cx="50%"
                        cy="50%"
                        r="40%"
                        fill="none"
                        stroke={`url(#gradient-${score}-${range.level})`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold ${fontSize} text-text-primary`}>
                        {Math.round(score)}
                    </span>
                    {confidence !== undefined && (
                        <span className="text-xs text-text-tertiary mt-0.5">
                            {Math.round(confidence)}% conf
                        </span>
                    )}
                </div>
            </div>
            {showLabel && (
                <span className="text-sm font-medium text-text-secondary">
                    {range.label}
                </span>
            )}
        </div>
    );
}
