export const BRAND = {
  primary: '#2C3E50',
  accent: '#52896F',
  background: '#F5F4F2',
  text: '#1a1a2e',
  textLight: '#4a4a68',
  border: '#e8e7e5',
  error: '#991B1B',
} as const

export const TAGLINE = 'Contractors logged. You verify. Compliant operations.'

export const ROUTES = {
  home: '/',
  login: '/login',
  contractor: '/contractor',
  contractorHistory: '/contractor/history',
  manager: '/manager',
  managerContractors: '/manager/contractors',
  managerApplication: (id: string) => `/manager/applications/${id}`,
} as const

export const COMPLIANCE_STATUS = {
  compliant: 'compliant',
  flagged: 'flagged',
  pending: 'pending',
} as const

export const USER_ROLES = {
  manager: 'manager',
  contractor: 'contractor',
} as const

export type ComplianceStatus = (typeof COMPLIANCE_STATUS)[keyof typeof COMPLIANCE_STATUS]
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Shared color tokens for compliance status. Used by ComplianceBadge (lists,
// tables) and ComplianceResult (full submit-confirmation panel). One source
// keeps badges and panels visually consistent.
export const COMPLIANCE_PALETTE: Record<
  ComplianceStatus,
  { bg: string; fg: string; label: string }
> = {
  [COMPLIANCE_STATUS.compliant]: { bg: '#ECFDF5', fg: '#065F46', label: 'COMPLIANT' },
  [COMPLIANCE_STATUS.flagged]:   { bg: '#FEF2F2', fg: BRAND.error, label: 'FLAGGED' },
  [COMPLIANCE_STATUS.pending]:   { bg: '#F4F4F5', fg: '#3F3F46', label: 'PENDING' },
}
