import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Slider } from '../ui/base';
import { Home } from 'lucide-react';

import { SimulatorInputs } from '../../types';

interface Props {
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
}

// Helper for comma formatting
const formatNumber = (num: number) => num.toLocaleString();

export const BuyingStep: React.FC<Props> = ({ inputs, updateInput }) => {
    // Local state for formatted inputs
    const [priceStr, setPriceStr] = useState(formatNumber(inputs.targetHousePrice));
    const [rateStr, setRateStr] = useState(inputs.mortgageRate.toString());
    const [termStr, setTermStr] = useState(inputs.loanTerm.toString());
    const [ltvStr, setLtvStr] = useState(inputs.targetLTV.toString());

    // Sync from props
    useEffect(() => { setPriceStr(formatNumber(inputs.targetHousePrice)); }, [inputs.targetHousePrice]);
    useEffect(() => { setRateStr(inputs.mortgageRate.toString()); }, [inputs.mortgageRate]);
    useEffect(() => { setTermStr(inputs.loanTerm.toString()); }, [inputs.loanTerm]);
    useEffect(() => { setLtvStr(inputs.targetLTV.toString()); }, [inputs.targetLTV]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>,
        field: keyof SimulatorInputs
    ) => {
        const raw = e.target.value.replace(/,/g, '');
        // Allow decimals for rate, integers for others
        if (field === 'mortgageRate' && !/^[\d.]*$/.test(raw)) return;
        if (field !== 'mortgageRate' && !/^\d*$/.test(raw)) return;

        const val = Number(raw);
        setter(field === 'mortgageRate' ? raw : Number(raw).toLocaleString());
        updateInput(field, val);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">어떤 집으로 이사 가시나요?</h2>
                <p className="text-gray-400 text-sm">예상 매수 가격과 희망 대출 조건을 설정해주세요.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-primary" />
                        목표 주택 및 대출
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label>매수 예상가격</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={priceStr}
                                onChange={(e) => handleChange(e, setPriceStr, 'targetHousePrice')}
                                className="text-right text-lg font-bold text-brand-600"
                                placeholder="0"
                            />
                            <span className="text-gray-400 w-8">만원</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>희망 대출 금리</Label>
                            <div className="flex items-center gap-2 w-24">
                                <Input
                                    value={rateStr}
                                    onChange={(e) => handleChange(e, setRateStr, 'mortgageRate')}
                                    className="text-right font-bold text-brand-600 h-8"
                                />
                                <span className="text-sm font-bold text-brand-600">%</span>
                            </div>
                        </div>
                        <Slider
                            value={inputs.mortgageRate}
                            min={2.0} max={8.0} step={0.1}
                            onChange={(e) => updateInput('mortgageRate', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>2.0%</span>
                            <span>8.0%</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>대출 기간 (만기)</Label>
                            <div className="flex items-center gap-2 w-24">
                                <Input
                                    value={termStr}
                                    onChange={(e) => handleChange(e, setTermStr, 'loanTerm')}
                                    className="text-right font-bold text-brand-600 h-8"
                                />
                                <span className="text-sm font-bold text-brand-600">년</span>
                            </div>
                        </div>
                        <Slider
                            value={inputs.loanTerm}
                            min={10} max={50} step={1}
                            onChange={(e) => updateInput('loanTerm', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>10년</span>
                            <span>50년</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>희망 LTV (주택담보인정비율)</Label>
                            <div className="flex items-center gap-2 w-24">
                                <Input
                                    value={ltvStr}
                                    onChange={(e) => handleChange(e, setLtvStr, 'targetLTV')}
                                    className="text-right font-bold text-brand-600 h-8"
                                />
                                <span className="text-sm font-bold text-brand-600">%</span>
                            </div>
                        </div>
                        <Slider
                            value={inputs.targetLTV}
                            min={0} max={80} step={10}
                            onChange={(e) => updateInput('targetLTV', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>0%</span>
                            <span>80%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
