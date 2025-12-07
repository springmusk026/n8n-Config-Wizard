/**
 * Diff Service for comparing configurations against defaults
 * Requirements: 4.1, 4.3
 */

import type { DiffEntry, DiffResult, DiffType } from './types'
import { categories } from './n8n-config'

/**
 * Maps a field name to its category ID
 * Returns 'unknown' if the field is not found in any category
 */
function getFieldCategory(fieldName: string): string {
  for (const category of categories) {
    const found = category.variables.find((v) => v.name === fieldName)
    if (found) {
      return category.id
    }
  }
  return 'unknown'
}

/**
 * Computes the diff between current config and defaults
 * Categorizes changes as added, modified, or removed
 * 
 * @param config - Current configuration values
 * @param defaults - Default/template configuration values
 * @returns DiffResult with all differences categorized
 */
export function computeDiff(
  config: Record<string, string>,
  defaults: Record<string, string>
): DiffResult {
  const entries: DiffEntry[] = []
  const allKeys = new Set([...Object.keys(config), ...Object.keys(defaults)])

  for (const field of allKeys) {
    const currentValue = config[field] ?? ''
    const defaultValue = defaults[field] ?? ''

    // Skip if both values are the same (including both empty)
    if (currentValue === defaultValue) {
      continue
    }

    let type: DiffType

    if (defaultValue === '' && currentValue !== '') {
      // Field exists in config but not in defaults (or default is empty)
      type = 'added'
    } else if (currentValue === '' && defaultValue !== '') {
      // Field exists in defaults but not in config (or config is empty)
      type = 'removed'
    } else {
      // Both have values but they differ
      type = 'modified'
    }

    entries.push({
      field,
      category: getFieldCategory(field),
      type,
      currentValue,
      defaultValue,
    })
  }

  // Sort entries by category, then by field name for consistent ordering
  entries.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    return a.field.localeCompare(b.field)
  })

  return {
    entries,
    totalChanges: entries.length,
    hasChanges: entries.length > 0,
  }
}

/**
 * Reverts a single field to its default value
 * 
 * @param field - The field name to revert
 * @param config - Current configuration
 * @param defaults - Default configuration
 * @returns New configuration with the field reverted
 */
export function revertField(
  field: string,
  config: Record<string, string>,
  defaults: Record<string, string>
): Record<string, string> {
  const newConfig = { ...config }
  
  if (field in defaults) {
    // Restore to default value
    newConfig[field] = defaults[field]
  } else {
    // Field doesn't exist in defaults, remove it
    delete newConfig[field]
  }

  return newConfig
}

/**
 * Reverts all fields to their default values
 * 
 * @param _config - Current configuration (unused, kept for API consistency)
 * @param defaults - Default configuration to restore
 * @returns New configuration matching defaults
 */
export function revertAll(
  _config: Record<string, string>,
  defaults: Record<string, string>
): Record<string, string> {
  // Return a copy of defaults
  return { ...defaults }
}
