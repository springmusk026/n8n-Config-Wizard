"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RotateCcw, FileKey, ChevronDown, Info, Eye, EyeOff, AlertCircle, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConfigCategory, EnvVariable } from "@/lib/n8n-config"
import type { ValidationError } from "@/lib/types"

import type { FilterType } from "@/lib/types"

interface ConfigFormProps {
  category: ConfigCategory
  config: Record<string, string>
  presets: Record<string, string>
  onChange: (name: string, value: string) => void
  onReset: () => void
  searchQuery: string
  validationErrors?: Map<string, ValidationError[]>
  highlightedVariable?: string | null
  activeFilters?: FilterType[]
  onOpenMobileSidebar?: () => void
}

const enumOptions: Record<string, string[]> = {
  N8N_PROTOCOL: ["http", "https"],
  DB_TYPE: ["sqlite", "postgresdb"],
  EXECUTIONS_MODE: ["regular", "queue"],
  EXECUTIONS_DATA_SAVE_ON_ERROR: ["all", "none"],
  EXECUTIONS_DATA_SAVE_ON_SUCCESS: ["all", "none"],
  N8N_SAMESITE_COOKIE: ["strict", "lax", "none"],
  N8N_LOG_LEVEL: ["info", "warn", "error", "debug"],
  N8N_LOG_OUTPUT: ["console", "file"],
  N8N_LOG_FORMAT: ["text", "json"],
  N8N_DEFAULT_BINARY_DATA_MODE: ["default", "filesystem", "s3", "database"],
  N8N_SOURCECONTROL_DEFAULT_SSH_KEY_TYPE: ["ed25519", "rsa"],
}

const enumDescriptions: Record<string, Record<string, string>> = {
  DB_TYPE: {
    sqlite: "Simple, file-based database. Great for testing and small deployments.",
    postgresdb: "Production-ready database with better performance and scalability.",
  },
  EXECUTIONS_MODE: {
    regular: "Standard execution mode. Good for single-instance deployments.",
    queue: "Redis-based queue for distributed, scalable execution.",
  },
  N8N_LOG_LEVEL: {
    info: "Standard operational information",
    warn: "Warnings and potential issues",
    error: "Only error messages",
    debug: "Detailed debugging information",
  },
}

