'use client';

import React, { useState } from 'react';
import { SimulatorInputs } from '../types';
import { ChevronDown, ChevronUp, Calculator, Building2, Wallet, Search } from 'lucide-react';
import axios from 'axios';
import { KOREA_REGIONS } from '../data/regions';

interface SidebarProps {
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
}

const InputGroup = ({ label, children, isOpen, onToggle, icon: Icon }: any) => (
    <div className="border-b border-slate-200 last:border-0">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-2 font-semibold text-slate-700">
                {Icon && <Icon size={18} className="text-brand-600" />}
                {label}
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {isOpen && (
            <div className="p-4 bg-slate-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

const NumberInput = ({ label, value, onChange, unit = "만원", step = 1000 }: any) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                step={step}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-right pr-12"
            />
            <span className="absolute right-3 top-2 text-sm text-slate-400 pointer-events-none">{unit}</span>
        </div>
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
        />
        <span className="text-sm text-slate-700">{label}</span>
    </label>
);

export const Sidebar: React.FC<SidebarProps> = ({ inputs, updateInput }) => {
    // Set 'realtime' to true by default
    const [sections, setSections] = useState({ a: true, b: true, c: true, realtime: true });

    const toggle = (key: keyof typeof sections) => setSections(p => ({ ...p, [key]: !p[key] }));

    const [regionCode, setRegionCode] = useState(11680);
    const [regionName, setRegionName] = useState('서울특별시 강남구');
    const [showRegionList, setShowRegionList] = useState(false);
    const [dealMonth, setDealMonth] = useState(202401);

    // Apartment Name Filter
    const [aptFilter, setAptFilter] = useState('');

    const filteredRegions = KOREA_REGIONS.filter(r => r.name.includes(regionName) || r.code.includes(regionName));

    const handleRegionSelect = (code: string, name: string) => {
        setRegionCode(Number(code));
        setRegionName(name);
        setShowRegionList(false);
    };

    const [loading, setLoading] = useState(false);
    const [fetchedData, setFetchedData] = useState<any[]>([]);

    const fetchRealTimePrice = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/molit/transaction', {
                params: { lawdCd: regionCode, dealYmd: dealMonth }
            });

            let items: any[] = [];

            if (response.data.format === 'xml') {
                // Basic XML parsing for MoLIT API if it returns raw XML string
                const xmlStr = response.data.data;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlStr, "text/xml");
                const itemNodes = xmlDoc.getElementsByTagName("item");

                for (let i = 0; i < itemNodes.length; i++) {
                    const node = itemNodes[i];
                    const item: any = {};
                    for (let j = 0; j < node.childNodes.length; j++) {
                        const child = node.childNodes[j] as Element;
                        if (child.nodeType === 1) {
                            item[child.tagName] = child.textContent;
                        }
                    }
                    items.push(item);
                }
            } else {
                // Handling JSON response
                const dataRoot = response.data.data?.response?.body || response.data?.response?.body;
                if (dataRoot && dataRoot.items) {
                    const rawItems = dataRoot.items.item;
                    items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
                }
            }

            if (items.length > 0) {
                setFetchedData(items);
            } else {
                alert('해당 조건의 거래 내역이 없습니다.');
                setFetchedData([]);
            }
        } catch (e) {
            console.error(e);
            alert('조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:w-96 bg-white border-r border-slate-200 h-full flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calculator className="text-brand-600" />
                    Real Estate Bridge
                </h1>
                <p className="text-xs text-slate-500 mt-1">부동산 갈아타기 시뮬레이터</p>
            </div>

            <InputGroup
                label="기본 재무 정보"
                isOpen={sections.a}
                onToggle={() => toggle('a')}
                icon={Wallet}
            >
                <NumberInput
                    label="연소득 (세전)"
                    value={inputs.annualIncome}
                    onChange={(v: number) => updateInput('annualIncome', v)}
                    step={100}
                />
                <NumberInput
                    label="보유 현금성 자산"
                    value={inputs.cashAssets}
                    onChange={(v: number) => updateInput('cashAssets', v)}
                />
                <NumberInput
                    label="월 필수 생활비"
                    value={inputs.monthlyLivingCost}
                    onChange={(v: number) => updateInput('monthlyLivingCost', v)}
                    step={10}
                />
                <NumberInput
                    label="기타 대출 연 상환액"
                    value={inputs.otherAnnualDebtPayment}
                    onChange={(v: number) => updateInput('otherAnnualDebtPayment', v)}
                    step={100}
                />
            </InputGroup>

            <InputGroup
                label="현재 거주 주택 (매도)"
                isOpen={sections.b}
                onToggle={() => toggle('b')}
                icon={Building2}
            >
                <NumberInput
                    label="매도 예상가"
                    value={inputs.currentHousePrice}
                    onChange={(v: number) => updateInput('currentHousePrice', v)}
                />
                <NumberInput
                    label="취득 당시 가격"
                    value={inputs.currentHouseAcqPrice}
                    onChange={(v: number) => updateInput('currentHouseAcqPrice', v)}
                />
                <NumberInput
                    label="주담대 잔액"
                    value={inputs.existingLoanBalance}
                    onChange={(v: number) => updateInput('existingLoanBalance', v)}
                />
                <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                        label="보유 기간"
                        value={inputs.holdingYears}
                        onChange={(v: number) => updateInput('holdingYears', v)}
                        unit="년"
                        step={1}
                    />
                    <NumberInput
                        label="거주 기간"
                        value={inputs.residingYears}
                        onChange={(v: number) => updateInput('residingYears', v)}
                        unit="년"
                        step={1}
                    />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <Checkbox
                        label="1가구 1주택 비과세 대상"
                        checked={inputs.isOneHouse}
                        onChange={(v: boolean) => updateInput('isOneHouse', v)}
                    />
                    <Checkbox
                        label="조정대상지역 취득"
                        checked={inputs.isInAdjustedArea}
                        onChange={(v: boolean) => updateInput('isInAdjustedArea', v)}
                    />
                </div>
            </InputGroup>

            <InputGroup
                label="이사 갈 집 (매수)"
                isOpen={sections.c}
                onToggle={() => toggle('c')}
                icon={Building2}
            >
                <NumberInput
                    label="매수 예상가"
                    value={inputs.targetHousePrice}
                    onChange={(v: number) => updateInput('targetHousePrice', v)}
                />
                <NumberInput
                    label="희망 대출 금리"
                    value={inputs.mortgageRate}
                    onChange={(v: number) => updateInput('mortgageRate', v)}
                    unit="%"
                    step={0.1}
                />
                <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                        label="대출 만기"
                        value={inputs.loanTerm}
                        onChange={(v: number) => updateInput('loanTerm', v)}
                        unit="년"
                        step={1}
                    />
                    <NumberInput
                        label="LTV 한도"
                        value={inputs.targetLTV}
                        onChange={(v: number) => updateInput('targetLTV', v)}
                        unit="%"
                        step={10}
                    />
                </div>
                <div className="pt-2">
                    <Checkbox
                        label="전용 85㎡ 초과 (대형)"
                        checked={inputs.targetHouseSizeOver85}
                        onChange={(v: boolean) => updateInput('targetHouseSizeOver85', v)}
                    />
                </div>
            </InputGroup>

            <InputGroup
                label="실시간 실거래가 조회 (국토부)"
                isOpen={sections.realtime}
                onToggle={() => toggle('realtime')}
                icon={Building2}
            >
                <div className="space-y-3">
                    <div className="text-xs text-slate-500 p-2 bg-slate-100 rounded">
                        법정동코드와 계약월을 입력하여 최근 실거래가를 조회합니다.
                    </div>

                    <div className="relative">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-slate-500">지역 검색 (예: 강남구, 11680)</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={regionName}
                                    onFocus={() => setShowRegionList(true)}
                                    onChange={(e) => {
                                        setRegionName(e.target.value);
                                        setShowRegionList(true);
                                    }}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-8"
                                    placeholder="지역명 검색"
                                />
                                <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
                            </div>
                        </div>

                        {showRegionList && regionName && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {filteredRegions.length > 0 ? (
                                    filteredRegions.map((region) => (
                                        <button
                                            key={region.code}
                                            onClick={() => handleRegionSelect(region.code, region.name)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700 block"
                                        >
                                            <span className="font-semibold text-slate-700">{region.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">({region.code})</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-xs text-slate-400">검색 결과가 없습니다</div>
                                )}
                            </div>
                        )}
                    </div>
                    <NumberInput
                        label="계약월 (YYYYMM)"
                        value={dealMonth}
                        onChange={(v: number) => setDealMonth(v)}
                        unit=""
                        step={1}
                    />

                    <button
                        onClick={fetchRealTimePrice}
                        disabled={loading}
                        className="w-full py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                    >
                        {loading ? '조회 중...' : '실거래가 조회'}
                    </button>

                    {fetchedData.length > 0 && (
                        <div className="mt-2 space-y-2">
                            <input
                                type="text"
                                value={aptFilter}
                                onChange={(e) => setAptFilter(e.target.value)}
                                placeholder="결과 내 아파트명 검색..."
                                className="w-full text-xs border border-slate-300 rounded px-2 py-1 mb-1"
                            />
                            <div className="text-xs space-y-1 max-h-40 overflow-y-auto border border-slate-200 rounded p-2 bg-white">
                                {fetchedData
                                    .filter(item => item['아파트'].includes(aptFilter))
                                    .slice(0, 20) // Limit display count
                                    .map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between border-b last:border-0 py-1 cursor-pointer hover:bg-slate-50" onClick={() => {
                                            // Simple auto-fill logic: updates current house price
                                            const price = parseInt(item['거래금액'].replace(/,/g, ''), 10);
                                            if (confirm(`${item['아파트']} (${item['전용면적']}㎡) ${price}만원을\n현재 매도 예상가로 설정하시겠습니까?`)) {
                                                updateInput('currentHousePrice', price);
                                            }
                                        }}>
                                            <div className="flex flex-col">
                                                <span>{item['아파트']}</span>
                                                <span className="text-slate-400 text-[10px]">{item['전용면적']}㎡ ({Math.round(Number(item['전용면적']) / 3.3)}평)</span>
                                            </div>
                                            <span className="font-bold">{item['거래금액'].trim()}만원</span>
                                        </div>
                                    ))}
                                {fetchedData.filter(item => item['아파트'].includes(aptFilter)).length === 0 && (
                                    <div className="text-center text-slate-400 py-2">검색 결과가 없습니다.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </InputGroup>

            <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
                * 2025년 세법 기준 예상치이며, 실제 대출 가능 여부는 은행 심사가 필요합니다.
            </div>
        </div>
    );
};
