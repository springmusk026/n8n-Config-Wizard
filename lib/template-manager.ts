/**
 * Template Manager Service
 * Provides CRUD operations for custom templates
 * Requirements: 6.2, 6.5, 6.6
 */

import type { CustomTemplate } from './types'
import { getCustomTemplates, setCustomTemplates, StorageError } from './storage'

// ============================================================================
// Template Manager Error Types
// ============================================================================

export class TemplateManagerError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_FOUND' | 'DUPLICATE_NAME' | 'INVALID_DATA' | 'STORAGE_ERROR'
  ) {
    super(message)
    this.name = 'TemplateManagerError'
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique ID for a new template
 */
function generateTemplateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Gets the current ISO timestamp
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString()
}

/**
 * Validates template data
 */
function validateTemplateData(
  data: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>
): void {
  if (!data.name || data.name.trim() === '') {
    throw new TemplateManagerError('Template name is required', 'INVALID_DATA')
  }
  if (data.name.length > 100) {
    throw new TemplateManagerError('Template name must be 100 characters or less', 'INVALID_DATA')
  }
  if (data.description && data.description.length > 500) {
    throw new TemplateManagerError('Template description must be 500 characters or less', 'INVALID_DATA')
  }
  if (!data.presets || typeof data.presets !== 'object') {
    throw new TemplateManagerError('Template presets must be an object', 'INVALID_DATA')
  }
}

// ============================================================================
// Template CRUD Operations
// ============================================================================

/**
 * Retrieves all custom templates from storage
 * @returns Array of custom templates
 */
export function getAllCustomTemplates(): CustomTemplate[] {
  try {
    return getCustomTemplates()
  } catch (error) {
    if (error instanceof StorageError) {
      throw new TemplateManagerError(`Failed to load templates: ${error.message}`, 'STORAGE_ERROR')
    }
    throw error
  }
}

/**
 * Retrieves a single custom template by ID
 * @param id - The template ID
 * @returns The template or null if not found
 */
export function getTemplateById(id: string): CustomTemplate | null {
  const templates = getAllCustomTemplates()
  return templates.find(t => t.id === id) ?? null
}

/**
 * Creates and saves a new custom template
 * @param data - Template data without id, timestamps, or isCustom flag
 * @returns The created template with generated id and timestamps
 */
export function saveTemplate(
  data: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>
): CustomTemplate {
  validateTemplateData(data)

  const templates = getAllCustomTemplates()
  
  // Check for duplicate names
  const existingWithName = templates.find(
    t => t.name.toLowerCase() === data.name.trim().toLowerCase()
  )
  if (existingWithName) {
    throw new TemplateManagerError(
      `A template with the name "${data.name}" already exists`,
      'DUPLICATE_NAME'
    )
  }

  const now = getCurrentTimestamp()
  const newTemplate: CustomTemplate = {
    id: generateTemplateId(),
    name: data.name.trim(),
    description: data.description?.trim() ?? '',
    icon: data.icon || 'file',
    categories: data.categories || [],
    presets: { ...data.presets },
    createdAt: now,
    updatedAt: now,
    isCustom: true,
  }

  try {
    setCustomTemplates([...templates, newTemplate])
    return newTemplate
  } catch (error) {
    if (error instanceof StorageError) {
      throw new TemplateManagerError(`Failed to save template: ${error.message}`, 'STORAGE_ERROR')
    }
    throw error
  }
}

