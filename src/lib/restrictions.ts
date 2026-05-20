// Pure helper for re-entry and pre-harvest restriction math.
// Consumed by FieldStatusCards (dashboard right column) and the timetable
// page (Module 5.6) -- single source of truth so the rule "now < clearsMs
// means active" can't drift between callers.

export const MS_PER_HOUR = 3_600_000
export const MS_PER_DAY = 86_400_000

export interface RestrictionInfo {
  reEntryClearsMs: number | null
  preHarvestClearsMs: number | null
  reEntryActive: boolean
  preHarvestActive: boolean
  anyActive: boolean
}

export function computeRestriction(
  applicationStartIso: string,
  reEntryHours: number | null | undefined,
  preHarvestDays: number | null | undefined,
  nowMs: number = Date.now(),
): RestrictionInfo {
  const startMs = new Date(applicationStartIso).getTime()
  const reEntryClearsMs = reEntryHours != null ? startMs + reEntryHours * MS_PER_HOUR : null
  const preHarvestClearsMs = preHarvestDays != null ? startMs + preHarvestDays * MS_PER_DAY : null
  const reEntryActive = reEntryClearsMs != null && nowMs < reEntryClearsMs
  const preHarvestActive = preHarvestClearsMs != null && nowMs < preHarvestClearsMs
  return {
    reEntryClearsMs,
    preHarvestClearsMs,
    reEntryActive,
    preHarvestActive,
    anyActive: reEntryActive || preHarvestActive,
  }
}
