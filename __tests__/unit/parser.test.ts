/**
 * Unit tests for Parser Service
 * Tests: env-parser, compose-parser, json-parser
 */

import { describe, it, expect } from 'vitest'
import {
  parseEnv,
  serializeEnv,
  parseDockerCompose,
  parseJson,
  serializeJson,
  detectFormat,
  parseAuto,
} from '../../lib/parser'

describe('Env Parser', () => {
  describe('parseEnv', () => {
    it('should parse simple KEY=VALUE format', () => {
      const content = 'N8N_HOST=localhost\nN8N_PORT=5678'
      const result = parseEnv(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        N8N_HOST: 'localhost',
        N8N_PORT: '5678',
      })
    })

    it('should handle quoted values', () => {
      const content = 'KEY1="value with spaces"\nKEY2=\'single quoted\''
      const result = parseEnv(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        KEY1: 'value with spaces',
        KEY2: 'single quoted',
      })
    })

    it('should skip comments and empty lines', () => {
      const content = '# This is a comment\nKEY=value\n\n# Another comment'
      const result = parseEnv(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ KEY: 'value' })
    })

    it('should handle values with = signs', () => {
      const content = 'CONNECTION_STRING=host=localhost;port=5432'
      const result = parseEnv(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        CONNECTION_STRING: 'host=localhost;port=5432',
      })
    })

    it('should return error for null content', () => {
      const result = parseEnv(null as unknown as string)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty content', () => {
      const result = parseEnv('')
      expect(result.success).toBe(true)
      expect(result.data).toEqual({})
    })
  })


  describe('serializeEnv', () => {
    it('should serialize simple config', () => {
      const config = { N8N_HOST: 'localhost', N8N_PORT: '5678' }
      const result = serializeEnv(config)
      expect(result).toContain('N8N_HOST=localhost')
      expect(result).toContain('N8N_PORT=5678')
    })

    it('should quote values with special characters', () => {
      const config = { KEY: 'value with spaces' }
      const result = serializeEnv(config)
      expect(result).toBe('KEY="value with spaces"')
    })

    it('should handle empty config', () => {
      const result = serializeEnv({})
      expect(result).toBe('')
    })
  })
})

describe('Docker Compose Parser', () => {
  describe('parseDockerCompose', () => {
    it('should parse environment as array format', () => {
      const content = `
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - N8N_HOST=localhost
      - N8N_PORT=5678
`
      const result = parseDockerCompose(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        N8N_HOST: 'localhost',
        N8N_PORT: '5678',
      })
    })

    it('should parse environment as object format', () => {
      const content = `
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    environment:
      N8N_HOST: localhost
      N8N_PORT: 5678
`
      const result = parseDockerCompose(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        N8N_HOST: 'localhost',
        N8N_PORT: '5678',
      })
    })

    it('should return error for missing n8n service', () => {
      const content = `
version: '3.8'
services:
  postgres:
    image: postgres
`
      const result = parseDockerCompose(content)
      expect(result.success).toBe(false)
      expect(result.error).toContain('No n8n service found')
    })

    it('should return error for invalid YAML', () => {
      const content = 'invalid: yaml: content:'
      const result = parseDockerCompose(content)
      expect(result.success).toBe(false)
    })

    it('should handle n8n service with no environment', () => {
      const content = `
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
`
      const result = parseDockerCompose(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({})
    })
  })
})


describe('JSON Parser', () => {
  describe('parseJson', () => {
    it('should parse valid ConfigExport format', () => {
      const content = JSON.stringify({
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        templateId: 'minimal',
        config: { N8N_HOST: 'localhost' },
      })
      const result = parseJson(content)
      expect(result.success).toBe(true)
      expect(result.data?.config).toEqual({ N8N_HOST: 'localhost' })
      expect(result.data?.templateId).toBe('minimal')
    })

    it('should handle null templateId', () => {
      const content = JSON.stringify({
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        templateId: null,
        config: {},
      })
      const result = parseJson(content)
      expect(result.success).toBe(true)
      expect(result.data?.templateId).toBeNull()
    })

    it('should return error for missing version', () => {
      const content = JSON.stringify({
        timestamp: '2024-01-01T00:00:00.000Z',
        templateId: null,
        config: {},
      })
      const result = parseJson(content)
      expect(result.success).toBe(false)
      expect(result.error).toContain('version')
    })

    it('should return error for invalid JSON', () => {
      const result = parseJson('not valid json')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON syntax')
    })
  })

  describe('serializeJson', () => {
    it('should serialize config with metadata', () => {
      const config = { N8N_HOST: 'localhost' }
      const result = serializeJson(config, 'minimal')
      const parsed = JSON.parse(result)
      expect(parsed.config).toEqual(config)
      expect(parsed.templateId).toBe('minimal')
      expect(parsed.version).toBeDefined()
      expect(parsed.timestamp).toBeDefined()
    })
  })
})

describe('Format Detection', () => {
  it('should detect env format', () => {
    const content = 'N8N_HOST=localhost\nN8N_PORT=5678'
    expect(detectFormat(content)).toBe('env')
  })

  it('should detect docker-compose format', () => {
    const content = `version: '3.8'\nservices:\n  n8n:\n    image: n8n`
    expect(detectFormat(content)).toBe('docker-compose')
  })

  it('should detect json format', () => {
    const content = JSON.stringify({
      version: '1.0.0',
      timestamp: '2024-01-01',
      templateId: null,
      config: {},
    })
    expect(detectFormat(content)).toBe('json')
  })

  it('should return unknown for unrecognized format', () => {
    expect(detectFormat('random text')).toBe('unknown')
  })
})

describe('Auto Parse', () => {
  it('should auto-parse env content', () => {
    const content = 'N8N_HOST=localhost'
    const result = parseAuto(content)
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ N8N_HOST: 'localhost' })
  })

  it('should return error for unknown format', () => {
    const result = parseAuto('random text without any pattern')
    expect(result.success).toBe(false)
    expect(result.error).toContain('Unable to detect')
  })
})
