import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Button } from '../ui/base';
import { Building2, Search, CheckCircle2 } from 'lucide-react';
import { KOREA_REGIONS } from '../../data/regions';
import axios from 'axios';

import { SimulatorInputs } from '../../types';

interface Props {
    inputs: SimulatorInputs;
    updateInput: (key: keyof SimulatorInputs, value: any) => void;
}

export const SellingStep: React.FC<Props> = ({ inputs, updateInput }) => {
    // Local state for search
    const [regionName, setRegionName] = useState('서울특별시 강남구');
    const [showRegionList, setShowRegionList] = useState(false);
    const [regionCode, setRegionCode] = useState(11680);
    const [dealMonth, setDealMonth] = useState(202401);
    const [loading, setLoading] = useState(false);
    const [fetchedData, setFetchedData] = useState<any[]>([]);

    // Apartment Name Filter
    const [aptFilter, setAptFilter] = useState('');

    const filteredRegions = KOREA_REGIONS.filter(r => r.name.includes(regionName) || r.code.includes(regionName));

    const handleRegionSelect = (code: string, name: string) => {
        setRegionCode(Number(code));
        setRegionName(name);
        setShowRegionList(false);
    };

    const fetchRealTimePrice = async () => {
        setLoading(true);
        try {
            // Using fetch directly to match the fix in route.ts logic if client-side axios has issues, 
            // but we fixed route.ts so client axios to internal API is fine.
            const response = await axios.get('/api/molit/transaction', {
                params: { lawdCd: regionCode, dealYmd: dealMonth }
            });

            let items: any[] = [];

            // Logic adapted from Sidebar.tsx
            if (response.data.format === 'xml') {
                const xmlStr = response.data.data;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlStr, "text/xml");
                const itemNodes = xmlDoc.getElementsByTagName("item");
                for (let i = 0; i < itemNodes.length; i++) {
                    const node = itemNodes[i];
                    const item: any = {};
                    for (let j = 0; j < node.childNodes.length; j++) {
                        const child = node.childNodes[j] as Element;
                        if (child.nodeType === 1) item[child.tagName] = child.textContent;
                    }
                    items.push(item);
                }
            } else {
                const dataRoot = response.data.data?.response?.body || response.data?.response?.body;
                if (dataRoot && dataRoot.items) {
                    const rawItems = dataRoot.items.item;
                    items = rawItems ? (Array.isArray(rawItems) ? rawItems : [rawItems]) : [];
                }
            }

            if (items.length > 0) setFetchedData(items);
            else {
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">현재 살고 계신 집을 심사해볼까요?</h2>
                <p className="text-slate-500">매도 예상 가격과 대출 잔액이 필요합니다.</p>
            </div>

            {/* Real-time Search Module */}
            <Card className="bg-brand-50 border-brand-100">
                <CardHeader className="pb-3">
                    <CardTitle className="text-brand-800 text-sm flex items-center gap-2">
                        <Search className="w-4 h-4" /> 실거래가로 내 집 시세 찾기 (Optional)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="relative">
                            <Input
                                value={regionName}
                                onFocus={() => setShowRegionList(true)}
                                onChange={(e) => { setRegionName(e.target.value); setShowRegionList(true); }}
                                placeholder="지역명 (예: 강남구)"
                                className="bg-white"
                            />
                            {showRegionList && regionName && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {filteredRegions.map((r) => (
                                        <div key={r.code} onClick={() => handleRegionSelect(r.code, r.name)} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm">
                                            {r.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={dealMonth}
                                onChange={(e) => setDealMonth(Number(e.target.value))}
                                placeholder="YYYYMM"
                                className="bg-white w-24"
                            />
                            <Button onClick={fetchRealTimePrice} disabled={loading} size="sm" className="flex-1">
                                {loading ? '조회중' : '조회'}
                            </Button>
                        </div>
                    </div>

                    {fetchedData.length > 0 && (
                        <div className="bg-white p-3 rounded-md border border-brand-200 space-y-2">
                            <Input
                                value={aptFilter}
                                onChange={(e) => setAptFilter(e.target.value)}
                                placeholder="아파트 이름 검색 (예: 은마)..."
                                className="text-xs h-8"
                            />
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {fetchedData
                                    .filter(item => item['아파트'].includes(aptFilter))
                                    .slice(0, 10)
                                    .map((item, idx) => (
                                        <div key={idx}
                                            onClick={() => {
                                                const price = parseInt(item['거래금액'].replace(/,/g, ''), 10);
                                                if (confirm(`${price}만원으로 설정할까요?`)) updateInput('currentHousePrice', price);
                                            }}
                                            className="flex justify-between items-center p-2 hover:bg-brand-50 rounded cursor-pointer border-b last:border-0 border-slate-100"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-700">{item['아파트']}</span>
                                                <span className="text-[10px] text-slate-400">{item['전용면적']}㎡ ({item['층']}층)</span>
                                            </div>
                                            <span className="text-xs font-bold text-brand-600">{item['거래금액'].trim()}만원</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-600" />
                        매도 주택 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>매도 예상가</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={inputs.currentHousePrice}
                                onChange={(e) => updateInput('currentHousePrice', Number(e.target.value))}
                                className="text-right text-lg font-bold text-brand-600"
                            />
                            <span className="text-slate-500 w-8">만원</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>취득 당시 가격</Label>
                            <Input
                                type="number"
                                value={inputs.currentHouseAcqPrice}
                                onChange={(e) => updateInput('currentHouseAcqPrice', Number(e.target.value))}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>주담대 잔액</Label>
                            <Input
                                type="number"
                                value={inputs.existingLoanBalance}
                                onChange={(e) => updateInput('existingLoanBalance', Number(e.target.value))}
                                className="text-right"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg flex-1 border border-slate-200">
                            <input
                                type="checkbox"
                                checked={inputs.isOneHouse}
                                onChange={(e) => updateInput('isOneHouse', e.target.checked)}
                                className="w-4 h-4 text-brand-600 accent-brand-600"
                            />
                            <span className="text-sm font-medium">1가구 1주택 (비과세)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg flex-1 border border-slate-200">
                            <input
                                type="checkbox"
                                checked={inputs.isInAdjustedArea}
                                onChange={(e) => updateInput('isInAdjustedArea', e.target.checked)}
                                className="w-4 h-4 text-brand-600 accent-brand-600"
                            />
                            <span className="text-sm font-medium">조정대상지역 포함</span>
                        </label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
