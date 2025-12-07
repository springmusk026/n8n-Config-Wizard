/**
 * Parser Service - Main entry point
 * Requirements: 1.2, 1.3, 1.4, 1.6, 1.7
 */

import type { ParseResult, ConfigExport } from '../types'
import { parseEnv, serializeEnv } from './env-parser'
import { parseDockerCompose } from './compose-parser'
import { parseJson, serializeJson } from './json-parser'

export { parseEnv, serializeEnv } from './env-parser'
export { parseDockerCompose } from './compose-parser'
export { parseJson, serializeJson } from './json-parser'

/**
 * Supported import formats
 */
export type ImportFormat = 'env' | 'docker-compose' | 'json' | 'unknown'

/**
 * Detects the format of the input content
 * Returns 'unknown' if format cannot be determined
 */
export function detectFormat(content: string): ImportFormat {
  if (!content || typeof content !== 'string') {
    return 'unknown'
  }

  const trimmed = content.trim()

  // Try to detect JSON first (starts with { or [)
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      // Check if it's a ConfigExport format
      if (parsed.version && parsed.config && typeof parsed.config === 'object') {
        return 'json'
      }
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for docker-compose YAML indicators
  if (
    trimmed.includes('services:') &&
    (trimmed.includes('version:') || trimmed.includes('image:'))
  ) {
    return 'docker-compose'
  }

  // Check for .env format (KEY=VALUE lines)
  const lines = trimmed.split(/\r?\n/)
  const envLinePattern = /^[a-zA-Z_][a-zA-Z0-9_]*=/
  const envLines = lines.filter(
    (line) => line.trim() && !line.trim().startsWith('#') && envLinePattern.test(line)
  )

  if (envLines.length > 0 && envLines.length >= lines.filter((l) => l.trim()).length * 0.5) {
    return 'env'
  }

  return 'unknown'
}

/**
 * Auto-detects format and parses the content
 * Returns the parsed configuration or an error
 */
export function parseAuto(content: string): ParseResult<Record<string, string>> {
  const format = detectFormat(content)

  switch (format) {
    case 'env':
      return parseEnv(content)

    case 'docker-compose':
      return parseDockerCompose(content)

    case 'json': {
      const result = parseJson(content)
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.config,
        }
      }
      return {
        success: false,
        error: result.error,
      }
    }

    case 'unknown':
    default:
      return {
        success: false,
        error: 'Unable to detect configuration format. Supported formats: .env, docker-compose.yml, JSON export',
      }
  }
}

/**
 * Parser service interface for dependency injection
 */
export interface ParserService {
  parseEnv(content: string): ParseResult<Record<string, string>>
  parseDockerCompose(content: string): ParseResult<Record<string, string>>
  parseJson(content: string): ParseResult<ConfigExport>
  serializeEnv(config: Record<string, string>): string
  serializeJson(config: Record<string, string>, templateId?: string | null): string
  detectFormat(content: string): ImportFormat
  parseAuto(content: string): ParseResult<Record<string, string>>
}

/**
 * Creates a parser service instance
 */
export function createParserService(): ParserService {
  return {
    parseEnv,
    parseDockerCompose,
    parseJson,
    serializeEnv,
    serializeJson,
    detectFormat,
    parseAuto,
  }
}
