import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Slider } from '../ui/base';
import { Home } from 'lucide-react';

interface Props {
    inputs: any;
    updateInput: (key: string, value: any) => void;
}

export const BuyingStep: React.FC<Props> = ({ inputs, updateInput }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">어떤 집으로 이사 가시나요?</h2>
                <p className="text-slate-500">예상 매수 가격과 희망 대출 조건을 설정해주세요.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-brand-600" />
                        목표 주택 및 대출
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label>매수 예상가격</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={inputs.targetHousePrice}
                                onChange={(e) => updateInput('targetHousePrice', Number(e.target.value))}
                                className="text-right text-lg font-bold text-brand-600"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>희망 대출 금리</Label>
                            <span className="text-brand-600 font-bold">{inputs.mortgageRate}%</span>
                        </div>
                        <Slider
                            value={inputs.mortgageRate}
                            min={2.0} max={8.0} step={0.1}
                            onChange={(e) => updateInput('mortgageRate', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>2.0%</span>
                            <span>8.0%</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>대출 기간 (만기)</Label>
                            <span className="text-brand-600 font-bold">{inputs.loanTerm}년</span>
                        </div>
                        <Slider
                            value={inputs.loanTerm}
                            min={10} max={50} step={1}
                            onChange={(e) => updateInput('loanTerm', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>10년</span>
                            <span>50년</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>희망 LTV (주택담보인정비율)</Label>
                            <span className="text-brand-600 font-bold">{inputs.targetLTV}%</span>
                        </div>
                        <Slider
                            value={inputs.targetLTV}
                            min={0} max={80} step={10}
                            onChange={(e) => updateInput('targetLTV', Number(e.target.value))}
                        />
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>0%</span>
                            <span>80%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
