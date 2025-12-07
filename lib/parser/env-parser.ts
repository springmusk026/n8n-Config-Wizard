/**
 * .env file parser and serializer
 * Requirements: 1.2, 1.7
 */

import type { ParseResult } from '../types'

/**
 * Parses .env file content into a key-value record
 * Handles:
 * - KEY=VALUE format
 * - Quoted values (single and double quotes)
 * - Comments (lines starting with #)
 * - Empty lines
 * - Values with = signs
 * - Multiline values (with quotes)
 */
export function parseEnv(content: string): ParseResult<Record<string, string>> {
  try {
    if (content === null || content === undefined) {
      return {
        success: false,
        error: 'Content cannot be null or undefined',
      }
    }

    const result: Record<string, string> = {}
    const lines = content.split(/\r?\n/)
    let currentKey: string | null = null
    let currentValue: string[] = []
    let inMultiline = false
    let quoteChar: string | null = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle multiline continuation
      if (inMultiline && currentKey) {
        currentValue.push(line)
        // Check if this line ends the multiline value
        if (line.endsWith(quoteChar!)) {
          const fullValue = currentValue.join('\n')
          // Remove the closing quote
          result[currentKey] = fullValue.slice(0, -1)
          currentKey = null
          currentValue = []
          inMultiline = false
          quoteChar = null
        }
        continue
      }

      // Skip empty lines and comments
      const trimmedLine = line.trim()
      if (trimmedLine === '' || trimmedLine.startsWith('#')) {
        continue
      }

      // Find the first = sign
      const equalIndex = line.indexOf('=')
      if (equalIndex === -1) {
        // Line without = sign - skip it (could be malformed)
        continue
      }

      const key = line.substring(0, equalIndex).trim()
      let value = line.substring(equalIndex + 1)

      // Validate key - must be non-empty and valid identifier
      if (key === '' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        continue
      }

      // Handle quoted values
      const trimmedValue = value.trim()
      if (
        (trimmedValue.startsWith('"') && trimmedValue.endsWith('"') && trimmedValue.length > 1) ||
        (trimmedValue.startsWith("'") && trimmedValue.endsWith("'") && trimmedValue.length > 1)
      ) {
        // Fully quoted value on single line - remove quotes
        result[key] = trimmedValue.slice(1, -1)
      } else if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
        // Start of multiline quoted value
        quoteChar = trimmedValue[0]
        currentKey = key
        currentValue = [trimmedValue.slice(1)]
        inMultiline = true
      } else {
        // Unquoted value - trim whitespace
        result[key] = trimmedValue
      }
    }

    // Handle unclosed multiline (treat as single line)
    if (inMultiline && currentKey) {
      result[currentKey] = currentValue.join('\n')
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse .env content',
    }
  }
}


/**
 * Serializes a key-value record to .env file format
 * Handles:
 * - Values with special characters (quotes them)
 * - Values with newlines (uses double quotes)
 * - Empty values
 */
export function serializeEnv(config: Record<string, string>): string {
  if (!config || typeof config !== 'object') {
    return ''
  }

  const lines: string[] = []

  for (const [key, value] of Object.entries(config)) {
    // Skip invalid keys
    if (!key || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      continue
    }

    // Skip undefined/null values
    if (value === undefined || value === null) {
      continue
    }

    const stringValue = String(value)

    // Determine if we need to quote the value
    const needsQuotes =
      stringValue.includes('\n') ||
      stringValue.includes(' ') ||
      stringValue.includes('"') ||
      stringValue.includes("'") ||
      stringValue.includes('#') ||
      stringValue.includes('=') ||
      stringValue.startsWith(' ') ||
      stringValue.endsWith(' ')

    if (needsQuotes) {
      // Use double quotes and escape internal double quotes
      const escaped = stringValue.replace(/"/g, '\\"')
      lines.push(`${key}="${escaped}"`)
    } else {
      lines.push(`${key}=${stringValue}`)
    }
  }

  return lines.join('\n')
}
