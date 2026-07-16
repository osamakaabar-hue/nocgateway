export type TenantId = 
  | 'NOC_HQ'
  | 'WAHA'
  | 'AGOCO'
  | 'ZALLAF'
  | 'MELLITAH'
  | 'SIRTE'
  | 'ZUEITINA'
  | 'HAROUGE'
  | 'AKAKUS'
  | 'MABRUK';

export interface TenantConfig {
  id: TenantId;
  name: string;
  shortName?: string;
  logoPath: string;
}

export const TENANT_CONFIG: Record<TenantId, TenantConfig> = {
  'NOC_HQ': { id: 'NOC_HQ', name: 'National Oil Corporation', shortName: 'NOC HQ', logoPath: '/assets/logos/noc.svg' },
  'WAHA': { id: 'WAHA', name: 'Waha Oil Company', shortName: 'WAHA', logoPath: '/assets/logos/waha.svg' },
  'AGOCO': { id: 'AGOCO', name: 'Arabian Gulf Oil Company', shortName: 'AGOCO', logoPath: '/assets/logos/agoco.svg' },
  'ZALLAF': { id: 'ZALLAF', name: 'Zallaf Libya Oil & Gas', shortName: 'ZALLAF', logoPath: '/assets/logos/zallaf.svg' },
  'MELLITAH': { id: 'MELLITAH', name: 'Mellitah Oil & Gas', shortName: 'MELLITAH', logoPath: '/assets/logos/mellitah.svg' },
  'SIRTE': { id: 'SIRTE', name: 'Sirte Oil Company', shortName: 'SIRTE', logoPath: '/assets/logos/sirte.svg' },
  'ZUEITINA': { id: 'ZUEITINA', name: 'Zueitina Oil Company', shortName: 'ZUEITINA', logoPath: '/assets/logos/zueitina.svg' },
  'HAROUGE': { id: 'HAROUGE', name: 'Harouge Oil Operations', shortName: 'HAROUGE', logoPath: '/assets/logos/harouge.svg' },
  'AKAKUS': { id: 'AKAKUS', name: 'Akakus Oil Operations', shortName: 'AKAKUS', logoPath: '/assets/logos/akakus.svg' },
  'MABRUK': { id: 'MABRUK', name: 'Mabruk Oil Operations', shortName: 'MABRUK', logoPath: '/assets/logos/mabruk.png' }
};
