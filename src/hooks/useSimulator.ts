'use client';

import { useState, useEffect, useMemo } from 'react';
import { Scenario, SimulatorInputs } from '../types';
import { DEFAULT_INPUTS } from '../constants';
import { calculateScenario } from '../utils/calculations';

const STORAGE_KEY = 'real-estate-bridge-scenarios';

export const useSimulator = () => {
    const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
    const [mounted, setMounted] = useState(false);

    const [scenarios, setScenarios] = useState<{ A: Scenario, B: Scenario }>({
        A: { id: 'A', name: '시나리오 A', inputs: { ...DEFAULT_INPUTS } },
        B: { id: 'B', name: '시나리오 B', inputs: { ...DEFAULT_INPUTS, targetHousePrice: 110000, currentHousePrice: 65000 } }
    });

    // Load from local storage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setScenarios(parsed);
            } catch (e) {
                console.error("Failed to load scenarios", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
        }
    }, [scenarios, mounted]);

    const activeInputs = scenarios[activeTab].inputs;

    const updateInput = (key: keyof SimulatorInputs, value: any) => {
        setScenarios(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                inputs: {
                    ...prev[activeTab].inputs,
                    [key]: value
                }
            }
        }));
    };

    const results = useMemo(() => {
        return calculateScenario(activeInputs);
    }, [activeInputs]);

    return {
        activeTab,
        setActiveTab,
        inputs: activeInputs,
        updateInput,
        results,
        mounted // Component can use this to show loading state if desired
    };
};
