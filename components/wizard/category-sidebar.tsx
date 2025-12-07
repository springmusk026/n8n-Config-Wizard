"use client"

import type React from "react"
import { useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Search, AlertCircle, Filter } from "lucide-react"
import {
  Globe,
  Database,
  Play,
  Layers,
  Shield,
  FileText,
  Mail,
  HardDrive,
  Sparkles,
  GitBranch,
  Clock,
  Activity,
  Puzzle,
} from "lucide-react"
import type { ConfigCategory } from "@/lib/n8n-config"
import type { ValidationError, FilterType } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CategorySidebarProps {
  categories: ConfigCategory[]
  activeCategory: string
  onSelect: (id: string) => void
  config: Record<string, string>
  searchQuery: string
  onSearchChange: (query: string) => void
  validationErrors?: Map<string, ValidationError[]>
  activeFilters?: FilterType[]
  onFilterToggle?: (filter: FilterType) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  database: Database,
  play: Play,
  layers: Layers,
  shield: Shield,
  "file-text": FileText,
  mail: Mail,
  "hard-drive": HardDrive,
  sparkles: Sparkles,
  "git-branch": GitBranch,
  clock: Clock,
  activity: Activity,
  puzzle: Puzzle,
}

export function CategorySidebar({
  categories,
  activeCategory,
  onSelect,
  config,
  searchQuery,
  onSearchChange,
  validationErrors,
  activeFilters = [],
  onFilterToggle,
}: CategorySidebarProps) {
  const categoryListRef = useRef<HTMLDivElement>(null)
  
  const getCategoryConfigCount = (category: ConfigCategory) => {
    return category.variables.filter((v) => config[v.name] && config[v.name] !== v.default).length
  }

  const getCategoryErrorCount = (category: ConfigCategory): number => {
    if (!validationErrors) return 0
    return category.variables.reduce((count, variable) => {
      const errors = validationErrors.get(variable.name)
      return count + (errors?.length || 0)
    }, 0)
  }

  const filteredCategories = searchQuery
    ? categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.variables.some(
            (v) =>
              v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              v.description.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : categories

  const handleCategoryKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLButtonElement>,
    categoryId: string,
    index: number
  ) => {
    const categoryButtons = categoryListRef.current?.querySelectorAll<HTMLButtonElement>('[data-category-button]')
    if (!categoryButtons) return

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const nextIndex = index + 1 < filteredCategories.length ? index + 1 : 0
        categoryButtons[nextIndex]?.focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prevIndex = index - 1 >= 0 ? index - 1 : filteredCategories.length - 1
        categoryButtons[prevIndex]?.focus()
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        onSelect(categoryId)
        setTimeout(() => {
          const firstInput = document.querySelector<HTMLElement>(
            'input:not([type="hidden"]), select, [role="switch"], [role="combobox"]'
          )
          firstInput?.focus()
        }, 100)
        break
      }
      case 'Home': {
        e.preventDefault()
        categoryButtons[0]?.focus()
        break
      }
      case 'End': {
        e.preventDefault()
        categoryButtons[filteredCategories.length - 1]?.focus()
        break
      }
    }
  }, [filteredCategories, onSelect])

  const totalConfigured = categories.reduce((sum, cat) => sum + getCategoryConfigCount(cat), 0)
  const totalErrors = categories.reduce((sum, cat) => sum + getCategoryErrorCount(cat), 0)

  return (
    <aside className="w-72 h-full max-h-full border-r border-border bg-card/50 flex-shrink-0 flex flex-col animate-fade-in">
      {/* Search Section */}
      <div className="p-4 space-y-3 border-b border-border bg-card/80">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            data-search-input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search configuration variables"
            className={cn(
              "w-full rounded-lg border border-border bg-background pl-10 pr-16 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "transition-all duration-200"
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded font-mono">K</kbd>
          </div>
        </div>
        
        {/* Filter toggles */}
        {onFilterToggle && (
          <div className="flex gap-2" role="group" aria-label="Filter options">
            <button
              onClick={() => onFilterToggle('modified')}
              aria-pressed={activeFilters.includes('modified')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeFilters.includes('modified')
                  ? "bg-success/10 border-success/40 text-success shadow-sm"
                  : "border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="h-3 w-3" />
              Modified
            </button>
            <button
              onClick={() => onFilterToggle('required')}
              aria-pressed={activeFilters.includes('required')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                activeFilters.includes('required')
                  ? "bg-destructive/10 border-destructive/40 text-destructive shadow-sm"
                  : "border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertCircle className="h-3 w-3" />
              Required
            </button>
          </div>
        )}
      </div>

      {/* Category List */}
      <nav 
        className="flex-1 min-h-0 overflow-auto scrollbar-thin p-3"
        role="navigation"
        aria-label="Configuration categories"
      >
        <div 
          ref={categoryListRef}
          className="space-y-1"
          role="listbox"
          aria-label="Category list"
          aria-activedescendant={`category-${activeCategory}`}
        >
          {filteredCategories.map((category, index) => {
            const Icon = iconMap[category.icon] || Globe
            const configCount = getCategoryConfigCount(category)
            const errorCount = getCategoryErrorCount(category)
            const isActive = activeCategory === category.id
            const totalVars = category.variables.length
            const hasErrors = errorCount > 0

            return (
              <Tooltip key={category.id}>
                <TooltipTrigger asChild>
                  <button
                    id={`category-${category.id}`}
                    data-category-button
                    role="option"
                    aria-selected={isActive}
                    aria-label={`${category.name}${hasErrors ? `, ${errorCount} validation errors` : ''}${configCount > 0 ? `, ${configCount} of ${totalVars} configured` : ''}`}
                    onClick={() => onSelect(category.id)}
                    onKeyDown={(e) => handleCategoryKeyDown(e, category.id, index)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-200",
                      isActive
                        ? "bg-secondary text-foreground shadow-sm ring-1 ring-border"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                      hasErrors && !isActive && "bg-destructive/5 ring-1 ring-destructive/20",
                      hasErrors && isActive && "ring-destructive/50",
                      "opacity-0 animate-fade-in",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-foreground text-background" 
                            : "bg-secondary/80",
                          hasErrors && !isActive && "bg-destructive/10 text-destructive",
                          hasErrors && isActive && "bg-destructive text-destructive-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium truncate">{category.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {hasErrors ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-[10px] font-bold">{errorCount}</span>
                        </div>
                      ) : configCount > 0 ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success">
                          <span className="text-[10px] font-bold">{configCount}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 tabular-nums">{totalVars}</span>
                      )}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="p-3">
                  <div className="space-y-1.5">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {configCount} of {totalVars} configured
                    </div>
                    {hasErrors && (
                      <div className="text-xs text-destructive font-medium">
                        {errorCount} validation {errorCount === 1 ? "error" : "errors"}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {filteredCategories.length === 0 && searchQuery && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
              <Search className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No variables found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
          </div>
        )}
      </nav>

      {/* Footer Stats - Always at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card/80">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Categories</span>
              <span className="font-semibold text-foreground">{categories.length}</span>
            </div>
            {totalConfigured > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Configured</span>
                <span className="font-semibold text-success">{totalConfigured}</span>
              </div>
            )}
          </div>
          {totalErrors > 0 && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span className="font-semibold">{totalErrors}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
