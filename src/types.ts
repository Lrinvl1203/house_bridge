export interface Scenario {
  id: string;
  name: string;
  inputs: SimulatorInputs;
}

export interface SimulatorInputs {
  // Section A: Basic Info
  annualIncome: number; // Unit: 10,000 KRW
  cashAssets: number; // Unit: 10,000 KRW
  monthlyLivingCost: number; // Unit: 10,000 KRW
  otherAnnualDebtPayment: number; // Unit: 10,000 KRW (Yearly payment for other loans)

  // Section B: Current House (Selling)
  currentHousePrice: number; // Unit: 10,000 KRW (Expected Sell Price)
  currentHouseAcqPrice: number; // Unit: 10,000 KRW (Original Buy Price)
  existingLoanBalance: number; // Unit: 10,000 KRW
  holdingYears: number;
  residingYears: number;
  isOneHouse: boolean; // 1-house exemption eligible
  isInAdjustedArea: boolean; // Is in adjusted area (impacts residency requirement)

  // Section C: New House (Buying)
  targetHousePrice: number; // Unit: 10,000 KRW
  targetHouseSizeOver85: boolean; // > 85m2
  mortgageRate: number; // %
  loanTerm: number; // Years
  targetLTV: number; // % (e.g. 70)
  
  // Real-time Data Flags
  isRealTimePrice?: boolean;
  isRealTimeRate?: boolean;
}

export interface CalculationResult {
  // Buying Power Components
  netSaleProceeds: number;
  capitalGainsTax: number;
  oldHouseAgentFee: number;
  
  // Costs
  acquisitionTax: number;
  newHouseAgentFee: number;
  movingCost: number; // Estimated
  totalClosingCosts: number;

  // Loan Analysis
  maxLoanDSR: number; // Max principal allowed by DSR
  maxLoanLTV: number; // Max principal allowed by LTV
  finalLoanAmount: number; // Actual needed loan
  
  // DSR Analysis
  dsrRatio: number; // %
  monthlyPayment: number; // Monthly PI
  
  // Feasibility
  cashBalance: number; // Positive = Surplus, Negative = Deficit
  isDSRSafe: boolean;
  isCashFlowSafe: boolean;
  
  // Breakdown for Waterfall
  startCapital: number;
  salePrice: number;
  payoffOldLoan: number;
  taxesAndFees: number;
  purchasePrice: number;
}
