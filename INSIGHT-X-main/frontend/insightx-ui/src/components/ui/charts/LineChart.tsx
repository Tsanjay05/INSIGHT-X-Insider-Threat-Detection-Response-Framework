import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ChartWrapper } from './ChartWrapper';

interface LineChartProps {
    data: any[];
    categories: string[];
    index: string;
    colors?: string[];
    title?: string;
    description?: string;
    className?: string;
}

const defaultColors = [
    '#306FFF', // primary-400
    '#30F0B3', // success-400
    '#FAD670', // warning-400
    '#FF5C5C', // danger-400
    '#7B9FFF', // info-400
];

export function LineChart({
    data,
    categories,
    index,
    colors = defaultColors,
    title,
    description,
    className,
}: LineChartProps) {
    return (
        <ChartWrapper title={title || ''} description={description} className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey={index}
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f9fafb',
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {categories.map((category, i) => (
                        <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={colors[i % colors.length]}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
