import React, { useState } from 'react';
import { Card, CardContent } from './ui/base';
import { DSRGauge } from './DSRGauge';
import { WaterfallChart } from './WaterfallChart';
import { CheckCircle, AlertTriangle, RefreshCw, Pencil } from 'lucide-react';
import { Slider, Label } from './ui/base';

import { SimulatorInputs } from '../types';

interface Props {
    results: any;
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
    onRestart: () => void;
}

const formatMoney = (val: number) => {
    if (Math.abs(val) >= 10000) return `${(val / 10000).toFixed(2)}억`;
    return `${Math.round(val).toLocaleString()}만원`;
};

export const ResultDashboard: React.FC<Props> = ({ results, inputs, updateInput, onRestart }) => {
    const isPossible = results.cashBalance >= 0;
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-slate-600">최종 분석 결과</h2>
                <div className={`text-4xl font-extrabold mt-2 ${isPossible ? 'text-green-600' : 'text-red-600'}`}>
                    {isPossible ? '자금 여유' : '자금 부족'}
                </div>
                <div className="text-lg mt-1 font-semibold text-slate-800">
                    {formatMoney(Math.abs(results.cashBalance))} {isPossible ? '남음' : '부족함'}
                </div>
            </div>

            {/* Quick Edit Section */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setEditMode(!editMode)}>
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Pencil size={16} /> 시뮬레이션 조정 (Quick Edit)
                        </h3>
                        <span className="text-xs text-brand-600">{editMode ? '접기' : '펼치기'}</span>
                    </div>

                    {editMode && (
                        <div className="space-y-6 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>매수 가격 조정</Label>
                                    <span className="font-bold text-brand-700">{formatMoney(inputs.targetHousePrice)}</span>
                                </div>
                                <Slider
                                    value={inputs.targetHousePrice}
                                    min={inputs.targetHousePrice * 0.5}
                                    max={inputs.targetHousePrice * 1.5}
                                    step={100}
                                    onChange={(e) => updateInput('targetHousePrice', Number(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>대출 금리</Label>
                                    <span className="font-bold text-brand-700">{inputs.mortgageRate}%</span>
                                </div>
                                <Slider
                                    value={inputs.mortgageRate}
                                    min={2.0} max={8.0} step={0.1}
                                    onChange={(e) => updateInput('mortgageRate', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                        <h3 className="text-sm font-medium text-slate-500 mb-4">DSR 안전도</h3>
                        <div className="h-40 w-full flex items-center justify-center">
                            <DSRGauge dsr={results.dsrRatio} />
                        </div>
                        <p className={`text-sm font-bold ${results.isDSRSafe ? 'text-green-600' : 'text-red-500'}`}>
                            DSR: {results.dsrRatio.toFixed(1)}% ({results.isDSRSafe ? '안전' : '대출 제한 위험'})
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-slate-500 mb-4">비용 상세</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span>취득세</span>
                                <span>{formatMoney(results.acquisitionTax)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>중개수수료 (매수+매도)</span>
                                <span>{formatMoney(results.oldHouseAgentFee + results.newHouseAgentFee)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>이사비용</span>
                                <span>{formatMoney(results.movingCost)}</span>
                            </li>
                            <li className="flex justify-between pt-2 border-t font-semibold">
                                <span>필요 대출금</span>
                                <span className="text-brand-600">{formatMoney(results.finalLoanAmount)}</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">자금 흐름도</h3>
                    <div className="h-64 w-full">
                        <WaterfallChart data={results} />
                    </div>
                </CardContent>
            </Card>

            <button
                onClick={onRestart}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
                <RefreshCw size={20} /> 처음부터 다시하기
            </button>
        </div>
    );
};
