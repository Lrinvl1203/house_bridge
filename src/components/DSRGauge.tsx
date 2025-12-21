'use client';

import React from 'react';

interface Props {
    dsr: number;
}

export const DSRGauge: React.FC<Props> = ({ dsr }) => {
    // Clamp value between 0 and 100 for the visual width
    const percentage = Math.min(Math.max(dsr, 0), 100);

    // Determine color based on DSR value
    // DSR <= 40 is generally safe (Green)
    // 40 < DSR <= 50 is caution (Yellow)
    // DSR > 50 is danger/high risk (Red) - or stricly > 40 is bad depending on strictness
    // Using simple logic: <= 40 Green, <= 50 Yellow, > 50 Red.
    // However, user image showed 40.6% as Danger. So maybe strict 40 limit.
    const getColor = (val: number) => {
        if (val <= 40) return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
        if (val <= 50) return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
        return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
    };

    const colorClass = getColor(dsr);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Battery Body */}
            <div className="relative w-full h-12 rounded-xl border-2 border-slate-600 bg-slate-800/50 p-1 flex items-center">
                {/* Battery Nipple (Connector) - Absolute positioned to the right */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-2 h-6 bg-slate-600 rounded-r-md" />

                {/* Fill Level */}
                <div
                    className={`h-full rounded-lg transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Glossy effect */}
                    <div className="w-full h-1/2 bg-white/20 rounded-t-lg" />
                </div>

                {/* Percentage Text Overlay (Centered) */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-white font-bold drop-shadow-md text-sm md:text-base">
                        {dsr.toFixed(1)}% usage
                    </span>
                </div>
            </div>
        </div>
    );
};
