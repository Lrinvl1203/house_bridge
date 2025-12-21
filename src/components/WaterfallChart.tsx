'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { CalculationResult } from '../types';

interface Props {
    data: CalculationResult;
}

const formatManWon = (val: any) => {
    const numVal = Number(val);
    if (Math.abs(numVal) >= 10000) {
        return `${(numVal / 10000).toFixed(1)}억`;
    }
    return `${numVal.toLocaleString()}`;
};

const formatTooltipValue = (val: any) => {
    const num = Number(val);
    if (Math.abs(num) >= 10000) {
        const eok = Math.floor(Math.abs(num) / 10000);
        const man = Math.round(Math.abs(num) % 10000);
        return `${eok.toLocaleString()}억 ${man > 0 ? man.toLocaleString() : ''}만원`;
    }
    return `${Math.round(num).toLocaleString()}만원`;
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
        <div className="w-full h-64 flex flex-col">
            <div className="flex justify-end items-center mb-1 pr-2">
                <div className="flex items-center gap-2 text-xs bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                    <div className="flex items-center gap-1">
                        <div className="w-6 h-[2px] border-t border-dashed border-[#f4c025] mt-[1px]"></div>
                        <span className="text-[#f4c025] font-bold">필요 자금 총액: {formatTooltipValue(targetPrice)}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rangeData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#9ca3af' }}
                            axisLine={{ stroke: '#333' }}
                            tickLine={false}
                            interval={0}
                        />
                        <YAxis tickFormatter={formatManWon} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#333' }} tickLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#2a2720', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any, name: any, props: any) => {
                                const val = props.payload.value || 0;
                                return [formatTooltipValue(val), props.payload.name];
                            }}
                        />
                        <ReferenceLine
                            y={targetPrice}
                            stroke="#f4c025"
                            strokeDasharray="3 3"
                        />
                        <Bar dataKey="range" radius={[4, 4, 4, 4]}>
                            {rangeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                            <LabelList dataKey="value" position="top" formatter={formatManWon} style={{ fontSize: '10px', fill: '#e2e8f0', fontWeight: 'bold' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
