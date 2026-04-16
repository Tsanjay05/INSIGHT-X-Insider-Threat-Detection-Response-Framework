import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ChartWrapper } from './ChartWrapper';

interface PieChartProps {
    data: any[];
    category: string;
    index: string;
    colors?: string[];
    title?: string;
    description?: string;
    donut?: boolean;
    className?: string;
}

const defaultColors = [
    '#306FFF', // primary-400
    '#30F0B3', // success-400
    '#FAD670', // warning-400
    '#FF5C5C', // danger-400
    '#7B9FFF', // info-400
];

export function PieChart({
    data,
    category,
    index,
    colors = defaultColors,
    title,
    description,
    donut = false,
    className,
}: PieChartProps) {
    return (
        <ChartWrapper title={title || ''} description={description} className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={donut ? 60 : 0}
                        outerRadius={80}
                        paddingAngle={donut ? 5 : 0}
                        dataKey={category}
                        nameKey={index}
                        stroke="none"
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            borderColor: '#374151',
                            color: '#f9fafb',
                        }}
                        itemStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
        </ChartWrapper>
    );
}
