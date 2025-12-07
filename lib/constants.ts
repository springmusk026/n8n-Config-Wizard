/**
 * Constants for validation rules and field metadata
 * Requirements: 2.1, 2.3, 2.4
 */

import type { FieldValidationRule } from './types'

// ============================================================================
// Field Type Definitions
// ============================================================================

/**
 * Enum values for fields with restricted options
 */
export const ENUM_VALUES: Record<string, string[]> = {
  N8N_PROTOCOL: ['http', 'https'],
  DB_TYPE: ['sqlite', 'postgresdb'],
  EXECUTIONS_MODE: ['regular', 'queue'],
  EXECUTIONS_DATA_SAVE_ON_ERROR: ['all', 'none'],
  EXECUTIONS_DATA_SAVE_ON_SUCCESS: ['all', 'none'],
  N8N_SAMESITE_COOKIE: ['strict', 'lax', 'none'],
  N8N_LOG_LEVEL: ['info', 'warn', 'error', 'debug'],
  N8N_LOG_OUTPUT: ['console', 'file'],
  N8N_LOG_FORMAT: ['text', 'json'],
  N8N_DEFAULT_BINARY_DATA_MODE: ['default', 'filesystem', 's3', 'database'],
  N8N_SOURCECONTROL_DEFAULT_SSH_KEY_TYPE: ['ed25519', 'rsa'],
}

/**
 * Fields that contain sensitive information
 */
export const SENSITIVE_FIELDS: string[] = [
  'N8N_ENCRYPTION_KEY',
  'DB_POSTGRESDB_PASSWORD',
  'QUEUE_BULL_REDIS_PASSWORD',
  'N8N_SMTP_PASS',
  'N8N_EXTERNAL_STORAGE_S3_ACCESS_KEY',
  'N8N_EXTERNAL_STORAGE_S3_ACCESS_SECRET',
  'N8N_USER_MANAGEMENT_JWT_SECRET',
]

/**
 * Fields that are required for basic operation
 */
export const REQUIRED_FIELDS: string[] = [
  'N8N_HOST',
  'N8N_PORT',
  'DB_TYPE',
]

/**
 * PostgreSQL fields required when DB_TYPE is 'postgresdb'
 */
export const POSTGRES_REQUIRED_FIELDS: string[] = [
  'DB_POSTGRESDB_HOST',
  'DB_POSTGRESDB_PORT',
  'DB_POSTGRESDB_DATABASE',
  'DB_POSTGRESDB_USER',
]

/**
 * Redis fields required when EXECUTIONS_MODE is 'queue'
 */
export const REDIS_REQUIRED_FIELDS: string[] = [
  'QUEUE_BULL_REDIS_HOST',
  'QUEUE_BULL_REDIS_PORT',
]

/**
 * Fields that accept numeric values
 */
export const NUMERIC_FIELDS: string[] = [
  'N8N_PORT',
  'N8N_GRACEFUL_SHUTDOWN_TIMEOUT',
  'N8N_PROXY_HOPS',
  'DB_POSTGRESDB_PORT',
  'DB_POSTGRESDB_POOL_SIZE',
  'DB_SQLITE_POOL_SIZE',
  'EXECUTIONS_TIMEOUT',
  'EXECUTIONS_TIMEOUT_MAX',
  'EXECUTIONS_DATA_MAX_AGE',
  'EXECUTIONS_DATA_PRUNE_MAX_COUNT',
  'N8N_CONCURRENCY_PRODUCTION_LIMIT',
  'QUEUE_BULL_REDIS_PORT',
  'QUEUE_BULL_REDIS_DB',
  'QUEUE_HEALTH_CHECK_PORT',
  'N8N_USER_MANAGEMENT_JWT_DURATION_HOURS',
  'N8N_LOG_FILE_COUNT_MAX',
  'N8N_LOG_FILE_SIZE_MAX',
  'N8N_SMTP_PORT',
  'N8N_PAYLOAD_SIZE_MAX',
]

/**
 * Fields that accept boolean values
 */
export const BOOLEAN_FIELDS: string[] = [
  'N8N_DISABLE_UI',
  'N8N_TEMPLATES_ENABLED',
  'DB_POSTGRESDB_SSL_ENABLED',
  'EXECUTIONS_DATA_PRUNE',
  'QUEUE_BULL_REDIS_TLS',
  'QUEUE_HEALTH_CHECK_ACTIVE',
  'N8N_MULTI_MAIN_SETUP_ENABLED',
  'OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS',
  'N8N_SECURE_COOKIE',
  'N8N_BLOCK_ENV_ACCESS_IN_NODE',
  'N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES',
  'N8N_MFA_ENABLED',
  'DB_LOGGING_ENABLED',
  'N8N_SMTP_SSL',
  'N8N_SMTP_STARTTLS',
  'N8N_DIAGNOSTICS_ENABLED',
  'N8N_METRICS',
  'N8N_PUBLIC_API_DISABLED',
  'N8N_COMMUNITY_PACKAGES_ENABLED',
  'N8N_PYTHON_ENABLED',
]

