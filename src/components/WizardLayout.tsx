import React, { useState, useEffect } from 'react';
import { useSimulator } from '../hooks/useSimulator';
import { Stepper } from './ui/Stepper';
import { Button } from './ui/base';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { FinancialStep } from './steps/FinancialStep';
import { SellingStep } from './steps/SellingStep';
import { BuyingStep } from './steps/BuyingStep';
import { ResultDashboard } from './ResultDashboard';

const STEPS = ['재무 상태', '현재 집(매도)', '이사 갈 집(매수)'];

export const WizardLayout = () => {
    const { inputs, updateInput, results, activeTab, setActiveTab } = useSimulator();
    const [currentStep, setCurrentStep] = useState(1);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(c => c + 1);
        else setCurrentStep(4); // 4 = Result View
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleRestart = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!isClient) return null; // Prevent hydration mismatch

    // Render Logic
    const renderStep = () => {
        switch (currentStep) {
            case 1: return <FinancialStep inputs={inputs} updateInput={updateInput} />;
            case 2: return <SellingStep inputs={inputs} updateInput={updateInput} />;
            case 3: return <BuyingStep inputs={inputs} updateInput={updateInput} />;
            case 4: return <ResultDashboard results={results} inputs={inputs} updateInput={updateInput} onRestart={handleRestart} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-10">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="font-bold text-lg text-slate-800">Real Estate Bridge</h1>
                    {currentStep < 4 && (
                        <span className="text-xs font-medium text-slate-400">Step {currentStep} of 3</span>
                    )}
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 pt-4">
                {currentStep < 4 && <Stepper steps={STEPS} currentStep={currentStep} />}

                <div className="mt-4">
                    {renderStep()}
                </div>
            </main>

            {/* Bottom Navigation (Sticky) */}
            {currentStep < 4 && (
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 z-50 safe-area-bottom">
                    <div className="max-w-md mx-auto flex gap-3">
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handleBack} className="flex-1 h-12 text-base">
                                <ChevronLeft size={18} className="mr-1" /> 이전
                            </Button>
                        )}
                        <Button onClick={handleNext} className="flex-[2] h-12 text-base shadow-lg shadow-brand-200">
                            {currentStep === 3 ? '결과 분석하기' : '다음'} <ChevronRight size={18} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
