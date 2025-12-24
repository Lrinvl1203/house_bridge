import React, { useState } from 'react';
import { Card, CardContent } from './ui/base';
import { DSRGauge } from './DSRGauge';
import { WaterfallChart } from './WaterfallChart';
import { CheckCircle, AlertTriangle, RefreshCw, Pencil, BookOpen, ChevronUp, ChevronDown, ChevronLeft, TrendingUp, DollarSign, Home } from 'lucide-react';
import { Slider, Label, Input } from './ui/base';

import { SimulatorInputs } from '../types';
import { SIMULATION_CRITERIA } from '../constants';

interface Props {
    results: any;
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
    onRestart: () => void;
    onBack?: () => void;
}

// Helper: 3-digit comma formatting
const formatNumber = (num: number) => num.toLocaleString();

// Helper: Money formatting with units but keeping commas
const formatMoney = (val: number) => {
    // 10,000 Man-won = 1 Eok
    if (Math.abs(val) >= 10000) {
        const eok = Math.floor(Math.abs(val) / 10000);
        const man = Math.round(Math.abs(val) % 10000);
        return `${eok.toLocaleString()}억 ${man > 0 ? man.toLocaleString() : ''}만원`;
    }
    return `${Math.round(val).toLocaleString()}만원`;
};

// Helper: Raw number input handler (removes non-digits)
const parseNumberInput = (value: string) => {
    return Number(value.replace(/[^0-9.]/g, ''));
};

const formatInputDisplay = (val: number) => val.toLocaleString();

