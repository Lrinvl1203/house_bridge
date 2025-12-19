import { SimulatorInputs } from './types';

export const DEFAULT_INPUTS: SimulatorInputs = {
    // Default: Young professional couple
    annualIncome: 8000, // 80 million KRW
    cashAssets: 5000, // 50 million KRW
    monthlyLivingCost: 250, // 2.5 million KRW
    otherAnnualDebtPayment: 0,

    currentHousePrice: 60000, // 600 million KRW
    currentHouseAcqPrice: 40000, // 400 million KRW
    existingLoanBalance: 20000, // 200 million KRW
    holdingYears: 3,
    residingYears: 2,
    isOneHouse: true,
    isInAdjustedArea: false,

    targetHousePrice: 90000, // 900 million KRW
    targetHouseSizeOver85: false,
    mortgageRate: 4.5, // %
    loanTerm: 40, // years
    targetLTV: 70, // %

    isRealTimePrice: false,
    isRealTimeRate: false,
};

// Agent Fee Rates (Upper limits)
// < 50M: 0.6% (Limit 250k)
// 50M ~ 200M: 0.5% (Limit 800k)
// 200M ~ 900M: 0.4%
// 900M ~ 1.2B: 0.5%
// 1.2B ~ 1.5B: 0.6%
// > 1.5B: 0.7%
export const AGENT_FEE_RATE = 0.004; // Simplified average conservative estimate for target range (2~9 Eok)

export const STRESS_DSR_RATE = 1.5; // Added to interest rate for DSR limit check
export const DSR_LIMIT = 0.40; // 40%
