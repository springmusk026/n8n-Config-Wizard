"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Code2, 
  Sparkles, 
  Upload, 
  GitCompare, 
  Save, 
  Download,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import type { Template } from "@/lib/n8n-config"
import type { CustomTemplate } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WizardHeaderProps {
  step: "template" | "configure"
  selectedTemplate: Template | CustomTemplate | null
  onStartOver: () => void
  onGenerate: () => void
  onImport?: () => void
  onCompare?: () => void
  onSaveTemplate?: () => void
  onExport?: () => void
  configCount: number
  progress: { configured: number; total: number; percentage: number }
  canGenerate?: boolean
  errorCount?: number
}

export function WizardHeader({
  step,
  selectedTemplate,
  onStartOver,
  onGenerate,
  onImport,
  onCompare,
  onSaveTemplate,
  onExport,
  configCount,
  progress,
  canGenerate = true,
  errorCount = 0,
}: WizardHeaderProps) {
  const isCustomTemplate = selectedTemplate && 'isCustom' in selectedTemplate && selectedTemplate.isCustom

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-foreground to-foreground/80 shadow-md">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-background" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm sm:text-base font-semibold tracking-tight">n8n Config Wizard</span>
            </div>
          </div>

          {step === "configure" && selectedTemplate && (
            <>
              <div className="h-6 w-px bg-border" />
              
              {/* Back button */}
              <button
                onClick={onStartOver}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group rounded-lg px-3 py-1.5 hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Go back to template selection"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden md:inline">Templates</span>
              </button>
              
              <div className="h-6 w-px bg-border hidden md:block" />
              
              {/* Template info */}
              <div className="hidden md:flex items-center gap-3">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-medium px-3 py-1",
                    isCustomTemplate && "bg-violet-500/10 text-violet-400 border-violet-500/30"
                  )}
                >
                  {selectedTemplate.name}
                </Badge>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          progress.percentage === 100 
                            ? "bg-success" 
                            : "bg-gradient-to-r from-foreground/80 to-foreground"
                        )}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums font-medium">
                      {progress.configured}/{progress.total}
                    </span>
                  </div>
                  
                  {/* Status indicator */}
                  {errorCount > 0 ? (
                    <div className="flex items-center gap-1.5 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
                    </div>
                  ) : canGenerate && progress.configured > 0 ? (
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-medium hidden lg:inline">Ready</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>

        {step === "configure" && (
          <div className="flex items-center gap-2">
            {/* Keyboard shortcut hint */}
            <span className="text-xs text-muted-foreground hidden xl:flex items-center gap-1.5 mr-2">
              <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded font-mono">⌘G</kbd>
              <span>generate</span>
            </span>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              {onImport && (
                <Button 
                  onClick={onImport} 
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden lg:inline">Import</span>
                </Button>
              )}
              {onExport && (
                <Button 
                  onClick={onExport} 
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden lg:inline">Export</span>
                </Button>
              )}
              {onCompare && (
                <Button 
                  onClick={onCompare} 
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                >
                  <GitCompare className="h-4 w-4" />
                  <span className="hidden lg:inline">Compare</span>
                </Button>
              )}
              {onSaveTemplate && (
                <Button 
                  onClick={onSaveTemplate} 
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden xl:inline">Save Template</span>
                </Button>
              )}
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            {/* Generate button */}
            <Button 
              onClick={onGenerate} 
              className={cn(
                "gap-2 h-9 px-4 font-medium transition-all",
                canGenerate 
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-md hover:shadow-lg" 
                  : "bg-secondary text-muted-foreground"
              )}
              disabled={!canGenerate}
            >
              <Code2 className="h-4 w-4" />
              <span>Generate</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