export const ResultDashboard: React.FC<Props> = ({ results, inputs, updateInput, onRestart, onBack }) => {
    const isPossible = results.cashBalance >= 0;
    const [editMode, setEditMode] = useState(false);

    // 자금 부족 시 제안 사항 계산
    const getShortageAdvice = () => {
        if (isPossible) return null;

        const shortage = Math.abs(results.cashBalance);
        const suggestions = [];

        // 1. 매수 가격 조정 (가장 쉬움 - 녹색)
        const reducedPrice = inputs.targetHousePrice - shortage;
        if (reducedPrice > 0) {
            suggestions.push({
                icon: Home,
                color: 'text-blue-400',
                title: '매수 가격 조정',
                description: `매수 예상 가격을 ${formatMoney(reducedPrice)}으로 낮추면 해결됩니다.`,
                adjustment: `${formatMoney(shortage)} 하향`,
                difficulty: 'easy',
                trafficLight: '🟢'
            });
        }

        // 2. 현재 주택 매도가 상향 (중간 - 노란색)
        const increasedOldPrice = inputs.currentHousePrice + shortage;
        suggestions.push({
            icon: TrendingUp,
            color: 'text-green-400',
            title: '현재 주택 매도가 상향',
            description: `현재 주택을 ${formatMoney(increasedOldPrice)}에 매도하면 해결됩니다.`,
            adjustment: `${formatMoney(shortage)} 상향`,
            difficulty: 'medium',
            trafficLight: '🟡'
        });

        // 3. 보유 현금 추가 (중간 - 노란색)
        const additionalCash = inputs.cashAssets + shortage;
        suggestions.push({
            icon: DollarSign,
            color: 'text-yellow-400',
            title: '보유 현금 추가',
            description: `현금을 ${formatMoney(additionalCash)}로 늘리면 해결됩니다.`,
            adjustment: `${formatMoney(shortage)} 추가 필요`,
            difficulty: 'medium',
            trafficLight: '🟡'
        });

        // 4. 연소득 증가 (어려움 - 빨간색)
        const currentDSRLimit = results.maxLoanDSR;
        const neededIncrease = shortage;
        const estimatedIncomeIncrease = (neededIncrease / 0.4) * 12; // DSR 40% 기준 역산
        suggestions.push({
            icon: TrendingUp,
            color: 'text-purple-400',
            title: '연소득 증가',
            description: `연소듍을 약 ${formatMoney(estimatedIncomeIncrease)}만큼 늘리면 DSR 한도가 증가하여 해결 가능합니다.`,
            adjustment: `약 ${formatMoney(estimatedIncomeIncrease)} 증가`,
            difficulty: 'hard',
            trafficLight: '🔴'
        });

        return suggestions;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-slate-600">최종 분석 결과</h2>
                <div className={`text-3xl lg:text-4xl font-extrabold mt-2 ${isPossible ? 'text-green-600' : 'text-red-600'}`}>
                    {isPossible ? '자금 여유' : '자금 부족'}
                </div>
                <div className="text-lg mt-1 font-semibold text-slate-800">
                    {formatMoney(Math.abs(results.cashBalance))} {isPossible ? '남음' : '부족함'}
                </div>

                {/* 자금 부족 시 해결 방안 제시 */}
                {!isPossible && (
                    <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-left">
                        <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            자금 부족 해결 방안
                        </h3>
                        <div className="space-y-3">
                            {getShortageAdvice()?.map((suggestion, idx) => {
                                const Icon = suggestion.icon;
                                return (
                                    <div key={idx} className="bg-white rounded-lg p-3 border border-red-100">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-lg">{suggestion.trafficLight}</span>
                                                <Icon className={`${suggestion.color} shrink-0 mt-0.5`} size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-sm text-slate-800">{suggestion.title}</div>
                                                <div className="text-xs text-slate-600 mt-1">{suggestion.description}</div>
                                                <div className="text-xs text-red-600 font-medium mt-1">{suggestion.adjustment}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Edit Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setEditMode(!editMode)}>
                        <h3 className="font-medium text-base text-white flex items-center gap-2">
                            <Pencil size={16} /> 시뮬레이션 조정 (Quick Edit)
                        </h3>
                        <span className="text-xs text-brand-600">{editMode ? '접기' : '펼치기'}</span>
                    </div>

                    {editMode && (
                        <div className="space-y-6 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>매수 가격 조정 (단위: 만원)</Label>
                                </div>
                                <div className="relative">
                                    {/* Number input with visible arrows */}
                                    <input
                                        type="number"
                                        value={inputs.targetHousePrice}
                                        onChange={(e) => updateInput('targetHousePrice', Number(e.target.value))}
                                        step={100}
                                        min={0}
                                        className="flex h-10 w-full rounded-xl border border-white/10 bg-surface-dark/50 px-4 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-right font-bold text-brand-600 tracking-wide"
                                        style={{
                                            MozAppearance: 'textfield',
                                            WebkitAppearance: 'none'
                                        }}
                                    />
                                    {/* Comma-formatted overlay display */}
                                    <div
                                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm font-bold text-brand-600 tracking-wide"
                                        style={{ opacity: inputs.targetHousePrice ? 1 : 0 }}
                                    >
                                        {inputs.targetHousePrice.toLocaleString()}
                                    </div>
                                    {/* Custom arrow buttons */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => updateInput('targetHousePrice', inputs.targetHousePrice + 100)}
                                            className="w-6 h-4 flex items-center justify-center bg-surface-dark/80 hover:bg-primary/20 rounded text-brand-600 transition-colors"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateInput('targetHousePrice', Math.max(0, inputs.targetHousePrice - 100))}
                                            className="w-6 h-4 flex items-center justify-center bg-surface-dark/80 hover:bg-primary/20 rounded text-brand-600 transition-colors"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>대출 금리 (%)</Label>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        value={inputs.mortgageRate}
                                        onChange={(e) => updateInput('mortgageRate', Number(e.target.value))}
                                        step={0.1}
                                        min={0}
                                        max={100}
                                        className="h-10 text-right font-bold text-brand-600 tracking-wide"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center">
                        <h3 className="text-sm font-medium text-slate-500 mb-4">DSR 안전도</h3>
                        <div className="py-4 w-full flex items-center justify-center px-2">
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

            <div className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="py-4 bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-600 transition-colors"
                        >
                            <ChevronLeft size={20} /> 이전
                        </button>
                    )}
                    <button
                        onClick={onRestart}
                        className={`py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 ${!onBack ? 'col-span-2' : ''}`}
                    >
                        <RefreshCw size={20} /> 처음부터 다시하기
                    </button>
                </div>
            </div>

            <CalculationLogicReference />
        </div>
    );
};

const CalculationLogicReference = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-8 border-t border-slate-200/20 pt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mx-auto mb-4"
            >
                <BookOpen size={16} />
                <span>이 시뮬레이션에 사용된 계산 로직 보기</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isOpen && (
                <Card className="bg-slate-800/50 border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <CardContent className="p-6 text-sm text-slate-300 space-y-8">

                        <div className="space-y-3 pb-6 border-b border-slate-700 border-dashed">
                            <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                🏁 최종 자금 과부족은 어떻게 계산되나요?
                            </h4>
                            <div className="bg-slate-900/50 p-4 rounded-lg font-mono text-xs md:text-sm space-y-2 text-brand-100">
                                <p className="font-bold text-center border-b border-slate-700 pb-2 mb-2">
                                    최종 여유 자금 = (가용 자금 총합) - (필요 자금 총합)
                                </p>
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-center opacity-80">
                                    <div className="text-right">
                                        <div className="text-blue-300">보유 현금</div>
                                        <div className="text-blue-300">+ 매도 순수익</div>
                                        <div className="text-brand-400 font-bold">+ 대출 실행금</div>
                                    </div>
                                    <div className="font-bold">-</div>
                                    <div className="text-left">
                                        <div className="text-red-300">매수 주택 가격</div>
                                        <div className="text-red-300">+ 취득세 등 제반 비용</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs opacity-70">
                                * 계산 결과가 <strong>(+)</strong>면 자금이 충분한 것이고, <strong>(-)</strong>면 해당 금액만큼 현금이 부족한 상태입니다.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-brand-600 flex items-center gap-2">
                                📉 자금 흐름도 각 항목 상세
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/30 p-3 rounded-lg">
                                    <span className="font-bold text-blue-400 block mb-1">1. 순자산 (매도 후)</span>
                                    <p className="text-xs opacity-70">
                                        (기존 주택 가격 - 기존 주택 담보 대출 잔액) + 현재 보유 현금
                                    </p>
                                </div>
                                <div className="bg-slate-900/30 p-3 rounded-lg">
                                    <span className="font-bold text-red-400 block mb-1">2. 매도 비용 차감</span>
                                    <p className="text-xs opacity-70">
                                        기존 주택 매도 시 발생하는 <strong>양도소득세</strong>와 <strong>중개수수료</strong>를 차감합니다.
                                    </p>
                                </div>
                                <div className="bg-slate-900/30 p-3 rounded-lg">
                                    <span className="font-bold text-red-400 block mb-1">3. 매수 비용 차감</span>
                                    <p className="text-xs opacity-70">
                                        새 집을 살 때 내야 하는 <strong>취득세</strong>, <strong>중개수수료</strong>, 그리고 <strong>이사 비용</strong>입니다.
                                    </p>
                                </div>
                                <div className="bg-slate-900/30 p-3 rounded-lg">
                                    <span className="font-bold text-brand-400 block mb-1">4. 부족 자금 대출</span>
                                    <p className="text-xs opacity-70">
                                        LTV와 DSR 한도 내에서 부족한 금액만큼 대출을 실행합니다. (최대 한도까지 받아도 부족하면 '자금 부족' 발생)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 space-y-6">
                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-600 flex items-center gap-2">
                                    📊 양도소득세 (1주택 비과세 및 장특공제)
                                </h4>
                                <p className="leading-relaxed text-xs opacity-80">
                                    1세대 1주택자의 경우 12억 원까지 비과세가 적용됩니다. 12억 원 초과분에 대해서는 장기보유특별공제(보유/거주 기간별 최대 80%)가 적용되며, 기본 공제 250만 원 후 과세표준 구간별(6% ~ 45%) 세율이 적용됩니다. (지방소득세 10% 별도)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-600 flex items-center gap-2">
                                    🏠 취득세 (거래 금액별 차등)
                                </h4>
                                <p className="leading-relaxed text-xs opacity-80">
                                    6억 이하: 1%, 6~9억: 1~3% (비례 구간), 9억 초과: 3%가 적용됩니다. 여기에 지방교육세(0.1%)가 더해지며, 85㎡ 초과 주택은 농어촌특별세(0.2%)가 추가됩니다.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-600 flex items-center gap-2">
                                    🤝 중개수수료 (상한 요율 적용)
                                </h4>
                                <ul className="list-disc list-inside text-xs opacity-80 space-y-1">
                                    <li>9억 미만: 0.4%</li>
                                    <li>9억 ~ 12억: 0.5%</li>
                                    <li>12억 ~ 15억: 0.6%</li>
                                    <li>15억 이상: 0.7%</li>
                                </ul>
                                <p className="text-[10px] text-slate-500 mt-1">* 실제 거래 시 협의 가능</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-brand-600 flex items-center gap-2">
                                    💰 대출 한도 (DSR & LTV)
                                </h4>
                                <p className="leading-relaxed text-xs opacity-80">
                                    LTV(주택담보인정비율)와 DSR(총부채원리금상환비율) 중 더 낮은 금액으로 한도가 결정됩니다. DSR 계산 시 미래 금리 변동 위험을 반영한 스트레스 금리가 가산되어 보수적으로 산출됩니다.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-700/50">
                            <h4 className="font-bold text-yellow-500 flex items-center gap-2">
                                🔑 현재 시뮬레이션에 적용된 기준 (2025년 12월 확인)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs opacity-90">
                                {SIMULATION_CRITERIA.map((criteria, idx) => (
                                    <div key={idx} className="bg-slate-900/40 p-3 rounded border border-slate-700/50">
                                        <span className="text-slate-400 block mb-1">{criteria.label}</span>
                                        <span className="font-bold text-white">{criteria.value}</span>
                                        <span className="block text-[10px] text-slate-500 mt-1">{criteria.note}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex gap-3 items-start">
                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-1">
                                <h5 className="text-red-400 font-bold text-xs">필독: 시뮬레이션 결과 활용 시 유의사항</h5>
                                <p className="text-[11px] text-red-200/70 leading-relaxed">
                                    본 결과는 사용자가 입력한 값과 일반적인 세법/대출 규제를 토대로 추산된 <strong>단순 참고용 시뮬레이션</strong>입니다.
                                    개인의 신용도, 소득 종류, 주택의 세부 조건(규제지역, 오피스텔 등), 그리고 정부 정책의 실시간 변경에 따라
                                    <strong>실제 가능 대출금액 및 세금은 크게 달라질 수 있습니다.</strong>
                                    <br /><br />
                                    부동산 계약 및 대출 실행 전, 반드시 <strong>세무사(세금)</strong> 및 <strong>은행 대출 상담사(대출)</strong>와 교차 확인하시기 바랍니다.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
