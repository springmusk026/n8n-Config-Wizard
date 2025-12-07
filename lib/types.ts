/**
 * Shared types and interfaces for the n8n Configuration Wizard
 * Requirements: 2.1, 2.3, 2.4
 */

// ============================================================================
// Parser Types
// ============================================================================

/**
 * Generic result type for parsing operations
 */
export interface ParseResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Configuration export format for JSON import/export
 */
export interface ConfigExport {
  version: string
  timestamp: string
  templateId: string | null
  config: Record<string, string>
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Represents a validation error or warning for a field
 */
export interface ValidationError {
  field: string
  message: string
  type: 'error' | 'warning'
}

/**
 * Result of validating an entire configuration
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

/**
 * Types of validation rules that can be applied to fields
 */
export type ValidationRuleType = 'required' | 'numeric' | 'pattern' | 'dependency' | 'enum' | 'boolean'

/**
 * Definition of a validation rule for a field
 */
export interface FieldValidationRule {
  type: ValidationRuleType
  message: string
  validate: (value: string, config: Record<string, string>) => boolean
}

// ============================================================================
// Diff Types
// ============================================================================

/**
 * Types of changes that can occur between configurations
 */
export type DiffType = 'added' | 'modified' | 'removed'

/**
 * Represents a single difference between configurations
 */
export interface DiffEntry {
  field: string
  category: string
  type: DiffType
  currentValue: string
  defaultValue: string
}

/**
 * Result of comparing two configurations
 */
export interface DiffResult {
  entries: DiffEntry[]
  totalChanges: number
  hasChanges: boolean
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Custom template created by the user
 */
export interface CustomTemplate {
  id: string
  name: string
  description: string
  icon: string
  categories: string[]
  presets: Record<string, string>
  createdAt: string
  updatedAt: string
  isCustom: true
}

// ============================================================================
// Generator Types
// ============================================================================

/**
 * Available output formats for configuration generation
 */
export type OutputFormat = 'env' | 'docker-compose' | 'docker-run' | 'kubernetes'

/**
 * Options for the configuration generator
 */
export interface GeneratorOptions {
  format: OutputFormat
  composeVersion?: '3.7' | '3.8' | '3.9'
  maskSecrets?: boolean
  includeComments?: boolean
  wizardVersion?: string
}

// ============================================================================
// Storage Types
// ============================================================================

/**
 * Data stored in local storage
 */
export interface StoredData {
  customTemplates: CustomTemplate[]
  recentConfigs: ConfigExport[]
  preferences: UserPreferences
}

/**
 * User preferences stored in local storage
 */
export interface UserPreferences {
  defaultOutputFormat: OutputFormat
  defaultComposeVersion: '3.7' | '3.8' | '3.9'
  maskSecretsByDefault: boolean
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Types of filters that can be applied to variables
 */
export type FilterType = 'modified' | 'required' | 'errors'

// ============================================================================
// Wizard State Types
// ============================================================================

/**
 * Steps in the configuration wizard
 */
export type WizardStep = 'template' | 'configure'

/**
 * Complete state of the configuration wizard
 */
export interface WizardState {
  step: WizardStep
  selectedTemplate: import('./n8n-config').Template | CustomTemplate | null
  config: Record<string, string>
  validationErrors: Map<string, ValidationError[]>
  outputFormat: OutputFormat
  generatorOptions: GeneratorOptions
  showOutput: boolean
  showDiff: boolean
  showImport: boolean
  searchQuery: string
  activeFilters: FilterType[]
}
