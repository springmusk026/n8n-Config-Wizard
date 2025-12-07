"use client"

import type React from "react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Search, ArrowRight, AlertCircle } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import type { ConfigCategory, EnvVariable } from "@/lib/n8n-config"
import type { ValidationError } from "@/lib/types"

interface SearchResult {
  variable: EnvVariable
  category: ConfigCategory
  matchType: 'name' | 'description'
}

interface GroupedResults {
  category: ConfigCategory
  results: SearchResult[]
}

interface SearchResultsProps {
  categories: ConfigCategory[]
  searchQuery: string
  config: Record<string, string>
  presets: Record<string, string>
  validationErrors?: Map<string, ValidationError[]>
  onResultClick: (categoryId: string, variableName: string) => void
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

// Common search suggestions for when no results are found
const SEARCH_SUGGESTIONS = [
  { term: "database", description: "Database configuration" },
  { term: "port", description: "Port settings" },
  { term: "ssl", description: "SSL/TLS settings" },
  { term: "redis", description: "Redis queue settings" },
  { term: "smtp", description: "Email configuration" },
  { term: "log", description: "Logging settings" },
  { term: "timeout", description: "Timeout settings" },
  { term: "password", description: "Password fields" },
]

/**
 * Find related search suggestions based on the current query
 */
function getRelatedSuggestions(query: string): typeof SEARCH_SUGGESTIONS {
  const lowerQuery = query.toLowerCase()
  
  // Find suggestions that might be related
  const related = SEARCH_SUGGESTIONS.filter(s => {
    // Check if suggestion contains part of query or vice versa
    return s.term.includes(lowerQuery.slice(0, 3)) || 
           lowerQuery.includes(s.term.slice(0, 3)) ||
           s.description.toLowerCase().includes(lowerQuery)
  })
  
  // If no related found, return popular suggestions
  if (related.length === 0) {
    return SEARCH_SUGGESTIONS.slice(0, 4)
  }
  
  return related.slice(0, 4)
}


export function SearchResults({
  categories,
  searchQuery,
  config,
  presets,
  validationErrors,
  onResultClick,
}: SearchResultsProps) {
  // Search across all categories and group results
  const groupedResults = useMemo<GroupedResults[]>(() => {
    if (!searchQuery || searchQuery.trim().length === 0) return []
    
    const query = searchQuery.toLowerCase().trim()
    const results: GroupedResults[] = []
    
    for (const category of categories) {
      const categoryResults: SearchResult[] = []
      
      for (const variable of category.variables) {
        const nameMatch = variable.name.toLowerCase().includes(query)
        const descMatch = variable.description.toLowerCase().includes(query)
        
        if (nameMatch || descMatch) {
          categoryResults.push({
            variable,
            category,
            matchType: nameMatch ? 'name' : 'description',
          })
        }
      }
      
      if (categoryResults.length > 0) {
        results.push({
          category,
          results: categoryResults,
        })
      }
    }
    
    return results
  }, [categories, searchQuery])

  const totalResults = useMemo(() => {
    return groupedResults.reduce((sum, group) => sum + group.results.length, 0)
  }, [groupedResults])

  // Don't render if no search query
  if (!searchQuery || searchQuery.trim().length === 0) {
    return null
  }

  // Empty state with suggestions - Requirements: 5.6
  if (totalResults === 0) {
    const suggestions = getRelatedSuggestions(searchQuery)
    
    return (
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="p-6 max-w-3xl animate-fade-in">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No results for "{searchQuery}"
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-6">
              Try a different search term or browse the categories
            </p>
            
            {/* Suggestions - Requirements: 5.6 */}
            <div className="w-full max-w-md">
              <p className="text-xs text-muted-foreground mb-3">Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.term}
                    onClick={() => onResultClick('', suggestion.term)}
                    className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    {suggestion.term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="p-6 max-w-3xl animate-fade-in">
        {/* Search results header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Search Results
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Found {totalResults} variable{totalResults !== 1 ? 's' : ''} matching "{searchQuery}" 
            across {groupedResults.length} categor{groupedResults.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>

        {/* Grouped results - Requirements: 5.1, 5.2 */}
        <div className="space-y-6">
          {groupedResults.map((group) => {
            const Icon = iconMap[group.category.icon] || Globe
            
            return (
              <div key={group.category.id} className="space-y-3">
                {/* Category header - Requirements: 5.2 */}
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{group.category.name}</span>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {group.results.length}
                  </Badge>
                </div>
                
                {/* Results for this category */}
                <div className="space-y-2">
                  {group.results.map((result, index) => {
                    const value = config[result.variable.name] ?? result.variable.default
                    const isModified = config[result.variable.name] !== undefined && 
                                       config[result.variable.name] !== result.variable.default
                    const fieldErrors = validationErrors?.get(result.variable.name) || []
                    const hasErrors = fieldErrors.length > 0
                    
                    return (
                      <button
                        key={result.variable.name}
                        onClick={() => onResultClick(group.category.id, result.variable.name)}
                        className={cn(
                          "w-full text-left rounded-lg border border-border bg-background p-4 transition-all duration-200",
                          "hover:border-muted-foreground/50 hover:shadow-sm hover:bg-secondary/20",
                          hasErrors && "border-destructive/50 bg-destructive/5",
                          "opacity-0 animate-fade-in group"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-sm font-medium">
                                {highlightMatch(result.variable.name, searchQuery)}
                              </span>
                              {result.variable.required && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5 bg-destructive/10 text-destructive border-destructive/20"
                                >
                                  Required
                                </Badge>
                              )}
                              {isModified && (
                                <Badge className="text-[10px] h-5 bg-success text-background">
                                  Modified
                                </Badge>
                              )}
                              {hasErrors && (
                                <Badge variant="destructive" className="text-[10px] h-5 gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Error
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {highlightMatch(result.variable.description, searchQuery)}
                            </p>
                            {value && (
                              <p className="text-xs text-muted-foreground/70 mt-1 font-mono truncate">
                                Current: {value}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Highlight matching text in a string
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text
  
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)
  
  if (index === -1) return text
  
  return (
    <>
      {text.slice(0, index)}
      <mark className="bg-yellow-200 dark:bg-yellow-900/50 rounded px-0.5">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  )
}