// ============================================================================
// Validation Rule Factories
// ============================================================================

/**
 * Creates a validation rule for numeric fields
 */
export function createNumericRule(fieldName: string): FieldValidationRule {
  return {
    type: 'numeric',
    message: `${fieldName} must be a valid number`,
    validate: (value: string) => {
      if (value === '' || value === undefined) return true
      return /^-?\d+$/.test(value)
    },
  }
}

/**
 * Creates a validation rule for boolean fields
 */
export function createBooleanRule(fieldName: string): FieldValidationRule {
  return {
    type: 'boolean',
    message: `${fieldName} must be 'true' or 'false'`,
    validate: (value: string) => {
      if (value === '' || value === undefined) return true
      return value === 'true' || value === 'false'
    },
  }
}

/**
 * Creates a validation rule for enum fields
 */
export function createEnumRule(fieldName: string, allowedValues: string[]): FieldValidationRule {
  return {
    type: 'enum',
    message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
    validate: (value: string) => {
      if (value === '' || value === undefined) return true
      return allowedValues.includes(value)
    },
  }
}

/**
 * Creates a validation rule for required fields
 */
export function createRequiredRule(fieldName: string): FieldValidationRule {
  return {
    type: 'required',
    message: `${fieldName} is required`,
    validate: (value: string) => {
      return value !== '' && value !== undefined
    },
  }
}

/**
 * Creates a validation rule for PostgreSQL dependency
 */
export function createPostgresDependencyRule(fieldName: string): FieldValidationRule {
  return {
    type: 'dependency',
    message: `${fieldName} is required when using PostgreSQL database`,
    validate: (value: string, config: Record<string, string>) => {
      // If not using PostgreSQL, this rule doesn't apply
      if (config.DB_TYPE !== 'postgresdb') return true
      // Check if value exists and is not just whitespace
      return value !== undefined && value !== null && value.trim() !== ''
    },
  }
}

/**
 * Creates a validation rule for Redis dependency
 */
export function createRedisDependencyRule(fieldName: string): FieldValidationRule {
  return {
    type: 'dependency',
    message: `${fieldName} is required when using Queue mode`,
    validate: (value: string, config: Record<string, string>) => {
      // If not using queue mode, this rule doesn't apply
      if (config.EXECUTIONS_MODE !== 'queue') return true
      // Check if value exists and is not just whitespace
      return value !== undefined && value !== null && value.trim() !== ''
    },
  }
}

// ============================================================================
// Category Metadata
// ============================================================================

/**
 * Maps category IDs to their display information
 */
export const CATEGORY_METADATA: Record<string, { name: string; icon: string }> = {
  deployment: { name: 'Deployment', icon: 'globe' },
  database: { name: 'Database', icon: 'database' },
  executions: { name: 'Executions', icon: 'play' },
  queue: { name: 'Queue Mode', icon: 'layers' },
  security: { name: 'Security', icon: 'shield' },
  logs: { name: 'Logging', icon: 'file-text' },
  smtp: { name: 'Email / SMTP', icon: 'mail' },
  storage: { name: 'External Storage', icon: 'hard-drive' },
  ai: { name: 'AI Assistant', icon: 'sparkles' },
  'source-control': { name: 'Source Control', icon: 'git-branch' },
  timezone: { name: 'Timezone & Locale', icon: 'clock' },
  endpoints: { name: 'Endpoints & Metrics', icon: 'activity' },
  nodes: { name: 'Nodes & Community', icon: 'puzzle' },
}

// ============================================================================
// Application Constants
// ============================================================================

/**
 * Current version of the wizard for output headers
 */
export const WIZARD_VERSION = '1.0.0'

/**
 * Placeholder text for masked secrets
 */
export const SECRET_PLACEHOLDER = '********'

/**
 * Default compose version for docker-compose output
 */
export const DEFAULT_COMPOSE_VERSION = '3.8'

/**
 * Available compose versions
 */
export const COMPOSE_VERSIONS = ['3.7', '3.8', '3.9'] as const

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  CUSTOM_TEMPLATES: 'n8n-wizard-custom-templates',
  RECENT_CONFIGS: 'n8n-wizard-recent-configs',
  PREFERENCES: 'n8n-wizard-preferences',
} as const
