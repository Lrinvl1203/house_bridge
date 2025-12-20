import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
    steps: string[]
    currentStep: number
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-4 relative z-10">
            <div className="flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-primary to-brand-600 -z-10 transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isActive = stepNum === currentStep;

                    return (
                        <div key={step} className="flex flex-col items-center bg-transparent px-2">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all duration-300 shadow-lg",
                                isCompleted ? "bg-primary border-primary text-black shadow-gold-glow" :
                                    isActive ? "bg-background-dark border-primary text-primary shadow-gold-glow scale-110" : "bg-surface-dark border-white/10 text-gray-500"
                            )}>
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
                            </div>
                            <span className={cn(
                                "text-[10px] mt-2 font-bold absolute top-8 whitespace-nowrap transition-colors duration-300",
                                isActive ? "text-primary" : "text-gray-500"
                            )}>
                                {step}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
