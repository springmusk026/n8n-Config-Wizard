"use client"

import { useMemo } from "react"
import { RotateCcw, Plus, Pencil, Minus, CheckCircle2, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { computeDiff } from "@/lib/diff"
import { CATEGORY_METADATA } from "@/lib/constants"
import type { DiffEntry, DiffType } from "@/lib/types"

interface DiffViewProps {
  config: Record<string, string>
  defaults: Record<string, string>
  onRevert: (field: string) => void
  onRevertAll: () => void
}

const diffTypeConfig: Record<
  DiffType,
  {
    icon: typeof Plus
    label: string
    bgColor: string
    textColor: string
    borderColor: string
    iconBg: string
  }
> = {
  added: {
    icon: Plus,
    label: "Added",
    bgColor: "bg-emerald-500/5",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10",
  },
  modified: {
    icon: Pencil,
    label: "Modified",
    bgColor: "bg-amber-500/5",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    iconBg: "bg-amber-500/10",
  },
  removed: {
    icon: Minus,
    label: "Removed",
    bgColor: "bg-red-500/5",
    textColor: "text-red-500",
    borderColor: "border-red-500/20 hover:border-red-500/40",
    iconBg: "bg-red-500/10",
  },
}

function DiffEntryRow({
  entry,
  onRevert,
}: {
  entry: DiffEntry
  onRevert: (field: string) => void
}) {
  const config = diffTypeConfig[entry.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
        config.bgColor,
        config.borderColor,
        "hover:shadow-md hover:shadow-black/5"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          config.iconBg
        )}
      >
        <Icon className={cn("h-5 w-5", config.textColor)} />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="font-mono text-sm font-semibold">{entry.field}</code>
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5 font-medium", config.textColor, config.borderColor)}
          >
            {config.label}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          {entry.type !== "added" && (
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground shrink-0 w-16 text-xs font-medium">Default</span>
              <code className="font-mono text-xs bg-secondary/80 px-2.5 py-1 rounded-md break-all text-muted-foreground">
                {entry.defaultValue || "(empty)"}
              </code>
            </div>
          )}
          {entry.type !== "removed" && (
            <div className="flex items-start gap-3">
              <span className={cn("shrink-0 w-16 text-xs font-medium", config.textColor)}>Current</span>
              <code className={cn(
                "font-mono text-xs px-2.5 py-1 rounded-md break-all font-medium",
                config.iconBg,
                config.textColor
              )}>
                {entry.currentValue || "(empty)"}
              </code>
            </div>
          )}
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRevert(entry.field)}
              className="shrink-0 h-9 w-9 opacity-0 group-hover:opacity-100 transition-all hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Revert to default</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function CategoryHeader({
  categoryId,
  entryCount,
}: {
  categoryId: string
  entryCount: number
}) {
  const metadata = CATEGORY_METADATA[categoryId] || {
    name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
    icon: "folder",
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-border" />
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {metadata.name}
        </h3>
        <Badge variant="secondary" className="text-[10px] h-5 font-medium">
          {entryCount}
        </Badge>
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10 mb-6">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Changes</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Your configuration matches the template defaults. Make changes to see them here.
      </p>
    </div>
  )
}

export function DiffView({
  config,
  defaults,
  onRevert,
  onRevertAll,
}: DiffViewProps) {
  const diffResult = useMemo(
    () => computeDiff(config, defaults),
    [config, defaults]
  )

  const groupedEntries = useMemo(() => {
    const groups: Record<string, DiffEntry[]> = {}
    
    for (const entry of diffResult.entries) {
      const category = entry.category || "unknown"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(entry)
    }
    
    return groups
  }, [diffResult.entries])

  const sortedCategories = useMemo(
    () => Object.keys(groupedEntries).sort(),
    [groupedEntries]
  )

  const changeSummary = useMemo(() => {
    const summary = { added: 0, modified: 0, removed: 0 }
    for (const entry of diffResult.entries) {
      summary[entry.type]++
    }
    return summary
  }, [diffResult.entries])

  if (!diffResult.hasChanges) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Changes from Template</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">
              {diffResult.totalChanges} change{diffResult.totalChanges !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground/30">•</span>
            {changeSummary.added > 0 && (
              <span className="text-emerald-500 font-medium">+{changeSummary.added}</span>
            )}
            {changeSummary.modified > 0 && (
              <span className="text-amber-500 font-medium">~{changeSummary.modified}</span>
            )}
            {changeSummary.removed > 0 && (
              <span className="text-red-500 font-medium">-{changeSummary.removed}</span>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRevertAll}
          className="gap-2 h-9"
        >
          <RotateCcw className="h-4 w-4" />
          Revert All
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {sortedCategories.map((categoryId) => (
            <div key={categoryId} className="space-y-3">
              <CategoryHeader
                categoryId={categoryId}
                entryCount={groupedEntries[categoryId].length}
              />
              <div className="space-y-3">
                {groupedEntries[categoryId].map((entry) => (
                  <DiffEntryRow
                    key={entry.field}
                    entry={entry}
                    onRevert={onRevert}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