/**
 * Updates an existing custom template
 * @param id - The template ID to update
 * @param updates - Partial template data to update
 * @returns The updated template
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>>
): CustomTemplate {
  const templates = getAllCustomTemplates()
  const index = templates.findIndex(t => t.id === id)
  
  if (index === -1) {
    throw new TemplateManagerError(`Template with ID "${id}" not found`, 'NOT_FOUND')
  }

  const existing = templates[index]

  // Check for duplicate names if name is being updated
  if (updates.name && updates.name.trim().toLowerCase() !== existing.name.toLowerCase()) {
    const existingWithName = templates.find(
      t => t.id !== id && t.name.toLowerCase() === updates.name!.trim().toLowerCase()
    )
    if (existingWithName) {
      throw new TemplateManagerError(
        `A template with the name "${updates.name}" already exists`,
        'DUPLICATE_NAME'
      )
    }
  }

  // Validate if full data would be valid
  const mergedData = {
    name: updates.name?.trim() ?? existing.name,
    description: updates.description?.trim() ?? existing.description,
    icon: updates.icon ?? existing.icon,
    categories: updates.categories ?? existing.categories,
    presets: updates.presets ?? existing.presets,
  }
  validateTemplateData(mergedData)

  const updatedTemplate: CustomTemplate = {
    ...existing,
    ...mergedData,
    updatedAt: getCurrentTimestamp(),
  }

  templates[index] = updatedTemplate

  try {
    setCustomTemplates(templates)
    return updatedTemplate
  } catch (error) {
    if (error instanceof StorageError) {
      throw new TemplateManagerError(`Failed to update template: ${error.message}`, 'STORAGE_ERROR')
    }
    throw error
  }
}

/**
 * Deletes a custom template by ID
 * @param id - The template ID to delete
 * @returns true if deleted successfully
 */
export function deleteTemplate(id: string): boolean {
  const templates = getAllCustomTemplates()
  const index = templates.findIndex(t => t.id === id)
  
  if (index === -1) {
    throw new TemplateManagerError(`Template with ID "${id}" not found`, 'NOT_FOUND')
  }

  const filteredTemplates = templates.filter(t => t.id !== id)

  try {
    setCustomTemplates(filteredTemplates)
    return true
  } catch (error) {
    if (error instanceof StorageError) {
      throw new TemplateManagerError(`Failed to delete template: ${error.message}`, 'STORAGE_ERROR')
    }
    throw error
  }
}

/**
 * Exports a template as a JSON string
 * @param id - The template ID to export
 * @returns JSON string representation of the template
 */
export function exportTemplate(id: string): string {
  const template = getTemplateById(id)
  
  if (!template) {
    throw new TemplateManagerError(`Template with ID "${id}" not found`, 'NOT_FOUND')
  }

  // Export without internal fields
  const exportData = {
    name: template.name,
    description: template.description,
    icon: template.icon,
    categories: template.categories,
    presets: template.presets,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Imports a template from a JSON string
 * @param json - JSON string representation of a template
 * @returns The imported template
 */
export function importTemplate(json: string): CustomTemplate {
  let data: unknown
  
  try {
    data = JSON.parse(json)
  } catch {
    throw new TemplateManagerError('Invalid JSON format', 'INVALID_DATA')
  }

  if (!data || typeof data !== 'object') {
    throw new TemplateManagerError('Invalid template data format', 'INVALID_DATA')
  }

  const templateData = data as Record<string, unknown>

  // Validate required fields
  if (typeof templateData.name !== 'string') {
    throw new TemplateManagerError('Template must have a name', 'INVALID_DATA')
  }

  if (templateData.presets && typeof templateData.presets !== 'object') {
    throw new TemplateManagerError('Template presets must be an object', 'INVALID_DATA')
  }

  const importData = {
    name: templateData.name as string,
    description: (templateData.description as string) ?? '',
    icon: (templateData.icon as string) ?? 'file',
    categories: Array.isArray(templateData.categories) 
      ? (templateData.categories as string[]) 
      : [],
    presets: (templateData.presets as Record<string, string>) ?? {},
  }

  return saveTemplate(importData)
}

/**
 * Duplicates an existing template with a new name
 * @param id - The template ID to duplicate
 * @param newName - Optional new name (defaults to "Copy of [original name]")
 * @returns The duplicated template
 */
export function duplicateTemplate(id: string, newName?: string): CustomTemplate {
  const template = getTemplateById(id)
  
  if (!template) {
    throw new TemplateManagerError(`Template with ID "${id}" not found`, 'NOT_FOUND')
  }

  const baseName = newName ?? `Copy of ${template.name}`
  let finalName = baseName
  let counter = 1

  // Find a unique name
  const templates = getAllCustomTemplates()
  while (templates.some(t => t.name.toLowerCase() === finalName.toLowerCase())) {
    counter++
    finalName = `${baseName} (${counter})`
  }

  return saveTemplate({
    name: finalName,
    description: template.description,
    icon: template.icon,
    categories: [...template.categories],
    presets: { ...template.presets },
  })
}
