/**
 * Docker Compose YAML parser
 * Requirements: 1.3
 */

import yaml from 'js-yaml'
import type { ParseResult } from '../types'

/**
 * Docker Compose file structure (partial, for environment extraction)
 */
interface DockerComposeService {
  environment?: string[] | Record<string, string>
  [key: string]: unknown
}

interface DockerComposeFile {
  version?: string
  services?: Record<string, DockerComposeService>
  [key: string]: unknown
}

/**
 * Parses a docker-compose.yml file and extracts environment variables from the n8n service
 * Handles both array format and object format for environment variables:
 * - Array format: ["KEY=VALUE", "KEY2=VALUE2"]
 * - Object format: { KEY: VALUE, KEY2: VALUE2 }
 */
export function parseDockerCompose(content: string): ParseResult<Record<string, string>> {
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

    const parsed = yaml.load(content) as DockerComposeFile

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        error: 'Invalid YAML: content must be an object',
      }
    }

    if (!parsed.services || typeof parsed.services !== 'object') {
      return {
        success: false,
        error: 'Invalid docker-compose file: missing services section',
      }
    }

    // Look for n8n service (case-insensitive)
    const serviceNames = Object.keys(parsed.services)
    const n8nServiceName = serviceNames.find(
      (name) => name.toLowerCase() === 'n8n'
    )

    if (!n8nServiceName) {
      return {
        success: false,
        error: 'No n8n service found in docker-compose file',
      }
    }

    const n8nService = parsed.services[n8nServiceName]
    const environment = n8nService.environment

    if (!environment) {
      // No environment variables defined - return empty config
      return {
        success: true,
        data: {},
      }
    }

    const result: Record<string, string> = {}

    if (Array.isArray(environment)) {
      // Array format: ["KEY=VALUE", "KEY2=VALUE2"]
      for (const item of environment) {
        if (typeof item === 'string') {
          const equalIndex = item.indexOf('=')
          if (equalIndex > 0) {
            const key = item.substring(0, equalIndex).trim()
            const value = item.substring(equalIndex + 1)
            if (key && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
              result[key] = value
            }
          }
        }
      }
    } else if (typeof environment === 'object') {
      // Object format: { KEY: VALUE, KEY2: VALUE2 }
      for (const [key, value] of Object.entries(environment)) {
        if (key && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          result[key] = String(value ?? '')
        }
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      return {
        success: false,
        error: `Invalid YAML syntax: ${error.message}`,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse docker-compose content',
    }
  }
}
