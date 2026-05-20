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
  // Flag box: white-on-solid-red for maximum contrast in any color perception.
  // Same colorblind discipline as the in-app status dots (mod-3.3): never rely
  // on red text on a reddish background -- invert to high-contrast and use a
  // [!] glyph prefix so the warning reads without color too.
  flagsBox: {
    backgroundColor: COMPLIANCE_PALETTE.flagged.solid,
    padding: 10,
    marginBottom: 12,
  },
  flagsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  flagItem: {
    fontSize: 9,
    color: '#fff',
    marginTop: 2,
  },
  flagsDisclaimer: {
    fontSize: 8,
    color: '#fff',
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
  // Violation values: bold + red + underline + a [!] glyph prefix at the call
  // site. Three color-independent signals so the row reads as a problem even
  // in grayscale or red-green colorblind perception.
  valueViolation: {
    fontSize: 9,
    color: COMPLIANCE_PALETTE.flagged.solid,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
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
