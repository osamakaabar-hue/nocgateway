/**
 * evmTypes.ts
 * ─────────────────────────────────────────────────────────────
 * Earned Value Management (EVM) Data Structures
 * Strictly aligned with PMBOK 7th Edition Standards.
 * Portfolio Baseline: $1.119 Billion.
 * ─────────────────────────────────────────────────────────────
 */

export interface ProjectEvmMetrics {
  projectId: string;
  projectNameEn: string;
  projectNameAr: string;
  subsidiaryId: 'WAHA' | 'AGOCO' | 'SIRTE' | 'MELLITAH' | 'ZALLAF' | 'AKAKUS' | 'HAROUGE' | 'ZUEITINA';
  budgetAtCompletion: number;  // BAC (Total Planned Budget)
  plannedValue: number;        // PV (Budgeted Cost of Work Scheduled)
  earnedValue: number;         // EV (Budgeted Cost of Work Performed)
  actualCost: number;          // AC (Actual Cost of Work Performed)
  
  // Variances
  costVariance: number;        // CV = EV - AC
  scheduleVariance: number;    // SV = EV - PV
  
  // Performance Indices
  costPerformanceIndex: number;     // CPI = EV / AC (CPI < 1.0 = Over Budget)
  schedulePerformanceIndex: number; // SPI = EV / PV (SPI < 1.0 = Behind Schedule)
  
  // Forecasting Metrics
  estimateAtCompletion: number;     // EAC = BAC / CPI
  estimateToComplete: number;       // ETC = EAC - AC
  toCompletePerformanceIndex: number; // TCPI = (BAC - EV) / (BAC - AC)
  varianceAtCompletion: number;     // VAC = BAC - EAC
  
  // SLA Performance
  totalClaimsCount: number;
  slaCompliantClaimsCount: number;
  slaBreachedClaimsCount: number;
  avgSlaResolutionHours: number;
}

export interface PortfolioEvmSummary {
  portfolioBac: number;        // Total $1.119B
  portfolioPv: number;
  portfolioEv: number;
  portfolioAc: number;
  portfolioCv: number;
  portfolioSv: number;
  portfolioCpi: number;
  portfolioSpi: number;
  portfolioEac: number;
  portfolioVac: number;
  totalSlaBreaches: number;
  healthStatus: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  projects: ProjectEvmMetrics[];
}

/**
 * Helper to calculate EVM metrics according to PMBOK 7th Edition formulas
 */
export function calculateEvmMetrics(
  projectId: string,
  projectNameEn: string,
  projectNameAr: string,
  subsidiaryId: ProjectEvmMetrics['subsidiaryId'],
  bac: number,
  pv: number,
  ev: number,
  ac: number,
  slaTotal = 10,
  slaCompliant = 8,
  slaBreached = 2,
  avgHours = 34.5
): ProjectEvmMetrics {
  const costVariance = Number((ev - ac).toFixed(2));
  const scheduleVariance = Number((ev - pv).toFixed(2));
  
  const cpi = ac > 0 ? Number((ev / ac).toFixed(3)) : 1.0;
  const spi = pv > 0 ? Number((ev / pv).toFixed(3)) : 1.0;
  
  const eac = cpi > 0 ? Number((bac / cpi).toFixed(2)) : bac;
  const etc = Number((eac - ac).toFixed(2));
  const tcpiDenominator = bac - ac;
  const tcpi = tcpiDenominator > 0 ? Number(((bac - ev) / tcpiDenominator).toFixed(3)) : 1.0;
  const vac = Number((bac - eac).toFixed(2));

  return {
    projectId,
    projectNameEn,
    projectNameAr,
    subsidiaryId,
    budgetAtCompletion: bac,
    plannedValue: pv,
    earnedValue: ev,
    actualCost: ac,
    costVariance,
    scheduleVariance,
    costPerformanceIndex: cpi,
    schedulePerformanceIndex: spi,
    estimateAtCompletion: eac,
    estimateToComplete: etc,
    toCompletePerformanceIndex: tcpi,
    varianceAtCompletion: vac,
    totalClaimsCount: slaTotal,
    slaCompliantClaimsCount: slaCompliant,
    slaBreachedClaimsCount: slaBreached,
    avgSlaResolutionHours: avgHours,
  };
}
