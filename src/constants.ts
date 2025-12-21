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
// --- 1. Simulation Logic Configuration (Numbers & Limits) ---
export const SIMULATION_CONFIG = {
    TAX: {
        CAPITAL_GAINS: { // 양도소득세
            // 1세대 1주택 비과세 한도: 12억 원 (단위: 만원)
            ONE_HOUSE_EXEMPTION_LIMIT: 120000,
            // 기본 공제액: 연 250만 원
            BASIC_DEDUCTION: 250,
            // 장기보유특별공제 최대율: 80% (0.8)
            MAX_LONG_TERM_DEDUCTION: 0.8,
            // 지방소득세 가산율: 소득세의 10% (1.1배)
            LOCAL_TAX_RATE: 1.1
        },
        ACQUISITION: { // 취득세
            // 세율 구간 기준 금액 (단위: 만원)
            THRESHOLDS: {
                LOW: 60000,   // 6억 원 이하 (1% 구간)
                HIGH: 90000   // 9억 원 초과 (3% 구간)
            },
            // 기본 취득세율
            RATES: {
                LOW: 0.01,   // 6억 이하 1%
                HIGH: 0.03   // 9억 초과 3%
            },
            // 부가세 (지방교육세, 농어촌특별세)
            SURTAX: {
                EDU: 0.001,   // 지방교육세 0.1%
                RURAL: 0.002  // 농어촌특별세 0.2% (전용 85㎡ 초과 시 부과)
            }
        }
    },
    LOAN: {
        DSR: {
            LIMIT: 0.40, // 40%
            STRESS_RATE: 1.5 // % point to add
        },
        LTV: {
            // This is just a fallback or reference if we need upper cap
            MAX: 80
        }
    },
    FEES: {
        AGENT: {
            // Simplying mostly to upper bounds for now
            // But can be expanded to full table if needed
            THRESHOLDS_AND_RATES: [
                { limit: 5000, rate: 0.006 }, // < 50M
                { limit: 20000, rate: 0.005 }, // < 200M
                { limit: 90000, rate: 0.004 }, // < 900M
                { limit: 120000, rate: 0.005 }, // < 1.2B
                { limit: 150000, rate: 0.006 }, // < 1.5B
                { limit: Infinity, rate: 0.007 } // > 1.5B
            ]
        },
        MOVING_COST: 200 // 2 million KRW
    }
};

// Legacy exports for backward compatibility during refactor (until calculations.ts is updated)
// Deprecated: prefer using SIMULATION_CONFIG directly
export const AGENT_FEE_RATE = 0.004;
export const STRESS_DSR_RATE = SIMULATION_CONFIG.LOAN.DSR.STRESS_RATE;
export const DSR_LIMIT = SIMULATION_CONFIG.LOAN.DSR.LIMIT;


// --- 2. UI Display Configuration using Logic Constants ---
// This ensures text matches the configured numbers automatically.
export const SIMULATION_CRITERIA = [
    {
        label: "DSR 규제 비율",
        value: `${(SIMULATION_CONFIG.LOAN.DSR.LIMIT * 100).toFixed(0)}% 적용 (1금융권 기준)`,
        note: `* 스트레스 금리 +${SIMULATION_CONFIG.LOAN.DSR.STRESS_RATE}% 가산 반영`
    },
    {
        label: "LTV (담보인정비율)",
        value: "사용자 입력값 적용",
        note: "* 규제 지역 여부 미반영 (입력값 우선)"
    },
    {
        label: "1세대 1주택 비과세",
        value: `매도가 ${(SIMULATION_CONFIG.TAX.CAPITAL_GAINS.ONE_HOUSE_EXEMPTION_LIMIT / 10000).toFixed(0)}억 원 이하 전액 비과세`,
        note: `* ${(SIMULATION_CONFIG.TAX.CAPITAL_GAINS.ONE_HOUSE_EXEMPTION_LIMIT / 10000).toFixed(0)}억 초과분만 과세 (장특공제 최대 ${(SIMULATION_CONFIG.TAX.CAPITAL_GAINS.MAX_LONG_TERM_DEDUCTION * 100).toFixed(0)}% 적용)`
    },
    {
        label: "취득세 중과 여부",
        value: `일반세율(${(SIMULATION_CONFIG.TAX.ACQUISITION.RATES.LOW * 100).toFixed(0)}~${(SIMULATION_CONFIG.TAX.ACQUISITION.RATES.HIGH * 100).toFixed(0)}%) 적용`,
        note: "* 다주택자/법인 중과세율은 미반영"
    }
];