export function ConfigForm({ 
  category, 
  config, 
  presets, 
  onChange, 
  onReset, 
  searchQuery,
  validationErrors = new Map(),
  highlightedVariable,
  activeFilters = [],
  onOpenMobileSidebar,
}: ConfigFormProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  // Required group is always expanded by default to prioritize required fields (Requirement 3.3)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ 
    required: true, 
    optional: true 
  })
  
  // Ref for scroll container
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Scroll to highlighted variable - Requirements: 5.3
  useEffect(() => {
    if (highlightedVariable && containerRef.current) {
      // Expand all groups to ensure the variable is visible
      setExpandedGroups({ required: true, optional: true })
      
      // Wait for groups to expand, then scroll
      setTimeout(() => {
        const element = document.getElementById(`var-${highlightedVariable}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [highlightedVariable])

  const filteredVariables = useMemo(() => {
    let variables = category.variables
    
    // Apply search filter
    if (searchQuery) {
      variables = variables.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    
    // Apply active filters - Requirements: 5.4, 5.5
    if (activeFilters.length > 0) {
      variables = variables.filter((v) => {
        // Check modified filter
        if (activeFilters.includes('modified')) {
          const isModified = config[v.name] !== undefined && config[v.name] !== v.default
          if (!isModified) return false
        }
        
        // Check required filter
        if (activeFilters.includes('required')) {
          if (!v.required) return false
        }
        
        // Check errors filter
        if (activeFilters.includes('errors')) {
          const hasErrors = (validationErrors.get(v.name) || []).length > 0
          if (!hasErrors) return false
        }
        
        return true
      })
    }
    
    return variables
  }, [category.variables, searchQuery, activeFilters, config, validationErrors])

  // Count configured variables for stats display
  const configuredCount = useMemo(() => {
    return filteredVariables.filter((v) => !v.required && config[v.name] && config[v.name] !== v.default).length
  }, [filteredVariables, config])

  // Group variables - keep non-required fields stable (don't move them while editing)
  // This prevents the jarring UX of fields jumping between sections while typing
  const groupedVariables = useMemo(() => {
    const required = filteredVariables.filter((v) => v.required)
    // All non-required fields stay in "optional" section - they don't jump around
    const optional = filteredVariables.filter((v) => !v.required)

    return { required, optional, configuredCount }
  }, [filteredVariables, configuredCount])

  const togglePassword = (name: string) => {
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const isPasswordField = (name: string) => {
    return (
      name.toLowerCase().includes("password") ||
      name.toLowerCase().includes("secret") ||
      name.toLowerCase().includes("key")
    )
  }

  const renderField = (variable: EnvVariable, index: number) => {
    const value = config[variable.name] ?? variable.default
    const isPreset = presets[variable.name] !== undefined
    const isModified = config[variable.name] !== undefined && config[variable.name] !== variable.default
    const isPassword = isPasswordField(variable.name)
    const showPassword = showPasswords[variable.name]
    const fieldErrors = validationErrors.get(variable.name) || []
    const hasErrors = fieldErrors.length > 0

    const isHighlighted = highlightedVariable === variable.name
    
    const fieldContent = (
      <div
        id={`var-${variable.name}`}
        className={cn(
          "group relative rounded-xl border bg-card p-5 transition-all duration-200",
          "hover:shadow-md hover:shadow-black/5",
          !isModified && !hasErrors && "border-border hover:border-muted-foreground/30",
          isModified && !hasErrors && "border-success/30 bg-success/5 hover:border-success/50",
          hasErrors && "border-destructive/50 bg-destructive/5 hover:border-destructive/70",
          isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse",
          "opacity-0 animate-fade-in",
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Label htmlFor={variable.name} className="font-mono text-sm font-medium">
                {variable.name}
              </Label>
              {variable.required && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 bg-destructive/10 text-destructive border-destructive/20"
                >
                  Required
                </Badge>
              )}
              {isPreset && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  Template
                </Badge>
              )}
              {variable.fileSupport && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-[10px] h-5 gap-1">
                        <FileKey className="h-3 w-3" />
                        _FILE
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        Supports _FILE suffix to read value from a file path (for Docker secrets)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {isModified && <Badge className="text-[10px] h-5 bg-success text-background">Modified</Badge>}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{variable.description}</p>
          </div>

          {/* Boolean toggle on the right - Requirements: 7.6 */}
          {variable.type === "Boolean" && (
            <div className="flex flex-col items-end gap-1">
              <Switch
                id={variable.name}
                checked={value === "true"}
                onCheckedChange={(checked) => onChange(variable.name, checked ? "true" : "false")}
                aria-label={`${variable.name}: ${variable.description}`}
                aria-invalid={hasErrors}
                aria-describedby={hasErrors ? `${variable.name}-error` : `${variable.name}-desc`}
              />
              {/* Hidden description for screen readers */}
              <span id={`${variable.name}-desc`} className="sr-only">
                {variable.description}. Current value: {value === "true" ? "enabled" : "disabled"}.
                {variable.required ? " This field is required." : ""}
              </span>
            </div>
          )}
        </div>

        {/* Validation errors for Boolean fields */}
        {variable.type === "Boolean" && hasErrors && (
          <div id={`${variable.name}-error`} className="space-y-1 mt-2" role="alert" aria-live="polite">
            {fieldErrors.map((error, i) => (
              <p key={i} className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {error.message}
              </p>
            ))}
          </div>
        )}

        {variable.type !== "Boolean" && (
          <div className="space-y-2">
            {/* Enum/Select field - Requirements: 7.6 */}
            {variable.type === "Enum" && enumOptions[variable.name] ? (
              <div className="space-y-2">
                <Select value={value} onValueChange={(v) => onChange(variable.name, v)}>
                  <SelectTrigger 
                    id={variable.name}
                    className={cn(
                      "w-full bg-card border-border",
                      hasErrors && "border-destructive focus:ring-destructive"
                    )}
                    aria-label={`${variable.name}: ${variable.description}`}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? `${variable.name}-error` : `${variable.name}-desc`}
                  >
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  {/* Hidden description for screen readers */}
                  <span id={`${variable.name}-desc`} className="sr-only">
                    {variable.description}. Current value: {value}.
                    {variable.required ? " This field is required." : ""}
                  </span>
                  <SelectContent>
                    {enumOptions[variable.name].map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex flex-col items-start">
                          <span>{option}</span>
                          {enumDescriptions[variable.name]?.[option] && (
                            <span className="text-xs text-muted-foreground">
                              {enumDescriptions[variable.name][option]}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              /* Text/Number input field - Requirements: 7.6 */
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    id={variable.name}
                    type={isPassword && !showPassword ? "password" : "text"}
                    value={value}
                    onChange={(e) => onChange(variable.name, e.target.value)}
                    placeholder={variable.default || "Enter value..."}
                    className={cn(
                      "bg-card border-border pr-20 font-mono text-sm",
                      hasErrors && "border-destructive focus-visible:ring-destructive"
                    )}
                    aria-label={`${variable.name}: ${variable.description}`}
                    aria-invalid={hasErrors}
                    aria-describedby={hasErrors ? `${variable.name}-error` : `${variable.name}-desc`}
                    aria-required={variable.required}
                  />
                  {/* Hidden description for screen readers */}
                  <span id={`${variable.name}-desc`} className="sr-only">
                    {variable.description}.
                    {variable.default ? ` Default value: ${variable.default}.` : ""}
                    {variable.required ? " This field is required." : ""}
                  </span>
                  {/* Password visibility toggle with focus indicator - Requirements: 7.1, 7.5 */}
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => togglePassword(variable.name)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
                {isModified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onChange(variable.name, variable.default)}
                          className="shrink-0 h-9 w-9"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reset to: {variable.default || "(empty)"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}

            {variable.default && !isModified && !hasErrors && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Default: <code className="rounded bg-secondary px-1.5 py-0.5 font-mono">{variable.default}</code>
              </p>
            )}

            {/* Validation errors display */}
            {hasErrors && (
              <div id={`${variable.name}-error`} className="space-y-1" role="alert" aria-live="polite">
                {fieldErrors.map((error, i) => (
                  <p key={i} className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {error.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )

    return <div key={variable.name}>{fieldContent}</div>
  }

  const renderGroup = (title: string, variables: EnvVariable[], groupKey: string, badge?: React.ReactNode) => {
    if (variables.length === 0) return null

    const isExpanded = expandedGroups[groupKey] !== false
    const isRequiredGroup = groupKey === 'required'

    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={(open) => setExpandedGroups((prev) => ({ ...prev, [groupKey]: open }))}
        className="space-y-4"
      >
        <CollapsibleTrigger 
          className={cn(
            "flex items-center justify-between w-full py-3 px-4 rounded-xl transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "hover:bg-secondary/50",
            isRequiredGroup ? "bg-destructive/5 hover:bg-destructive/10" : "bg-secondary/30"
          )}
          aria-expanded={isExpanded}
          aria-label={`${title} variables section, ${variables.length} variables${isExpanded ? ', expanded' : ', collapsed'}`}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isRequiredGroup ? "bg-destructive/10" : "bg-secondary"
            )}>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  !isExpanded && "-rotate-90",
                  isRequiredGroup ? "text-destructive" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-semibold",
                isRequiredGroup ? "text-destructive" : "text-muted-foreground"
              )}>
                {title}
              </span>
              {badge}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{variables.length} variables</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pl-2" role="region" aria-label={`${title} variables`}>
          {variables.map((v, i) => renderField(v, i))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-auto scrollbar-thin bg-background/50">
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl animate-fade-in">
        {/* Category Header */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3">
              {/* Mobile menu button */}
              {onOpenMobileSidebar && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onOpenMobileSidebar}
                  className="md:hidden shrink-0 h-9 w-9"
                  aria-label="Open category menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{category.name}</h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">{category.description}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset} 
              className="gap-2 shrink-0 hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset All</span>
            </Button>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{category.variables.length} variables</span>
            </div>
            {groupedVariables.required.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Required:</span>
                <span className="font-medium text-destructive">{groupedVariables.required.length}</span>
              </div>
            )}
            {configuredCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Configured:</span>
                <span className="font-medium text-success">{configuredCount}</span>
              </div>
            )}
          </div>
        </div>

        {filteredVariables.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No matching variables</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try adjusting your search or browse other categories
            </p>
          </div>
        )}

        {filteredVariables.length > 0 && (
          <div className="space-y-6">
            {renderGroup(
              "Required",
              groupedVariables.required,
              "required",
              groupedVariables.required.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 bg-destructive/10 text-destructive border-destructive/20"
                >
                  {groupedVariables.required.length}
                </Badge>
              ),
            )}
            {renderGroup(
              "Optional", 
              groupedVariables.optional, 
              "optional",
              configuredCount > 0 && (
                <Badge className="text-[10px] h-5 bg-success/10 text-success border-success/20" variant="outline">
                  {configuredCount} configured
                </Badge>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
