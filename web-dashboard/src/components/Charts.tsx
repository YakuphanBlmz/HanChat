import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface DailyActivityChartProps {
    data: { date: string; count: number }[];
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

interface HourlyActivityChartProps {
    data: { hour: number; count: number }[];
}

export const HourlyActivityChart: React.FC<HourlyActivityChartProps> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

interface SenderPieChartProps {
    data: { name: string; count: number }[];
}

export const SenderPieChart: React.FC<SenderPieChartProps> = ({ data }) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
