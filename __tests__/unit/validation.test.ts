/**
 * Unit tests for the Validation Service
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  validateField,
  validateConfig,
  canGenerate,
  getValidationErrorsByField,
  getFieldRules,
  clearFieldRulesCache,
} from '@/lib/validation'

describe('Validation Service', () => {
  beforeEach(() => {
    clearFieldRulesCache()
  })

  describe('validateField', () => {
    describe('Numeric field validation (Requirement 2.1)', () => {
      it('should accept valid numeric values', () => {
        const errors = validateField('N8N_PORT', '5678', {})
        expect(errors).toHaveLength(0)
      })

      it('should accept negative numeric values', () => {
        const errors = validateField('EXECUTIONS_TIMEOUT', '-1', {})
        expect(errors).toHaveLength(0)
      })

      it('should reject non-numeric values for numeric fields', () => {
        const errors = validateField('N8N_PORT', 'abc', {})
        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].type).toBe('error')
      })

      it('should accept empty values for optional numeric fields', () => {
        const errors = validateField('N8N_PROXY_HOPS', '', {})
        expect(errors).toHaveLength(0)
      })
    })

    describe('Boolean field validation', () => {
      it('should accept "true" for boolean fields', () => {
        const errors = validateField('N8N_DISABLE_UI', 'true', {})
        expect(errors).toHaveLength(0)
      })

      it('should accept "false" for boolean fields', () => {
        const errors = validateField('N8N_DISABLE_UI', 'false', {})
        expect(errors).toHaveLength(0)
      })

      it('should reject invalid boolean values', () => {
        const errors = validateField('N8N_DISABLE_UI', 'yes', {})
        expect(errors.length).toBeGreaterThan(0)
      })

      it('should accept empty values for optional boolean fields', () => {
        const errors = validateField('N8N_DISABLE_UI', '', {})
        expect(errors).toHaveLength(0)
      })
    })

    describe('Enum field validation', () => {
      it('should accept valid enum values', () => {
        const errors = validateField('DB_TYPE', 'postgresdb', {})
        expect(errors).toHaveLength(0)
      })

      it('should reject invalid enum values', () => {
        const errors = validateField('DB_TYPE', 'mysql', {})
        expect(errors.length).toBeGreaterThan(0)
      })

      it('should accept empty values for optional enum fields', () => {
        const errors = validateField('N8N_PROTOCOL', '', {})
        expect(errors).toHaveLength(0)
      })
    })

    describe('Required field validation', () => {
      it('should fail for empty required fields', () => {
        const errors = validateField('N8N_HOST', '', {})
        expect(errors.length).toBeGreaterThan(0)
      })

      it('should pass for non-empty required fields', () => {
        const errors = validateField('N8N_HOST', 'localhost', {})
        expect(errors).toHaveLength(0)
      })
    })
  })

  describe('validateConfig', () => {
    describe('PostgreSQL dependency validation (Requirement 2.3)', () => {
      it('should require PostgreSQL fields when DB_TYPE is postgresdb', () => {
        const config = {
          DB_TYPE: 'postgresdb',
          DB_POSTGRESDB_HOST: '',
          DB_POSTGRESDB_PORT: '',
          DB_POSTGRESDB_DATABASE: '',
          DB_POSTGRESDB_USER: '',
        }
        const result = validateConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.field === 'DB_POSTGRESDB_HOST')).toBe(true)
        expect(result.errors.some(e => e.field === 'DB_POSTGRESDB_PORT')).toBe(true)
        expect(result.errors.some(e => e.field === 'DB_POSTGRESDB_DATABASE')).toBe(true)
        expect(result.errors.some(e => e.field === 'DB_POSTGRESDB_USER')).toBe(true)
      })

      it('should not require PostgreSQL fields when DB_TYPE is sqlite', () => {
        const config = {
          DB_TYPE: 'sqlite',
        }
        const result = validateConfig(config)
        expect(result.errors.some(e => e.field === 'DB_POSTGRESDB_HOST')).toBe(false)
      })

      it('should pass when PostgreSQL fields are provided', () => {
        const config = {
          DB_TYPE: 'postgresdb',
          DB_POSTGRESDB_HOST: 'localhost',
          DB_POSTGRESDB_PORT: '5432',
          DB_POSTGRESDB_DATABASE: 'n8n',
          DB_POSTGRESDB_USER: 'postgres',
        }
        const result = validateConfig(config)
        expect(result.errors.filter(e => e.field.startsWith('DB_POSTGRESDB'))).toHaveLength(0)
      })
    })

    describe('Redis dependency validation (Requirement 2.4)', () => {
      it('should require Redis fields when EXECUTIONS_MODE is queue', () => {
        const config = {
          EXECUTIONS_MODE: 'queue',
          QUEUE_BULL_REDIS_HOST: '',
          QUEUE_BULL_REDIS_PORT: '',
        }
        const result = validateConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors.some(e => e.field === 'QUEUE_BULL_REDIS_HOST')).toBe(true)
        expect(result.errors.some(e => e.field === 'QUEUE_BULL_REDIS_PORT')).toBe(true)
      })

      it('should not require Redis fields when EXECUTIONS_MODE is regular', () => {
        const config = {
          EXECUTIONS_MODE: 'regular',
        }
        const result = validateConfig(config)
        expect(result.errors.some(e => e.field === 'QUEUE_BULL_REDIS_HOST')).toBe(false)
      })

      it('should pass when Redis fields are provided', () => {
        const config = {
          EXECUTIONS_MODE: 'queue',
          QUEUE_BULL_REDIS_HOST: 'redis',
          QUEUE_BULL_REDIS_PORT: '6379',
        }
        const result = validateConfig(config)
        expect(result.errors.filter(e => e.field.startsWith('QUEUE_BULL_REDIS'))).toHaveLength(0)
      })
    })
  })

  describe('canGenerate (Requirements 2.5, 2.6)', () => {
    it('should return false when there are validation errors', () => {
      const config = {
        N8N_PORT: 'invalid',
      }
      expect(canGenerate(config)).toBe(false)
    })

    it('should return true when there are no validation errors', () => {
      const config = {
        N8N_HOST: 'localhost',
        N8N_PORT: '5678',
        DB_TYPE: 'sqlite',
      }
      expect(canGenerate(config)).toBe(true)
    })

    it('should return false when PostgreSQL dependencies are missing', () => {
      const config = {
        DB_TYPE: 'postgresdb',
      }
      expect(canGenerate(config)).toBe(false)
    })

    it('should return false when Redis dependencies are missing', () => {
      const config = {
        EXECUTIONS_MODE: 'queue',
      }
      expect(canGenerate(config)).toBe(false)
    })
  })

  describe('getValidationErrorsByField', () => {
    it('should group errors by field name', () => {
      const config = {
        N8N_PORT: 'invalid',
        DB_TYPE: 'postgresdb',
      }
      const errorsByField = getValidationErrorsByField(config)
      expect(errorsByField.has('N8N_PORT')).toBe(true)
      expect(errorsByField.get('N8N_PORT')?.length).toBeGreaterThan(0)
    })

    it('should return empty map for valid config', () => {
      const config = {
        N8N_HOST: 'localhost',
        N8N_PORT: '5678',
        DB_TYPE: 'sqlite',
      }
      const errorsByField = getValidationErrorsByField(config)
      expect(errorsByField.size).toBe(0)
    })
  })

  describe('getFieldRules', () => {
    it('should return rules for numeric fields', () => {
      const rules = getFieldRules('N8N_PORT')
      expect(rules.some(r => r.type === 'numeric')).toBe(true)
    })

    it('should return rules for boolean fields', () => {
      const rules = getFieldRules('N8N_DISABLE_UI')
      expect(rules.some(r => r.type === 'boolean')).toBe(true)
    })

    it('should return rules for enum fields', () => {
      const rules = getFieldRules('DB_TYPE')
      expect(rules.some(r => r.type === 'enum')).toBe(true)
    })

    it('should return required rule for required fields', () => {
      const rules = getFieldRules('N8N_HOST')
      expect(rules.some(r => r.type === 'required')).toBe(true)
    })

    it('should return dependency rules for PostgreSQL fields', () => {
      const rules = getFieldRules('DB_POSTGRESDB_HOST')
      expect(rules.some(r => r.type === 'dependency')).toBe(true)
    })

    it('should return dependency rules for Redis fields', () => {
      const rules = getFieldRules('QUEUE_BULL_REDIS_HOST')
      expect(rules.some(r => r.type === 'dependency')).toBe(true)
    })
  })
})
