'use client';

import React from 'react';
import { CalculationResult, SimulatorInputs } from '../types';
import { WaterfallChart } from './WaterfallChart';
import { DSRGauge } from './DSRGauge';
import { AlertTriangle, CheckCircle, TrendingDown, Info } from 'lucide-react';

interface Props {
    inputs: SimulatorInputs;
    results: CalculationResult;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
}

const formatMoney = (val: number) => {
    if (Math.abs(val) >= 10000) {
        return `${(val / 10000).toFixed(2)}억`;
    }
    return `${Math.round(val).toLocaleString()}만원`;
};

const Card = ({ title, value, subtext, accentColor = "text-slate-900", icon: Icon }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            {Icon && <Icon className="text-slate-300" size={18} />}
        </div>
        <div>
            <div className={`text-2xl font-bold ${accentColor}`}>{value}</div>
            {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
        </div>
    </div>
);

export const Dashboard: React.FC<Props> = ({ inputs, results, updateInput }) => {
    const isPossible = results.cashBalance >= 0;

    return (
        <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50/50">

            {/* Top Status Bar */}
            <div className={`mb-8 p-4 rounded-lg flex items-center gap-4 ${isPossible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className={`p-2 rounded-full ${isPossible ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isPossible ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-red-600" />}
                </div>
                <div>
                    <h2 className={`font-bold text-lg ${isPossible ? 'text-green-800' : 'text-red-800'}`}>
                        {isPossible ? "자금 조달 가능" : "자금 부족"}
                    </h2>
                    <p className={`text-sm ${isPossible ? 'text-green-700' : 'text-red-700'}`}>
                        {isPossible
                            ? `잔여 여유 자금 약 ${formatMoney(results.cashBalance)}이 예상됩니다.`
                            : `약 ${formatMoney(Math.abs(results.cashBalance))}의 자금이 추가로 필요합니다.`}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card
                    title="필요 대출금"
                    value={formatMoney(results.finalLoanAmount)}
                    subtext={`최대 한도: ${formatMoney(Math.min(results.maxLoanLTV, results.maxLoanDSR))}`}
                    accentColor="text-brand-600"
                    icon={TrendingDown}
                />
                <Card
                    title="세금 및 비용 합계"
                    value={formatMoney(results.totalClosingCosts + results.capitalGainsTax + results.oldHouseAgentFee)}
                    subtext={`취득세: ${formatMoney(results.acquisitionTax)}`}
                    icon={Info}
                />
                <Card
                    title="월 원리금 상환액"
                    value={formatMoney(results.monthlyPayment)}
                    subtext={`DSR ${results.dsrRatio.toFixed(1)}% 적용`}
                    accentColor={results.isDSRSafe ? 'text-slate-900' : 'text-red-600'}
                />
                <Card
                    title="순 매도 자금"
                    value={formatMoney(results.netSaleProceeds)}
                    subtext="기존대출 및 양도세 차감 후"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">자금 흐름 분석 (Waterfall)</h3>
                    <WaterfallChart data={results} />
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">DSR 안전도</h3>
                    <p className="text-sm text-slate-500 mb-6 text-center">40% 초과 시 대출이 제한될 수 있습니다</p>
                    <DSRGauge dsr={results.dsrRatio} />

                    <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">대출 금리 민감도</span>
                            <span className="font-medium">{inputs.mortgageRate}%</span>
                        </div>
                        <input
                            type="range"
                            min="2.0"
                            max="8.0"
                            step="0.1"
                            value={inputs.mortgageRate}
                            onChange={(e) => updateInput('mortgageRate', Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>2.0%</span>
                            <span>8.0%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    상세 비용 명세서
                </div>
                <div className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">항목</th>
                                <th className="px-6 py-3 text-right">금액</th>
                                <th className="px-6 py-3">비고</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="bg-white">
                                <td className="px-6 py-4 font-medium">매도 양도소득세</td>
                                <td className="px-6 py-4 text-right text-red-600">-{formatMoney(results.capitalGainsTax)}</td>
                                <td className="px-6 py-4 text-slate-500">{inputs.isOneHouse ? '1세대 1주택 적용' : '일반 과세'}</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-4 font-medium">매도 중개수수료</td>
                                <td className="px-6 py-4 text-right text-red-600">-{formatMoney(results.oldHouseAgentFee)}</td>
                                <td className="px-6 py-4 text-slate-500">상한요율 적용 추정</td>
                            </tr>
                            <tr className="bg-slate-50/50">
                                <td className="px-6 py-4 font-bold text-brand-700">순 매도 수령액</td>
                                <td className="px-6 py-4 text-right font-bold text-brand-700">{formatMoney(results.netSaleProceeds)}</td>
                                <td className="px-6 py-4 text-slate-500">기존 대출 상환 후</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-4 font-medium">신규 취득세</td>
                                <td className="px-6 py-4 text-right text-red-600">-{formatMoney(results.acquisitionTax)}</td>
                                <td className="px-6 py-4 text-slate-500">지방교육세/농특세 포함</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-4 font-medium">신규 중개수수료</td>
                                <td className="px-6 py-4 text-right text-red-600">-{formatMoney(results.newHouseAgentFee)}</td>
                                <td className="px-6 py-4 text-slate-500">상한요율 적용 추정</td>
                            </tr>
                            <tr className="bg-white">
                                <td className="px-6 py-4 font-medium">이사 비용</td>
                                <td className="px-6 py-4 text-right text-red-600">-{formatMoney(results.movingCost)}</td>
                                <td className="px-6 py-4 text-slate-500">예상치</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
