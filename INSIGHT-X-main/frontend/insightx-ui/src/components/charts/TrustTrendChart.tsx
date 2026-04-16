import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export interface TrustTrendDatum {
    time: string;
    score: number;
}

interface TrustTrendChartProps {
    data?: TrustTrendDatum[];
    title?: string;
}

export function TrustTrendChart({ data = [], title = 'Trust Posture Over Time' }: TrustTrendChartProps) {
    return (
        <Card className="col-span-4" variant="elevated">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                {data.length > 0 ? (
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#30F0B3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#30F0B3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#9E9EA7"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    stroke="#9E9EA7"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C1C1E',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '6px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#30F0B3"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[200px] w-full flex items-center justify-center text-sm text-text-tertiary">
                        No trend data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
