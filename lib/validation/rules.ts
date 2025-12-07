/**
 * Validation rule definitions for n8n Configuration Wizard
 * Requirements: 2.1, 2.3, 2.4
 */

import type { FieldValidationRule } from '../types'
import {
  NUMERIC_FIELDS,
  BOOLEAN_FIELDS,
  ENUM_VALUES,
  REQUIRED_FIELDS,
  POSTGRES_REQUIRED_FIELDS,
  REDIS_REQUIRED_FIELDS,
  createNumericRule,
  createBooleanRule,
  createEnumRule,
  createRequiredRule,
  createPostgresDependencyRule,
  createRedisDependencyRule,
} from '../constants'

// ============================================================================
// Field Rules Registry
// ============================================================================

/**
 * Map of field names to their validation rules
 */
const fieldRulesCache: Map<string, FieldValidationRule[]> = new Map()

/**
 * Builds validation rules for a specific field based on its characteristics
 */
function buildFieldRules(fieldName: string): FieldValidationRule[] {
  const rules: FieldValidationRule[] = []

  // Add required rule if field is in required list
  if (REQUIRED_FIELDS.includes(fieldName)) {
    rules.push(createRequiredRule(fieldName))
  }

  // Add numeric validation for numeric fields
  if (NUMERIC_FIELDS.includes(fieldName)) {
    rules.push(createNumericRule(fieldName))
  }

  // Add boolean validation for boolean fields
  if (BOOLEAN_FIELDS.includes(fieldName)) {
    rules.push(createBooleanRule(fieldName))
  }

  // Add enum validation for enum fields
  if (fieldName in ENUM_VALUES) {
    rules.push(createEnumRule(fieldName, ENUM_VALUES[fieldName]))
  }

  // Add PostgreSQL dependency rules
  if (POSTGRES_REQUIRED_FIELDS.includes(fieldName)) {
    rules.push(createPostgresDependencyRule(fieldName))
  }

  // Add Redis dependency rules
  if (REDIS_REQUIRED_FIELDS.includes(fieldName)) {
    rules.push(createRedisDependencyRule(fieldName))
  }

  return rules
}

/**
 * Gets validation rules for a specific field
 * Results are cached for performance
 */
export function getFieldRules(fieldName: string): FieldValidationRule[] {
  if (!fieldRulesCache.has(fieldName)) {
    fieldRulesCache.set(fieldName, buildFieldRules(fieldName))
  }
  return fieldRulesCache.get(fieldName) || []
}

/**
 * Clears the field rules cache (useful for testing)
 */
export function clearFieldRulesCache(): void {
  fieldRulesCache.clear()
}

// ============================================================================
// Rule Type Exports
// ============================================================================

export {
  NUMERIC_FIELDS,
  BOOLEAN_FIELDS,
  ENUM_VALUES,
  REQUIRED_FIELDS,
  POSTGRES_REQUIRED_FIELDS,
  REDIS_REQUIRED_FIELDS,
}
