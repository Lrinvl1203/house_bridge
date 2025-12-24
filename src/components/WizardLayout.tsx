import React, { useState, useEffect } from 'react';
import { useSimulator } from '../hooks/useSimulator';
import { Stepper } from './ui/Stepper';
import { Button } from './ui/base';
import { ChevronRight, ChevronLeft, Diamond } from 'lucide-react';

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
            case 4: return <ResultDashboard results={results} inputs={inputs} updateInput={updateInput} onRestart={handleRestart} onBack={() => setCurrentStep(3)} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background-dark pb-24 md:pb-10 relative">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full -translate-y-1/2 z-0"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-background-dark/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Diamond className="text-primary w-5 h-5 fill-primary/20" />
                        <h1 className="font-bold text-lg text-white tracking-wide">RichSwitch</h1>
                    </div>
                    {currentStep < 4 && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Step {currentStep}/3</span>
                    )}
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 pt-6 pb-32 relative z-10">
                {currentStep < 4 && <Stepper steps={STEPS} currentStep={currentStep} />}

                <div className="mt-6">
                    {renderStep()}
                </div>
            </main>

            {/* Bottom Navigation (Sticky) */}
            {currentStep < 4 && (
                <div className="fixed bottom-0 left-0 w-full bg-background-dark/90 backdrop-blur-xl border-t border-white/5 p-4 z-50 safe-area-bottom">
                    <div className="max-w-md mx-auto flex gap-3">
                        {currentStep > 1 && (
                            <Button variant="secondary" onClick={handleBack} className="flex-1 h-14 text-base">
                                <ChevronLeft size={18} className="mr-1" /> 이전
                            </Button>
                        )}
                        <Button onClick={handleNext} className="flex-[2] h-14 text-base shadow-gold-glow animate-pulse-subtle">
                            {currentStep === 3 ? '결과 보기' : '다음'} <ChevronRight size={18} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
