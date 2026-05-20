// react-pdf StyleSheet for AuditPDF. Pulled out so the component file stays
// under the 200-line cap. Colors come from BRAND + COMPLIANCE_PALETTE so the
// PDF stays visually consistent with the in-app pages.

import { StyleSheet } from '@react-pdf/renderer'
import { BRAND, COMPLIANCE_PALETTE } from '@/constants'

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: BRAND.text,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottom: `1pt solid ${BRAND.primary}`,
    paddingBottom: 8,
    marginBottom: 12,
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: BRAND.textLight,
    marginTop: 2,
  },
  generated: {
    fontSize: 8,
    color: BRAND.textLight,
  },
  recordBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordId: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.primary,
  },
  submitted: {
    fontSize: 8,
    color: BRAND.textLight,
    marginTop: 2,
  },
  badge: {
    padding: '4 8',
    borderRadius: 3,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
  },
  flagsBox: {
    backgroundColor: COMPLIANCE_PALETTE.flagged.bg,
    borderLeft: `3pt solid ${COMPLIANCE_PALETTE.flagged.solid}`,
    padding: 10,
    marginBottom: 12,
  },
  flagsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COMPLIANCE_PALETTE.flagged.solid,
    marginBottom: 4,
  },
  flagItem: {
    fontSize: 9,
    color: COMPLIANCE_PALETTE.flagged.solid,
    marginTop: 2,
  },
  flagsDisclaimer: {
    fontSize: 8,
    color: COMPLIANCE_PALETTE.flagged.solid,
    marginTop: 6,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BRAND.primary,
    textTransform: 'uppercase',
    textDecoration: 'underline',
    marginTop: 12,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { fontSize: 8, color: BRAND.textLight, width: 130 },
  value: { fontSize: 9, color: BRAND.text, flex: 1 },
  valueViolation: {
    fontSize: 9,
    color: COMPLIANCE_PALETTE.flagged.solid,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 7,
    color: BRAND.textLight,
    textAlign: 'center',
    borderTop: `0.5pt solid ${BRAND.border}`,
    paddingTop: 6,
  },
})
