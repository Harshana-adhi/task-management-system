/**
 * The backend's Postgres timestamps sometimes come back as ISO strings
 * without a 'Z'/offset suffix (e.g. "2026-06-22T10:00:00" instead of
 * "...Z"). JavaScript's Date parser treats a string with no timezone
 * marker as LOCAL time, not UTC — which silently shifts every timestamp
 * by the browser's UTC offset (very noticeable in timezones like
 * Sri Lanka's UTC+5:30). This wraps date parsing so timestamps are
 * always treated as UTC unless they already specify an offset.
 */
/**
 * The backend sometimes returns raw Postgres timestamp text rather than
 * a properly formatted ISO string — e.g. "2026-06-22 17:19:50.106916"
 * (space-separated, no 'T', no timezone marker) instead of
 * "2026-06-22T17:19:50.106Z". JavaScript's Date parser doesn't reliably
 * handle the former, and silently misparses or drops the implicit UTC
 * meaning of the latter when the 'Z' is missing. This normalizes both
 * issues: swap the space for 'T', then append 'Z' if no offset is
 * already present, so timestamps are always parsed as UTC.
 */
export function parseServerDate(value) {
  if (!value) return null

  let normalized = String(value).trim().replace(' ', 'T')

  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(normalized)
  if (!hasTimezone) {
    normalized += 'Z'
  }

  return new Date(normalized)
}
