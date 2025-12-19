'use client';

import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { useSimulator } from '../hooks/useSimulator';

export default function Home() {
  const { activeTab, setActiveTab, inputs, updateInput, results } = useSimulator();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header / Tabs */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 lg:hidden">Real Estate Bridge</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('A')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'A' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            시나리오 A
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'B' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            시나리오 B
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Hidden on mobile unless toggled (simplified for this MVP to be always visible on large screens) */}
        <div className="hidden lg:block h-full">
          <Sidebar inputs={inputs} updateInput={updateInput} />
        </div>

        {/* Mobile View: Stacked */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="lg:hidden w-full overflow-y-auto max-h-[300px] border-b border-slate-200">
            <Sidebar inputs={inputs} updateInput={updateInput} />
          </div>
          <Dashboard inputs={inputs} results={results} updateInput={updateInput} />
        </div>
      </div>
    </div>
  );
}
