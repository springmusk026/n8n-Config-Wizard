/**
 * Validation service for n8n Configuration Wizard
 * Requirements: 2.2, 2.3, 2.4
 */

import type { ValidationError, ValidationResult } from '../types'
import { getFieldRules, POSTGRES_REQUIRED_FIELDS, REDIS_REQUIRED_FIELDS } from './rules'

// ============================================================================
// Field-Level Validation
// ============================================================================

/**
 * Validates a single field value against its rules
 * Returns an array of ValidationError objects for any failures
 * 
 * @param fieldName - The name of the field to validate
 * @param value - The current value of the field
 * @param config - The full configuration object (for dependency checks)
 * @returns Array of validation errors (empty if valid)
 */
export function validateField(
  fieldName: string,
  value: string,
  config: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = []
  const rules = getFieldRules(fieldName)

  for (const rule of rules) {
    const isValid = rule.validate(value, config)
    if (!isValid) {
      errors.push({
        field: fieldName,
        message: rule.message,
        type: 'error',
      })
    }
  }

  return errors
}

// ============================================================================
// Config-Level Validation
// ============================================================================

/**
 * Validates the entire configuration including dependency checks
 * 
 * @param config - The full configuration object to validate
 * @returns ValidationResult with all errors and warnings
 */
export function validateConfig(config: Record<string, string>): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Validate each field in the config
  for (const [fieldName, value] of Object.entries(config)) {
    const fieldErrors = validateField(fieldName, value, config)
    errors.push(...fieldErrors)
  }

  // Check PostgreSQL dependencies when DB_TYPE is 'postgresdb'
  if (config.DB_TYPE === 'postgresdb') {
    for (const field of POSTGRES_REQUIRED_FIELDS) {
      const value = config[field]
      const isEmpty = value === undefined || value === null || value.trim() === ''
      if (isEmpty) {
        // Only add if not already in errors
        const alreadyHasError = errors.some(
          e => e.field === field && e.type === 'error'
        )
        if (!alreadyHasError) {
          errors.push({
            field,
            message: `${field} is required when using PostgreSQL database`,
            type: 'error',
          })
        }
      }
    }
  }

  // Check Redis dependencies when EXECUTIONS_MODE is 'queue'
  if (config.EXECUTIONS_MODE === 'queue') {
    for (const field of REDIS_REQUIRED_FIELDS) {
      const value = config[field]
      const isEmpty = value === undefined || value === null || value.trim() === ''
      if (isEmpty) {
        // Only add if not already in errors
        const alreadyHasError = errors.some(
          e => e.field === field && e.type === 'error'
        )
        if (!alreadyHasError) {
          errors.push({
            field,
            message: `${field} is required when using Queue mode`,
            type: 'error',
          })
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if a configuration is valid for generation
 * 
 * @param config - The configuration to check
 * @returns true if the configuration can be generated
 */
export function canGenerate(config: Record<string, string>): boolean {
  const result = validateConfig(config)
  return result.valid
}

/**
 * Gets all validation errors grouped by field
 * 
 * @param config - The configuration to validate
 * @returns Map of field names to their validation errors
 */
export function getValidationErrorsByField(
  config: Record<string, string>
): Map<string, ValidationError[]> {
  const result = validateConfig(config)
  const errorsByField = new Map<string, ValidationError[]>()

  for (const error of result.errors) {
    const existing = errorsByField.get(error.field) || []
    existing.push(error)
    errorsByField.set(error.field, existing)
  }

  return errorsByField
}
