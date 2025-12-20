'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
    dsr: number;
}

export const DSRGauge: React.FC<Props> = ({ dsr }) => {
    const value = Math.min(dsr, 100);
    // Half doughnut logic
    const data = [
        { name: 'DSR', value: value },
        { name: 'Remaining', value: 100 - value }
    ];

    const getColor = (val: number) => {
        if (val <= 40) return '#22c55e'; // Green
        if (val <= 50) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    const color = getColor(value);

    return (
        <div className="relative w-full h-40 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={0}
                        dataKey="value"
                    >
                        <Cell fill={color} />
                        <Cell fill="#333" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 text-center">
                <div className="text-3xl font-bold" style={{ color }}>{dsr.toFixed(1)}%</div>
                <div className="text-xs text-gray-400">DSR (총부채원리금상환비율)</div>
            </div>
        </div>
    );
};
