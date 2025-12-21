import { SimulatorInputs, CalculationResult } from '../types';
import { SIMULATION_CONFIG } from '../constants';

// Helper: Calculate PMT (Monthly Payment) / 월 원리금 상환액 계산
// rate: annual rate (%), nper: months, pv: present value (loan amount)
const calculatePMT = (rate: number, nper: number, pv: number): number => {
    if (rate === 0) return pv / nper;
    const r = rate / 100 / 12;
    return (pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
};

// Helper: Calculate PV (Present Value / Loan Amount) from PMT / 대출 가능 원금 역산
// Inverse of PMT
const calculatePV = (rate: number, nper: number, pmt: number): number => {
    if (rate === 0) return pmt * nper;
    const r = rate / 100 / 12;
    return (pmt * (Math.pow(1 + r, nper) - 1)) / (r * Math.pow(1 + r, nper));
};

export const calculateScenario = (inputs: SimulatorInputs): CalculationResult => {
    // ALL INTERNAL CALCULATIONS ARE IN MAN-WON (10,000 KRW) / 모든 계산은 '만원' 단위
    const { TAX, LOAN, FEES } = SIMULATION_CONFIG;

    // 1. Calculate Capital Gains Tax (Yangdo-se) / 1. 양도소득세 계산
    let capitalGainsTax = 0;
    const saleDiff = inputs.currentHousePrice - inputs.currentHouseAcqPrice;

    if (saleDiff > 0) {
        let taxableGain = saleDiff;

        // 1-House Exemption (Up to 12 Eok) / 1세대 1주택 비과세 (12억까지)
        if (inputs.isOneHouse) {
            if (inputs.currentHousePrice <= TAX.CAPITAL_GAINS.ONE_HOUSE_EXEMPTION_LIMIT) {
                taxableGain = 0;
            } else {
                // Proportional reduction / 고가주택 안분 계산
                taxableGain = saleDiff * ((inputs.currentHousePrice - TAX.CAPITAL_GAINS.ONE_HOUSE_EXEMPTION_LIMIT) / inputs.currentHousePrice);
            }
        }

        if (taxableGain > 0) {
            // Long-term Holding Deduction (Jang-Teuk) / 장기보유특별공제
            // Max 80% if 1-house + resided / 1세대 1주택 실거주 시 최대 80%
            let deductionRate = 0;
            if (inputs.isOneHouse && inputs.residingYears >= 2) {
                // 4% per holding year + 4% per residing year (Min 3 years holding) / 보유연수 4% + 거주연수 4%
                if (inputs.holdingYears >= 3) {
                    deductionRate = (inputs.holdingYears * 0.04) + (inputs.residingYears * 0.04);
                }
            } else {
                // General: 2% per year (Min 3 years, max 30%) / 일반 공제: 연 2%
                if (inputs.holdingYears >= 3) {
                    deductionRate = inputs.holdingYears * 0.02;
                }
            }
            deductionRate = Math.min(deductionRate, TAX.CAPITAL_GAINS.MAX_LONG_TERM_DEDUCTION); // Cap at 80%

            const taxBase = taxableGain * (1 - deductionRate) - TAX.CAPITAL_GAINS.BASIC_DEDUCTION; // Basic deduction 2.5M / 기본공제 250만원

            // Simplified Tax Bracket (2024/2025) / 약식 과세표준 구간
            // 1200 ~ 4600: 15%
            // ... simplified logic for MVP
            let taxRate = 0.06;
            let progressDeduction = 0;

            if (taxBase <= 1200) { taxRate = 0.06; }
            else if (taxBase <= 4600) { taxRate = 0.15; progressDeduction = 108; }
            else if (taxBase <= 8800) { taxRate = 0.24; progressDeduction = 522; }
            else if (taxBase <= 15000) { taxRate = 0.35; progressDeduction = 1490; }
            else if (taxBase <= 30000) { taxRate = 0.38; progressDeduction = 1940; }
            else if (taxBase <= 50000) { taxRate = 0.40; progressDeduction = 2540; }
            else if (taxBase <= 100000) { taxRate = 0.42; progressDeduction = 3540; }
            else { taxRate = 0.45; progressDeduction = 6540; }

            if (taxBase > 0) {
                capitalGainsTax = (taxBase * taxRate) - progressDeduction;
                // Local Income Tax (10% of CGT) / 지방소득세 10% 가산
                capitalGainsTax *= TAX.CAPITAL_GAINS.LOCAL_TAX_RATE;
            }
        }
    }

    // 2. Acquisition Tax (Chwideuk-se) / 2. 취득세 계산
    let acqTaxRate = TAX.ACQUISITION.RATES.LOW; // Base / 기본세율
    const priceEok = inputs.targetHousePrice / 10000; // Convert to Eok for formula

    if (inputs.targetHousePrice <= TAX.ACQUISITION.THRESHOLDS.LOW) {
        acqTaxRate = TAX.ACQUISITION.RATES.LOW;
    } else if (inputs.targetHousePrice <= TAX.ACQUISITION.THRESHOLDS.HIGH) {
        // Formula: (Price(Eok) * 2/3 - 3) / 100 / 6~9억 구간 공식
        acqTaxRate = ((priceEok * (2 / 3)) - 3) / 100;
    } else {
        // > 9 Eok / 9억 초과
        acqTaxRate = TAX.ACQUISITION.RATES.HIGH;
    }

    // Add Sur-taxes (Education, Rural) / 부가세 합산 (지방교육세, 농어촌특별세)
    // Simplified: 85m2 under adds 0.1% (Edu), 85m2 over adds 0.2% (Rural) + 0.1% (Edu) -> Approx
    let finalAcqRate = acqTaxRate + TAX.ACQUISITION.SURTAX.EDU; // Edu tax / 지방교육세
    if (inputs.targetHouseSizeOver85) {
        finalAcqRate += TAX.ACQUISITION.SURTAX.RURAL; // Rural tax / 농어촌특별세 (85제곱 초과시)
    }
    // Hard override for >9Eok bracket logic mentioned in prompt to be 3.3% / 3.5%
    if (inputs.targetHousePrice > TAX.ACQUISITION.THRESHOLDS.HIGH) {
        finalAcqRate = inputs.targetHouseSizeOver85 ? 0.035 : 0.033;
    } else {
        // Small adjustment for the formula range to match standard total rates roughly
        // We keep the calculated rate plus the assumed surtax. 
        // For MVP simplicity, let's round the rate to 4 decimal places
        finalAcqRate = Math.round(finalAcqRate * 10000) / 10000;
    }

    const acquisitionTax = inputs.targetHousePrice * finalAcqRate;

    // 3. Agent Fees (Brokerage) / 3. 중개수수료 계산
    // Simplified logic based on price tiers. Using 0.4%~0.5% average.
    const getAgentFee = (price: number) => {
        // Use logic from Fees config if available / 상한 요율 적용
        // For strict config usage, we should iterate FEES.AGENT.THRESHOLDS_AND_RATES
        const feeConfig = FEES.AGENT.THRESHOLDS_AND_RATES.find(t => price < t.limit);
        return price * (feeConfig ? feeConfig.rate : 0.007);
    };

    const oldHouseAgentFee = getAgentFee(inputs.currentHousePrice);
    const newHouseAgentFee = getAgentFee(inputs.targetHousePrice);
    const movingCost = FEES.MOVING_COST;

    const totalClosingCosts = acquisitionTax + newHouseAgentFee + movingCost;

    // 4. Net Proceeds from Sale / 4. 기존 주택 매도 순수익
    const netSaleProceeds = inputs.currentHousePrice - inputs.existingLoanBalance - capitalGainsTax - oldHouseAgentFee;

    // 5. Buying Power & Loan Needs / 5. 가용 자금 및 필요 대출금
    const startCapital = inputs.cashAssets;
    const totalFundsBeforeLoan = startCapital + netSaleProceeds;
    const fundsNeeded = inputs.targetHousePrice + totalClosingCosts;

    // 6. Max Loan Calculation (DSR & LTV) / 6. 대출 한도 계산 (DSR, LTV)
    // LTV Limit / LTV 한도
    const maxLoanLTV = inputs.targetHousePrice * (inputs.targetLTV / 100);

    // DSR Limit (Reverse Calculation) / DSR 기준 한도 역산
    // Annual Principal & Interest Cap = Annual Income * 40% - Existing Annual Debt Service
    const annualDSRCap = (inputs.annualIncome * LOAN.DSR.LIMIT) - inputs.otherAnnualDebtPayment;

    // Stress Rate for DSR Calculation / 스트레스 금리 적용
    const stressRate = inputs.mortgageRate + LOAN.DSR.STRESS_RATE;

    let maxLoanDSR = 0;
    if (annualDSRCap > 0) {
        // Calculate Max Loan Principal using Stress Rate over Loan Term (Monthly)
        const monthlyCap = annualDSRCap / 12;
        // PV of annuity
        maxLoanDSR = calculatePV(stressRate, inputs.loanTerm * 12, monthlyCap);
    }

    const maxLoanPossible = Math.min(maxLoanLTV, maxLoanDSR);

    // How much do we actually need? / 실제 필요 대출금
    const gap = fundsNeeded - totalFundsBeforeLoan;
    const finalLoanAmount = Math.max(0, gap); // Can't have negative loan

    // 7. Feasibility Analysis / 7. 최종 분석 (자금 여력)
    const cashBalance = (totalFundsBeforeLoan + maxLoanPossible) - fundsNeeded;

    // Calculate Actual Monthly Payment based on Real Rate (not stress rate) / 실제 월 상환액 (스트레스 금리 제외)
    const monthlyPayment = calculatePMT(inputs.mortgageRate, inputs.loanTerm * 12, finalLoanAmount);

    // Actual DSR based on final loan amount / 최종 대출 금액 기준 실제 DSR
    const annualDebtService = (monthlyPayment * 12) + inputs.otherAnnualDebtPayment;
    const dsrRatio = (annualDebtService / inputs.annualIncome) * 100;

    const monthlyNetIncome = (inputs.annualIncome / 12) - monthlyPayment - inputs.monthlyLivingCost;

    return {
        netSaleProceeds,
        capitalGainsTax,
        oldHouseAgentFee,
        acquisitionTax,
        newHouseAgentFee,
        movingCost,
        totalClosingCosts,
        maxLoanDSR,
        maxLoanLTV,
        finalLoanAmount,
        dsrRatio,
        monthlyPayment,
        cashBalance, // If negative, means even with Max Loan, you can't buy it. / 음수면 대출을 풀로 받아도 못 산다는 뜻
        isDSRSafe: dsrRatio <= 40,
        isCashFlowSafe: monthlyNetIncome > 0,
        startCapital,
        salePrice: inputs.currentHousePrice,
        payoffOldLoan: inputs.existingLoanBalance,
        taxesAndFees: capitalGainsTax + oldHouseAgentFee + acquisitionTax + newHouseAgentFee + movingCost,
        purchasePrice: inputs.targetHousePrice,
    };
};
