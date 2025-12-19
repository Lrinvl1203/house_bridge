import { SimulatorInputs, CalculationResult } from '../types';
import { STRESS_DSR_RATE, DSR_LIMIT } from '../constants';

// Helper: Calculate PMT (Monthly Payment)
// rate: annual rate (%), nper: months, pv: present value (loan amount)
const calculatePMT = (rate: number, nper: number, pv: number): number => {
    if (rate === 0) return pv / nper;
    const r = rate / 100 / 12;
    return (pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
};

// Helper: Calculate PV (Present Value / Loan Amount) from PMT
// Inverse of PMT
const calculatePV = (rate: number, nper: number, pmt: number): number => {
    if (rate === 0) return pmt * nper;
    const r = rate / 100 / 12;
    return (pmt * (Math.pow(1 + r, nper) - 1)) / (r * Math.pow(1 + r, nper));
};

export const calculateScenario = (inputs: SimulatorInputs): CalculationResult => {
    // ALL INTERNAL CALCULATIONS ARE IN MAN-WON (10,000 KRW)

    // 1. Calculate Capital Gains Tax (Yangdo-se)
    let capitalGainsTax = 0;
    const saleDiff = inputs.currentHousePrice - inputs.currentHouseAcqPrice;

    if (saleDiff > 0) {
        let taxableGain = saleDiff;

        // 1-House Exemption (Up to 12 Eok)
        if (inputs.isOneHouse) {
            if (inputs.currentHousePrice <= 120000) {
                taxableGain = 0;
            } else {
                // Proportional reduction
                taxableGain = saleDiff * ((inputs.currentHousePrice - 120000) / inputs.currentHousePrice);
            }
        }

        if (taxableGain > 0) {
            // Long-term Holding Deduction (Jang-Teuk)
            // Max 80% if 1-house + resided
            let deductionRate = 0;
            if (inputs.isOneHouse && inputs.residingYears >= 2) {
                // 4% per holding year + 4% per residing year (Min 3 years holding)
                if (inputs.holdingYears >= 3) {
                    deductionRate = (inputs.holdingYears * 0.04) + (inputs.residingYears * 0.04);
                }
            } else {
                // General: 2% per year (Min 3 years, max 30%)
                if (inputs.holdingYears >= 3) {
                    deductionRate = inputs.holdingYears * 0.02;
                }
            }
            deductionRate = Math.min(deductionRate, 0.80); // Cap at 80%

            const taxBase = taxableGain * (1 - deductionRate) - 250; // Basic deduction 2.5M

            // Simplified Tax Bracket (2024/2025)
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
                // Local Income Tax (10% of CGT)
                capitalGainsTax *= 1.1;
            }
        }
    }

    // 2. Acquisition Tax (Chwideuk-se)
    let acqTaxRate = 0.01; // Base
    const priceEok = inputs.targetHousePrice / 10000; // Convert to Eok for formula

    if (inputs.targetHousePrice <= 60000) {
        acqTaxRate = 0.01;
    } else if (inputs.targetHousePrice <= 90000) {
        // Formula: (Price(Eok) * 2/3 - 3) / 100
        acqTaxRate = ((priceEok * (2 / 3)) - 3) / 100;
    } else {
        // > 9 Eok
        acqTaxRate = 0.03;
    }

    // Add Sur-taxes (Education, Rural)
    // Simplified: 85m2 under adds 0.1% (Edu), 85m2 over adds 0.2% (Rural) + 0.1% (Edu) -> Approx
    let finalAcqRate = acqTaxRate + 0.001; // Edu tax
    if (inputs.targetHouseSizeOver85) {
        finalAcqRate += 0.002; // Rural tax
    }
    // Hard override for >9Eok bracket logic mentioned in prompt to be 3.3% / 3.5%
    if (inputs.targetHousePrice > 90000) {
        finalAcqRate = inputs.targetHouseSizeOver85 ? 0.035 : 0.033;
    } else {
        // Small adjustment for the formula range to match standard total rates roughly
        // We keep the calculated rate plus the assumed surtax. 
        // For MVP simplicity, let's round the rate to 4 decimal places
        finalAcqRate = Math.round(finalAcqRate * 10000) / 10000;
    }

    const acquisitionTax = inputs.targetHousePrice * finalAcqRate;

    // 3. Agent Fees (Brokerage)
    // Simplified logic based on price tiers. Using 0.4%~0.5% average.
    const getAgentFee = (price: number) => {
        let rate = 0.004;
        if (price >= 90000) rate = 0.005;
        if (price >= 120000) rate = 0.006;
        if (price >= 150000) rate = 0.007;
        return price * rate;
    };

    const oldHouseAgentFee = getAgentFee(inputs.currentHousePrice);
    const newHouseAgentFee = getAgentFee(inputs.targetHousePrice);
    const movingCost = 200; // Fixed 200 Man-won estimate for MVP

    const totalClosingCosts = acquisitionTax + newHouseAgentFee + movingCost;

    // 4. Net Proceeds from Sale
    const netSaleProceeds = inputs.currentHousePrice - inputs.existingLoanBalance - capitalGainsTax - oldHouseAgentFee;

    // 5. Buying Power & Loan Needs
    const startCapital = inputs.cashAssets;
    const totalFundsBeforeLoan = startCapital + netSaleProceeds;
    const fundsNeeded = inputs.targetHousePrice + totalClosingCosts;

    // 6. Max Loan Calculation (DSR & LTV)
    // LTV Limit
    const maxLoanLTV = inputs.targetHousePrice * (inputs.targetLTV / 100);

    // DSR Limit (Reverse Calculation)
    // Annual Principal & Interest Cap = Annual Income * 40% - Existing Annual Debt Service
    const annualDSRCap = (inputs.annualIncome * DSR_LIMIT) - inputs.otherAnnualDebtPayment;

    // Stress Rate for DSR Calculation
    const stressRate = inputs.mortgageRate + STRESS_DSR_RATE;

    let maxLoanDSR = 0;
    if (annualDSRCap > 0) {
        // Calculate Max Loan Principal using Stress Rate over Loan Term (Monthly)
        const monthlyCap = annualDSRCap / 12;
        // PV of annuity
        maxLoanDSR = calculatePV(stressRate, inputs.loanTerm * 12, monthlyCap);
    }

    const maxLoanPossible = Math.min(maxLoanLTV, maxLoanDSR);

    // How much do we actually need?
    const gap = fundsNeeded - totalFundsBeforeLoan;
    const finalLoanAmount = Math.max(0, gap); // Can't have negative loan

    // 7. Feasibility Analysis
    const cashBalance = (totalFundsBeforeLoan + maxLoanPossible) - fundsNeeded;

    // Calculate Actual Monthly Payment based on Real Rate (not stress rate)
    const monthlyPayment = calculatePMT(inputs.mortgageRate, inputs.loanTerm * 12, finalLoanAmount);

    // Actual DSR based on final loan amount
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
        cashBalance, // If negative, means even with Max Loan, you can't buy it.
        isDSRSafe: dsrRatio <= 40,
        isCashFlowSafe: monthlyNetIncome > 0,
        startCapital,
        salePrice: inputs.currentHousePrice,
        payoffOldLoan: inputs.existingLoanBalance,
        taxesAndFees: capitalGainsTax + oldHouseAgentFee + acquisitionTax + newHouseAgentFee + movingCost,
        purchasePrice: inputs.targetHousePrice,
    };
};
