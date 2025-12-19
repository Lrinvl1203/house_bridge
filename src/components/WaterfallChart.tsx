'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { CalculationResult } from '../types';

interface Props {
    data: CalculationResult;
}

const formatManWon = (val: any) => {
    if (typeof val === 'number' && Math.abs(val) >= 10000) {
        return `${(val / 10000).toFixed(1)}억`;
    }
    return `${(Number(val) / 1000).toFixed(0)}천`; // Simple compact formatting
};

export const WaterfallChart: React.FC<Props> = ({ data }) => {
    const chartData = [
        {
            name: '자금 조달 (Sources)',
            '현금': data.startCapital,
            '순매도액': data.netSaleProceeds,
            '필요 대출': data.finalLoanAmount,
        },
        {
            name: '자금 소요 (Uses)',
            '매수가': data.purchasePrice,
            '취득비용': data.totalClosingCosts,
        }
    ];

    const sourceData = [
        { name: '기존 현금', value: data.startCapital, fill: '#64748b' },
        { name: '매도 대금', value: data.salePrice, fill: '#3b82f6' },
        { name: '기존 대출상환', value: -data.payoffOldLoan, fill: '#ef4444' },
        { name: '세금/비용', value: -data.taxesAndFees, fill: '#f97316' },
        { name: '신규 주담대', value: data.finalLoanAmount, fill: '#22c55e' },
    ];

    const waterfallData = [
        { name: '보유 현금', start: 0, end: data.startCapital, color: '#64748b' },
        { name: '매도', start: data.startCapital, end: data.startCapital + data.salePrice, color: '#3b82f6' },
        { name: '대출상환', start: data.startCapital + data.salePrice - data.payoffOldLoan, end: data.startCapital + data.salePrice, color: '#ef4444' }, // Red bar going down
        { name: '세금/비용', start: data.startCapital + data.salePrice - data.payoffOldLoan - data.taxesAndFees, end: data.startCapital + data.salePrice - data.payoffOldLoan, color: '#f97316' },
        { name: '신규대출', start: data.startCapital + data.netSaleProceeds, end: data.startCapital + data.netSaleProceeds + data.finalLoanAmount, color: '#22c55e' },
    ];

    const rangeData = waterfallData.map(d => ({
        name: d.name,
        range: [d.start, d.end], // [min, max]
        color: d.color,
        value: d.end - d.start // Actual value for tooltip
    }));

    const targetPrice = data.purchasePrice + data.totalClosingCosts;

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rangeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatManWon} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: any, name: any, props: any) => {
                            const val = props.payload.value || 0;
                            return [`${(val / 10000).toFixed(2)}억`, props.payload.name];
                        }}
                    />
                    <ReferenceLine y={targetPrice} stroke="#000" strokeDasharray="3 3" label={{ value: "필요 총액", position: 'right', fontSize: 10 }} />
                    <Bar dataKey="range" radius={[4, 4, 4, 4]}>
                        {rangeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList dataKey="value" position="top" formatter={formatManWon} style={{ fontSize: '10px', fill: '#666' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
