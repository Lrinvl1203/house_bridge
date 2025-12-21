import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Slider } from '../ui/base';
import { Wallet } from 'lucide-react';

import { SimulatorInputs } from '../../types';

interface Props {
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
}

// Helper for comma formatting
const formatNumber = (num: number) => num.toLocaleString();

export const FinancialStep: React.FC<Props> = ({ inputs, updateInput }) => {
    // Local state for formatted display strings
    const [incomeStr, setIncomeStr] = useState(formatNumber(inputs.annualIncome));
    const [assetsStr, setAssetsStr] = useState(formatNumber(inputs.cashAssets));
    const [debtStr, setDebtStr] = useState(formatNumber(inputs.otherAnnualDebtPayment));

    // Sync from props (in case of back navigation or reset)
    useEffect(() => { setIncomeStr(formatNumber(inputs.annualIncome)); }, [inputs.annualIncome]);
    useEffect(() => { setAssetsStr(formatNumber(inputs.cashAssets)); }, [inputs.cashAssets]);
    useEffect(() => { setDebtStr(formatNumber(inputs.otherAnnualDebtPayment)); }, [inputs.otherAnnualDebtPayment]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>,
        field: keyof SimulatorInputs
    ) => {
        const raw = e.target.value.replace(/,/g, '');
        if (!/^\d*$/.test(raw)) return;

        const val = Number(raw);
        setter(Number(raw).toLocaleString());
        updateInput(field, val);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">기본 재무 상태를 알려주세요</h2>
                <p className="text-gray-400 text-sm">정확한 분석을 위해 현재 소득과 자산을 입력해주세요.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        소득 및 자산
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="annualIncome">연소득 (세전)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="annualIncome"
                                type="text"
                                value={incomeStr}
                                onChange={(e) => handleChange(e, setIncomeStr, 'annualIncome')}
                                className="text-right text-lg font-semibold"
                                placeholder="0"
                            />
                            <span className="text-gray-400 w-8">만원</span>
                        </div>
                        <p className="text-xs text-gray-500">DSR 계산의 기준이 됩니다.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cashAssets">보유 현금성 자산</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="cashAssets"
                                type="text"
                                value={assetsStr}
                                onChange={(e) => handleChange(e, setAssetsStr, 'cashAssets')}
                                className="text-right text-lg font-semibold"
                                placeholder="0"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="otherDebt">기타 대출 연 상환액</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="otherDebt"
                                type="text"
                                value={debtStr}
                                onChange={(e) => handleChange(e, setDebtStr, 'otherAnnualDebtPayment')}
                                className="text-right text-lg font-semibold"
                                placeholder="0"
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
