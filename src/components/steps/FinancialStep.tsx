import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Slider } from './ui/base';
import { Wallet } from 'lucide-react';

interface Props {
    inputs: any;
    updateInput: (key: string, value: any) => void;
}

export const FinancialStep: React.FC<Props> = ({ inputs, updateInput }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">기본 재무 상태를 알려주세요</h2>
                <p className="text-slate-500">정확한 분석을 위해 현재 소득과 자산을 입력해주세요.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-brand-600" />
                        소득 및 자산
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="annualIncome">연소득 (세전)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="annualIncome"
                                type="number"
                                value={inputs.annualIncome}
                                onChange={(e) => updateInput('annualIncome', Number(e.target.value))}
                                className="text-right text-lg font-semibold"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                        <p className="text-xs text-slate-400">DSR 계산의 기준이 됩니다.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cashAssets">보유 현금성 자산</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="cashAssets"
                                type="number"
                                value={inputs.cashAssets}
                                onChange={(e) => updateInput('cashAssets', Number(e.target.value))}
                                className="text-right text-lg font-semibold"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="otherDebt">기타 대출 연 상환액</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="otherDebt"
                                type="number"
                                value={inputs.otherAnnualDebtPayment}
                                onChange={(e) => updateInput('otherAnnualDebtPayment', Number(e.target.value))}
                                className="text-right text-lg font-semibold"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                        <p className="text-xs text-slate-400">신용대출, 자동차 할부 등 1년 동안 갚아야 할 원금+이자</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
