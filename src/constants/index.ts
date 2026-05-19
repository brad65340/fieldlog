export const BRAND = {
  primary: '#2C3E50',
  accent: '#52896F',
  background: '#F5F4F2',
  text: '#1a1a2e',
  textLight: '#4a4a68',
  border: '#e8e7e5',
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
