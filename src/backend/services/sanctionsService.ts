// Simulated OFAC / Sanctions List Service
import { z } from 'zod';
import { ErrorResponse } from '../../shared/schemas';

const SANCTIONED_ENTITIES = [
  "GLOBAL TERROR CORP",
  "BLOCKED OIL SERVICES LTD",
  "SANCTIONED DRILLING INC",
  "RUSTECH ENERGIES", // example
];

export interface SanctionsCheckResult {
  isBlocked: boolean;
  status: 'CLEARED' | 'FLAGGED' | 'BLOCKED';
  reason?: string;
}

export function checkSanctions(contractorName: string): SanctionsCheckResult {
  if (!contractorName) {
    return { isBlocked: false, status: 'CLEARED' };
  }

  const normalized = contractorName.toUpperCase().trim();
  
  if (SANCTIONED_ENTITIES.some(entity => normalized.includes(entity))) {
    return {
      isBlocked: true,
      status: 'BLOCKED',
      reason: 'Entity matches OFAC SDN or NOC internal blocked list.'
    };
  }
  
  // Example of a flagged entity requiring review
  if (normalized.includes('UNKNOWN OFFSHORE')) {
    return {
      isBlocked: false,
      status: 'FLAGGED',
      reason: 'Entity requires manual compliance review.'
    };
  }

  return { isBlocked: false, status: 'CLEARED' };
}
