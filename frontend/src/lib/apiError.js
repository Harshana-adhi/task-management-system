/**
 * The backend returns errors in two different shapes depending on where
 * they're thrown:
 *  - Joi validation (validationMiddleware): { error_code, message, details: [{ field, message }] }
 *  - Controller-level errors (e.g. wrong password): { error, message }
 * This normalizes both into one shape the UI can rely on.
 */
export function parseApiError(error) {
  const data = error?.response?.data

  if (!data) {
    return { message: 'Network error. Check your connection and try again.', fieldErrors: {} }
  }

  const fieldErrors = {}
  if (Array.isArray(data.details)) {
    for (const d of data.details) {
      fieldErrors[d.field] = d.message
    }
  }

  return {
    message: data.message || 'Something went wrong. Please try again.',
    fieldErrors,
  }
}
