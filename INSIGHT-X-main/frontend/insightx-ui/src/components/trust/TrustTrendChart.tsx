import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatTimestamp } from '../../lib/utils';

interface TrustTrendChartProps {
    data: {
        timestamp: string;
        score: number;
        confidence: number;
    }[];
    height?: number;
    className?: string;
}

export function TrustTrendChart({ data, height = 300, className }: TrustTrendChartProps) {
    if (data.length === 0) {
        return (
            <div className={`flex items-center justify-center h-[${height}px] text-text-tertiary text-sm`}>
                No data available
            </div>
        );
    }

    return (
        <div className={className} style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                        stroke="#9E9EA7"
                        style={{ fontSize: '11px' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#9E9EA7"
                        style={{ fontSize: '11px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1C1C1E',
                            border: '1px solid rgba(255, 255, 255, 0.18)',
                            borderRadius: '6px',
                        }}
                        labelFormatter={(value) => formatTimestamp(value as string)}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#306FFF"
                        strokeWidth={2}
                        dot={{ fill: '#306FFF', r: 4 }}
                        name="Trust Score"
                    />
                    <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#30F0B3"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#30F0B3', r: 3 }}
                        name="Confidence %"
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-primary-400" />
                    <span className="text-text-secondary">Trust Score</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-success-400 border-dashed" style={{ borderTop: '2px dashed' }} />
                    <span className="text-text-secondary">Confidence %</span>
                </div>
            </div>
        </div>
    );
}
