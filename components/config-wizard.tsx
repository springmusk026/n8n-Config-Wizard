"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { WizardHeader } from "./wizard/wizard-header"
import { TemplateSelector } from "./wizard/template-selector"
import { CategorySidebar } from "./wizard/category-sidebar"
import { ConfigForm } from "./wizard/config-form"
import { OutputPanel } from "./wizard/output-panel"
import { QuickActions } from "./wizard/quick-actions"
import { ImportModal } from "./wizard/import-modal"
import { DiffView } from "./wizard/diff-view"
import { TemplateSaveModal } from "./wizard/template-save-modal"
import { SearchResults } from "./wizard/search-results"
import { templates, categories, type Template, type OutputFormat } from "@/lib/n8n-config"
import { ToastProvider, useToast } from "@/components/ui/toast-provider"
import { validateConfig, getValidationErrorsByField } from "@/lib/validation"
import { revertField, revertAll } from "@/lib/diff"
import { serializeJson } from "@/lib/parser"
import { getAllCustomTemplates, deleteTemplate as deleteCustomTemplate } from "@/lib/template-manager"
import type { ValidationError, ValidationResult, CustomTemplate, FilterType } from "@/lib/types"

function WizardContent() {
  const [step, setStep] = useState<"template" | "configure">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | CustomTemplate | null>(null)
  const [activeCategory, setActiveCategory] = useState("deployment")
  const [config, setConfig] = useState<Record<string, string>>({})
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("docker-compose")
  const [showOutput, setShowOutput] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showTemplateSave, setShowTemplateSave] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedVariable, setHighlightedVariable] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([])
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const { toast } = useToast()

  // Load custom templates on mount
  useEffect(() => {
    try {
      const templates = getAllCustomTemplates()
      setCustomTemplates(templates)
    } catch (error) {
      console.error("Failed to load custom templates:", error)
    }
  }, [])

  // Validation state - computed from config
  const validationResult = useMemo<ValidationResult>(() => {
    return validateConfig(config)
  }, [config])

  const validationErrorsByField = useMemo<Map<string, ValidationError[]>>(() => {
    return getValidationErrorsByField(config)
  }, [config])

  const canGenerateConfig = validationResult.valid

  const handleTemplateSelect = (template: Template | CustomTemplate) => {
    setSelectedTemplate(template)
    setConfig({ ...template.presets })
    setStep("configure")
    setActiveCategory(template.categories[0] || "deployment")
    const isCustom = 'isCustom' in template && template.isCustom
    toast.success(`${template.name} template loaded`, {
      description: `${Object.keys(template.presets).length} variables pre-configured${isCustom ? ' (custom template)' : ''}`,
    })
  }

  const handleEditCustomTemplate = (template: CustomTemplate) => {
    // For now, just select the template for editing
    // A full edit modal could be implemented in a future task
    handleTemplateSelect(template)
    toast.info(`Editing "${template.name}"`, {
      description: 'Make changes and save as a new template when done',
    })
  }

  const handleConfigChange = (name: string, value: string) => {
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetToTemplate = () => {
    if (selectedTemplate) {
      setConfig({ ...selectedTemplate.presets })
      toast.info("Reset to template defaults")
    }
  }

  const handleStartOver = () => {
    setStep("template")
    setSelectedTemplate(null)
    setConfig({})
    setShowOutput(false)
    setShowImport(false)
    setSearchQuery("")
  }

  const handleImport = useCallback((importedConfig: Record<string, string>) => {
    // Merge imported config with existing config
    setConfig((prev) => ({ ...prev, ...importedConfig }))
    const importedCount = Object.keys(importedConfig).length
    toast.success(`Configuration imported`, {
      description: `${importedCount} variable${importedCount !== 1 ? "s" : ""} imported successfully`,
    })
  }, [toast])

  const handleOpenImport = useCallback(() => {
    setShowImport(true)
  }, [])

  // Diff view handlers - Requirements: 4.1, 4.3
  const handleOpenDiff = useCallback(() => {
    setShowDiff(true)
  }, [])

  const handleCloseDiff = useCallback(() => {
    setShowDiff(false)
  }, [])

  const handleRevertField = useCallback((field: string) => {
    if (!selectedTemplate) return
    const newConfig = revertField(field, config, selectedTemplate.presets)
    setConfig(newConfig)
    toast.info(`Reverted "${field}" to default`)
  }, [config, selectedTemplate, toast])

  const handleRevertAll = useCallback(() => {
    if (!selectedTemplate) return
    const newConfig = revertAll(config, selectedTemplate.presets)
    setConfig(newConfig)
    setShowDiff(false)
    toast.info("All changes reverted to template defaults")
  }, [config, selectedTemplate, toast])

  // Template save handlers - Requirements: 6.1, 6.2
  const handleOpenTemplateSave = useCallback(() => {
    setShowTemplateSave(true)
  }, [])

  const handleCloseTemplateSave = useCallback(() => {
    setShowTemplateSave(false)
  }, [])

  const handleTemplateSaved = useCallback((templateId: string) => {
    // Refresh custom templates list
    try {
      const templates = getAllCustomTemplates()
      setCustomTemplates(templates)
    } catch (error) {
      console.error("Failed to refresh custom templates:", error)
    }
  }, [])

  // Export handler - Requirements: 1.5
  const handleExport = useCallback(() => {
    const templateId = selectedTemplate && 'id' in selectedTemplate ? selectedTemplate.id : null
    const jsonContent = serializeJson(config, templateId)
    
    // Create and download the file
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `n8n-config-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success("Configuration exported", {
      description: "Your configuration has been saved as a JSON file",
    })
  }, [config, selectedTemplate, toast])

  // Delete custom template handler - Requirements: 6.5
  const handleDeleteCustomTemplate = useCallback((templateId: string) => {
    try {
      deleteCustomTemplate(templateId)
      const templates = getAllCustomTemplates()
      setCustomTemplates(templates)
      toast.success("Template deleted")
    } catch (error) {
      toast.error("Failed to delete template")
    }
  }, [toast])

  // Handle search result click - navigate to category and highlight variable
  // Requirements: 5.3
  const handleSearchResultClick = useCallback((categoryId: string, variableName: string) => {
    // If categoryId is empty, it's a suggestion click - update search query
    if (!categoryId) {
      setSearchQuery(variableName)
      return
    }
    
    // Navigate to the category
    setActiveCategory(categoryId)
    // Clear search to show the full category
    setSearchQuery("")
    // Set the highlighted variable for scroll-to behavior
    setHighlightedVariable(variableName)
    
    // Clear highlight after animation
    setTimeout(() => {
      setHighlightedVariable(null)
    }, 2000)
  }, [])

  // Handle search query change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    // Clear highlighted variable when searching
    if (query) {
      setHighlightedVariable(null)
    }
  }, [])

  // Handle filter toggle - Requirements: 5.4, 5.5
  const handleFilterToggle = useCallback((filter: FilterType) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter)
      }
      return [...prev, filter]
    })
  }, [])

  const handleGenerate = () => {
    if (!canGenerateConfig) {
      const errorCount = validationResult.errors.length
      toast.error(`Cannot generate config`, {
        description: `${errorCount} validation error${errorCount !== 1 ? 's' : ''} must be fixed first`,
      })
      return
    }
    setShowOutput(true)
  }

  const getConfigProgress = useCallback(() => {
    if (!selectedTemplate) return { configured: 0, total: 0, percentage: 0 }

    const relevantCategories = categories.filter((c) => selectedTemplate.categories.includes(c.id))
    const totalVars = relevantCategories.reduce((sum, cat) => sum + cat.variables.length, 0)
    const configuredVars = Object.keys(config).filter((k) => config[k] && config[k] !== "").length

    return {
      configured: configuredVars,
      total: totalVars,
      percentage: totalVars > 0 ? Math.round((configuredVars / totalVars) * 100) : 0,
    }
  }, [selectedTemplate, config])

  const activeCategories = selectedTemplate
    ? categories.filter((c) => selectedTemplate.categories.includes(c.id))
    : categories

  /**
   * Global keyboard shortcuts
   * Requirements: 7.4 - Escape closes output panel and returns focus to main form
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]")
        searchInput?.focus()
      }
      // Cmd/Ctrl+G to generate config
      if ((e.metaKey || e.ctrlKey) && e.key === "g" && step === "configure") {
        e.preventDefault()
        handleGenerate()
      }
      // Escape to close output panel or diff view and return focus to main form - Requirements: 7.4
      if (e.key === "Escape") {
        if (showOutput) {
          e.preventDefault()
          setShowOutput(false)
        } else if (showDiff) {
          e.preventDefault()
          setShowDiff(false)
        }
        // Return focus to the first form field or the search input
        setTimeout(() => {
          const firstInput = document.querySelector<HTMLElement>(
            '[data-search-input], input:not([type="hidden"]), select, [role="switch"], [role="combobox"]'
          )
          firstInput?.focus()
        }, 100)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, showOutput, showDiff])

  return (
    <div className="flex flex-col min-h-screen">
      <WizardHeader
        step={step}
        selectedTemplate={selectedTemplate}
        onStartOver={handleStartOver}
        onGenerate={handleGenerate}
        onImport={handleOpenImport}
        onCompare={handleOpenDiff}
        onSaveTemplate={handleOpenTemplateSave}
        onExport={handleExport}
        configCount={Object.keys(config).filter((k) => config[k]).length}
        progress={getConfigProgress()}
        canGenerate={canGenerateConfig}
        errorCount={validationResult.errors.length}
      />

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />

      <TemplateSaveModal
        open={showTemplateSave}
        onClose={handleCloseTemplateSave}
        onSave={handleTemplateSaved}
        currentConfig={config}
        categories={selectedTemplate?.categories}
      />

      {step === "template" ? (
        <div className="animate-fade-in">
          <TemplateSelector 
            templates={templates} 
            customTemplates={customTemplates}
            onSelect={handleTemplateSelect}
            onEditCustomTemplate={handleEditCustomTemplate}
            onDeleteCustomTemplate={handleDeleteCustomTemplate}
          />
        </div>
      ) : (
        <div className="flex overflow-hidden relative" style={{ height: 'calc(100vh - 57px)' }}>
          {/* Mobile sidebar overlay */}
          {showMobileSidebar && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />
          )}
          
          {/* Sidebar - hidden on mobile by default, shown as overlay when toggled */}
          <div className={`
            fixed md:relative inset-y-0 left-0 z-50 md:z-auto
            transform transition-transform duration-300 ease-in-out
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `} style={{ top: '57px', height: 'calc(100vh - 57px)' }}>
            <CategorySidebar
              categories={activeCategories}
              activeCategory={activeCategory}
              onSelect={(id) => {
                setActiveCategory(id)
                setShowMobileSidebar(false) // Close sidebar on mobile after selection
              }}
              config={config}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              validationErrors={validationErrorsByField}
              activeFilters={activeFilters}
              onFilterToggle={handleFilterToggle}
            />
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {/* Show search results when searching, otherwise show config form */}
            {searchQuery ? (
              <SearchResults
                categories={activeCategories}
                searchQuery={searchQuery}
                config={config}
                presets={selectedTemplate?.presets || {}}
                validationErrors={validationErrorsByField}
                onResultClick={(categoryId, variableName) => {
                  handleSearchResultClick(categoryId, variableName)
                  setShowMobileSidebar(false)
                }}
              />
            ) : (
              <ConfigForm
                category={categories.find((c) => c.id === activeCategory)!}
                config={config}
                presets={selectedTemplate?.presets || {}}
                onChange={handleConfigChange}
                onReset={handleResetToTemplate}
                searchQuery=""
                validationErrors={validationErrorsByField}
                highlightedVariable={highlightedVariable}
                activeFilters={activeFilters}
                onOpenMobileSidebar={() => setShowMobileSidebar(true)}
              />
            )}
            {showOutput && (
              <div className="animate-slide-in-right fixed md:relative inset-0 md:inset-auto z-50 md:z-auto bg-card">
                <OutputPanel
                  config={config}
                  format={outputFormat}
                  onFormatChange={setOutputFormat}
                  onClose={() => setShowOutput(false)}
                />
              </div>
            )}
            {showDiff && selectedTemplate && (
              <div className="animate-slide-in-right fixed md:relative inset-0 md:inset-auto md:w-[500px] z-50 md:z-auto border-l bg-card flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h2 className="font-semibold">Compare Changes</h2>
                  <button
                    onClick={handleCloseDiff}
                    className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Close diff view"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <DiffView
                    config={config}
                    defaults={selectedTemplate.presets}
                    onRevert={handleRevertField}
                    onRevertAll={handleRevertAll}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "configure" && (
        <QuickActions 
          onGenerate={handleGenerate} 
          onReset={handleResetToTemplate} 
          showOutput={showOutput}
          canGenerate={canGenerateConfig}
          errorCount={validationResult.errors.length}
        />
      )}
    </div>
  )
}

export function ConfigWizard() {
  return (
    <ToastProvider>
      <WizardContent />
    </ToastProvider>
  )
}
