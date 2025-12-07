/**
 * Local Storage Service
 * Provides get/set/remove operations for localStorage with error handling
 * Requirements: 6.2
 */

import { STORAGE_KEYS } from './constants'
import type { CustomTemplate, ConfigExport, UserPreferences, StoredData } from './types'

// ============================================================================
// Storage Error Types
// ============================================================================

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: 'QUOTA_EXCEEDED' | 'CORRUPTED_DATA' | 'NOT_AVAILABLE' | 'UNKNOWN'
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

// ============================================================================
// Storage Availability Check
// ============================================================================

/**
 * Checks if localStorage is available in the current environment
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    window.localStorage.setItem(testKey, testKey)
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// Generic Storage Operations
// ============================================================================

/**
 * Retrieves and parses a value from localStorage
 * @param key - The storage key
 * @returns The parsed value or null if not found
 * @throws StorageError if data is corrupted or storage is unavailable
 */
export function getItem<T>(key: string): T | null {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available', 'NOT_AVAILABLE')
  }

  try {
    const item = window.localStorage.getItem(key)
    if (item === null) {
      return null
    }
    return JSON.parse(item) as T
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new StorageError(`Corrupted data in storage key: ${key}`, 'CORRUPTED_DATA')
    }
    throw new StorageError(`Failed to read from storage: ${String(error)}`, 'UNKNOWN')
  }
}

/**
 * Serializes and stores a value in localStorage
 * @param key - The storage key
 * @param value - The value to store
 * @throws StorageError if quota is exceeded or storage is unavailable
 */
export function setItem<T>(key: string, value: T): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available', 'NOT_AVAILABLE')
  }

  try {
    const serialized = JSON.stringify(value)
    window.localStorage.setItem(key, serialized)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageError('Storage quota exceeded. Please delete some templates or configurations.', 'QUOTA_EXCEEDED')
    }
    throw new StorageError(`Failed to write to storage: ${String(error)}`, 'UNKNOWN')
  }
}

/**
 * Removes a value from localStorage
 * @param key - The storage key
 * @throws StorageError if storage is unavailable
 */
export function removeItem(key: string): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available', 'NOT_AVAILABLE')
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    throw new StorageError(`Failed to remove from storage: ${String(error)}`, 'UNKNOWN')
  }
}

// ============================================================================
// Typed Storage Operations for Specific Data Types
// ============================================================================

/**
 * Gets custom templates from storage
 * @returns Array of custom templates or empty array if none exist
 */
export function getCustomTemplates(): CustomTemplate[] {
  try {
    const templates = getItem<CustomTemplate[]>(STORAGE_KEYS.CUSTOM_TEMPLATES)
    return templates ?? []
  } catch (error) {
    if (error instanceof StorageError && error.code === 'CORRUPTED_DATA') {
      // Clear corrupted data and return empty array
      try {
        removeItem(STORAGE_KEYS.CUSTOM_TEMPLATES)
      } catch {
        // Ignore removal errors
      }
      return []
    }
    throw error
  }
}

/**
 * Saves custom templates to storage
 * @param templates - Array of custom templates to save
 */
export function setCustomTemplates(templates: CustomTemplate[]): void {
  setItem(STORAGE_KEYS.CUSTOM_TEMPLATES, templates)
}

/**
 * Gets recent configurations from storage
 * @returns Array of recent configs or empty array if none exist
 */
export function getRecentConfigs(): ConfigExport[] {
  try {
    const configs = getItem<ConfigExport[]>(STORAGE_KEYS.RECENT_CONFIGS)
    return configs ?? []
  } catch (error) {
    if (error instanceof StorageError && error.code === 'CORRUPTED_DATA') {
      try {
        removeItem(STORAGE_KEYS.RECENT_CONFIGS)
      } catch {
        // Ignore removal errors
      }
      return []
    }
    throw error
  }
}

/**
 * Saves recent configurations to storage
 * @param configs - Array of recent configs to save
 */
export function setRecentConfigs(configs: ConfigExport[]): void {
  setItem(STORAGE_KEYS.RECENT_CONFIGS, configs)
}

/**
 * Gets user preferences from storage
 * @returns User preferences or default values if none exist
 */
export function getPreferences(): UserPreferences {
  const defaults: UserPreferences = {
    defaultOutputFormat: 'docker-compose',
    defaultComposeVersion: '3.8',
    maskSecretsByDefault: false,
  }

  try {
    const prefs = getItem<UserPreferences>(STORAGE_KEYS.PREFERENCES)
    return prefs ?? defaults
  } catch (error) {
    if (error instanceof StorageError && error.code === 'CORRUPTED_DATA') {
      try {
        removeItem(STORAGE_KEYS.PREFERENCES)
      } catch {
        // Ignore removal errors
      }
      return defaults
    }
    throw error
  }
}

/**
 * Saves user preferences to storage
 * @param preferences - User preferences to save
 */
export function setPreferences(preferences: UserPreferences): void {
  setItem(STORAGE_KEYS.PREFERENCES, preferences)
}

/**
 * Clears all wizard-related data from storage
 */
export function clearAllData(): void {
  removeItem(STORAGE_KEYS.CUSTOM_TEMPLATES)
  removeItem(STORAGE_KEYS.RECENT_CONFIGS)
  removeItem(STORAGE_KEYS.PREFERENCES)
}

/**
 * Gets all stored data
 * @returns Complete stored data object
 */
export function getAllStoredData(): StoredData {
  return {
    customTemplates: getCustomTemplates(),
    recentConfigs: getRecentConfigs(),
    preferences: getPreferences(),
  }
}
