"use client"

import { Button } from "@/components/ui/button"
import { Code2, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  onGenerate: () => void
  onReset: () => void
  showOutput: boolean
  canGenerate?: boolean
  errorCount?: number
}

export function QuickActions({ 
  onGenerate, 
  onReset, 
  showOutput,
  canGenerate = true,
  errorCount = 0,
}: QuickActionsProps) {
  if (showOutput) return null

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in w-[calc(100%-2rem)] sm:w-auto max-w-md sm:max-w-none">
      <div className={cn(
        "flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border shadow-2xl shadow-black/30 backdrop-blur-xl",
        canGenerate 
          ? "bg-card/95 border-border" 
          : "bg-destructive/5 border-destructive/30"
      )}>
        {/* Status indicator */}
        {errorCount > 0 ? (
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          </div>
        ) : canGenerate && (
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-xs font-medium text-success">Ready</span>
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="gap-2 text-muted-foreground hover:text-foreground h-9"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset to template defaults</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                onClick={onGenerate} 
                className={cn(
                  "gap-2 h-9 px-4 font-medium transition-all",
                  canGenerate 
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-md" 
                    : "bg-secondary text-muted-foreground"
                )}
                disabled={!canGenerate}
              >
                <Code2 className="h-4 w-4" />
                <span>Generate</span>
                {canGenerate && (
                  <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-background/20 rounded font-mono">⌘G</kbd>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{canGenerate ? 'Generate configuration files' : `Fix ${errorCount} validation error${errorCount !== 1 ? 's' : ''} first`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
