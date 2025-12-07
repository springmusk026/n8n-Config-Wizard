/**
 * JSON config parser and serializer
 * Requirements: 1.6
 */

import type { ParseResult, ConfigExport } from '../types'
import { WIZARD_VERSION } from '../constants'

/**
 * Parses a JSON configuration export file
 * Expected format:
 * {
 *   version: string,
 *   timestamp: string,
 *   templateId: string | null,
 *   config: Record<string, string>
 * }
 */
export function parseJson(content: string): ParseResult<ConfigExport> {
  try {
    if (content === null || content === undefined) {
      return {
        success: false,
        error: 'Content cannot be null or undefined',
      }
    }

    if (typeof content !== 'string' || content.trim() === '') {
      return {
        success: false,
        error: 'Content must be a non-empty string',
      }
    }

    const parsed = JSON.parse(content)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        success: false,
        error: 'Invalid JSON: content must be an object',
      }
    }

    // Validate required fields
    if (typeof parsed.version !== 'string') {
      return {
        success: false,
        error: 'Invalid config export: missing or invalid version field',
      }
    }

    if (typeof parsed.timestamp !== 'string') {
      return {
        success: false,
        error: 'Invalid config export: missing or invalid timestamp field',
      }
    }

    if (parsed.templateId !== null && typeof parsed.templateId !== 'string') {
      return {
        success: false,
        error: 'Invalid config export: templateId must be a string or null',
      }
    }

    if (!parsed.config || typeof parsed.config !== 'object' || Array.isArray(parsed.config)) {
      return {
        success: false,
        error: 'Invalid config export: missing or invalid config field',
      }
    }

    // Validate config values are all strings
    const config: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed.config)) {
      if (typeof value !== 'string') {
        return {
          success: false,
          error: `Invalid config export: config value for "${key}" must be a string`,
        }
      }
      config[key] = value
    }

    return {
      success: true,
      data: {
        version: parsed.version,
        timestamp: parsed.timestamp,
        templateId: parsed.templateId,
        config,
      },
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: `Invalid JSON syntax: ${error.message}`,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JSON content',
    }
  }
}

/**
 * Serializes a configuration to JSON export format
 * Includes version and timestamp metadata
 */
export function serializeJson(
  config: Record<string, string>,
  templateId: string | null = null
): string {
  const exportData: ConfigExport = {
    version: WIZARD_VERSION,
    timestamp: new Date().toISOString(),
    templateId,
    config,
  }

  return JSON.stringify(exportData, null, 2)
}
