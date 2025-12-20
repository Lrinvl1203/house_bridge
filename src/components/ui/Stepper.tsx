import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
    steps: string[]
    currentStep: number
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-4">
            <div className="flex items-center justify-between relative">
                {/* Connector Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-brand-600 -z-10 transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isActive = stepNum === currentStep;

                    return (
                        <div key={step} className="flex flex-col items-center bg-white px-2">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors duration-300",
                                isCompleted ? "bg-brand-600 border-brand-600 text-white" :
                                    isActive ? "bg-white border-brand-600 text-brand-600" : "bg-white border-slate-300 text-slate-400"
                            )}>
                                {isCompleted ? <Check size={14} /> : stepNum}
                            </div>
                            <span className={cn(
                                "text-[10px] mt-1 font-medium absolute top-8 whitespace-nowrap",
                                isActive ? "text-brand-600" : "text-slate-400"
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
