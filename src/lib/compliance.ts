// Compliance check engine. Pure function, no side effects, no I/O.
// Given a product's label rules and the captured weather + application rate,
// returns the compliance status and the list of human-readable flag reasons.
//
// Rule sources:
//   - product.max_wind_speed         vs  weather.wind_speed
//   - product.min_temp / max_temp    vs  weather.temperature
//   - product.max_rate_per_acre      vs  application.rate_applied
//
// Always collect ALL failures. Never short-circuit on the first flag --
// downstream UI shows them all, and EPA audit records benefit from a
// complete record of which thresholds were exceeded.

import { COMPLIANCE_STATUS } from '@/constants'
import type { Product } from '@/types'

export interface ComplianceWeatherInput {
  wind_speed: number
  temperature: number
}

export interface ComplianceApplicationInput {
  rate_applied: number
}

export interface ComplianceResult {
  status: 'compliant' | 'flagged'
  flags: string[]
}

export function checkCompliance(
  product: Product,
  weather: ComplianceWeatherInput,
  application: ComplianceApplicationInput
): ComplianceResult {
  const flags: string[] = []

  if (product.max_wind_speed !== null && weather.wind_speed > product.max_wind_speed) {
    flags.push(
      `Wind speed ${weather.wind_speed} mph exceeded label limit of ${product.max_wind_speed} mph`
    )
  }

  if (product.min_temp !== null && weather.temperature < product.min_temp) {
    flags.push(
      `Temperature ${weather.temperature}F below label minimum of ${product.min_temp}F`
    )
  }

  if (product.max_temp !== null && weather.temperature > product.max_temp) {
    flags.push(
      `Temperature ${weather.temperature}F exceeded label maximum of ${product.max_temp}F`
    )
  }

  if (
    product.max_rate_per_acre !== null &&
    application.rate_applied > product.max_rate_per_acre
  ) {
    flags.push(
      `Application rate ${application.rate_applied} exceeded label maximum of ${product.max_rate_per_acre} oz/acre`
    )
  }

  return {
    status: flags.length > 0 ? COMPLIANCE_STATUS.flagged : COMPLIANCE_STATUS.compliant,
    flags,
  }
}
