"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { 
  Building, 
  Layers, 
  Shield, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Check, 
  Settings2, 
  Info, 
  Pencil, 
  Trash2, 
  User,
  Rocket,
  Star
} from "lucide-react"
import type { Template } from "@/lib/n8n-config"
import type { CustomTemplate } from "@/lib/types"
import { getAllCustomTemplates, deleteTemplate } from "@/lib/template-manager"
import { cn } from "@/lib/utils"

interface TemplateSelectorProps {
  templates: Template[]
  customTemplates?: CustomTemplate[]
  onSelect: (template: Template | CustomTemplate) => void
  onEditCustomTemplate?: (template: CustomTemplate) => void
  onDeleteCustomTemplate?: (templateId: string) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  layers: Layers,
  building: Building,
  sparkles: Sparkles,
  settings: Settings2,
  rocket: Rocket,
}

const templateStyles: Record<string, { 
  gradient: string
  iconBg: string
  badge: string
  badgeText: string
  ring: string
}> = {
  minimal: { 
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    badge: "bg-emerald-500/10 border-emerald-500/30",
    badgeText: "text-emerald-400",
    ring: "group-hover:ring-emerald-500/20"
  },
  production: { 
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
    badge: "bg-blue-500/10 border-blue-500/30",
    badgeText: "text-blue-400",
    ring: "group-hover:ring-blue-500/20"
  },
  "queue-mode": { 
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
    badge: "bg-purple-500/10 border-purple-500/30",
    badgeText: "text-purple-400",
    ring: "group-hover:ring-purple-500/20"
  },
  enterprise: { 
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
    badge: "bg-amber-500/10 border-amber-500/30",
    badgeText: "text-amber-400",
    ring: "group-hover:ring-amber-500/20"
  },
  "ai-enabled": { 
    gradient: "from-pink-500/10 via-pink-500/5 to-transparent",
    iconBg: "bg-pink-500/10 group-hover:bg-pink-500/20",
    badge: "bg-pink-500/10 border-pink-500/30",
    badgeText: "text-pink-400",
    ring: "group-hover:ring-pink-500/20"
  },
  custom: { 
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
    badge: "bg-cyan-500/10 border-cyan-500/30",
    badgeText: "text-cyan-400",
    ring: "group-hover:ring-cyan-500/20"
  },
}

const complexityLabels: Record<string, { label: string; description: string }> = {
  minimal: { label: "Beginner", description: "Perfect for getting started" },
  production: { label: "Intermediate", description: "Production-ready defaults" },
  "queue-mode": { label: "Advanced", description: "Scalable architecture" },
  enterprise: { label: "Expert", description: "Full-featured setup" },
  "ai-enabled": { label: "Specialized", description: "AI workflow building" },
  custom: { label: "Full Control", description: "Configure everything" },
}

const customTemplate: Template = {
  id: "custom",
  name: "Custom Configuration",
  description: "Start from scratch with access to all environment variables. Full control over every setting.",
  icon: "settings",
  categories: [
    "deployment", "database", "executions", "queue", "security", "logs", 
    "smtp", "storage", "ai", "source-control", "timezone", "endpoints", "nodes",
  ],
  presets: {},
}

function isCustomTemplate(template: Template | CustomTemplate): template is CustomTemplate {
  return 'isCustom' in template && template.isCustom === true
}

export function TemplateSelector({ 
  templates, 
  customTemplates: customTemplatesProp,
  onSelect, 
  onEditCustomTemplate,
  onDeleteCustomTemplate,
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [internalCustomTemplates, setInternalCustomTemplates] = useState<CustomTemplate[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const customTemplates = customTemplatesProp ?? internalCustomTemplates

  useEffect(() => {
    if (customTemplatesProp === undefined) {
      try {
        const loaded = getAllCustomTemplates()
        setInternalCustomTemplates(loaded)
      } catch (error) {
        console.error('Failed to load custom templates:', error)
      }
    }
  }, [customTemplatesProp])

  const handleDeleteTemplate = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation()
    if (deleteConfirmId === templateId) {
      try {
        if (onDeleteCustomTemplate) {
          onDeleteCustomTemplate(templateId)
        } else {
          deleteTemplate(templateId)
          setInternalCustomTemplates(prev => prev.filter(t => t.id !== templateId))
        }
        setDeleteConfirmId(null)
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    } else {
      setDeleteConfirmId(templateId)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleEditTemplate = (e: React.MouseEvent, template: CustomTemplate) => {
    e.stopPropagation()
    onEditCustomTemplate?.(template)
  }

  const allTemplates: (Template | CustomTemplate)[] = [...templates, ...customTemplates, customTemplate]

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 sm:py-12 overflow-auto">
      <div className="max-w-6xl w-full space-y-8 sm:space-y-12">
        {/* Header */}
        <header className="text-center space-y-3 sm:space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary/80 border border-border text-xs sm:text-sm text-muted-foreground">
            <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span>Choose your deployment template</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Configure your n8n instance
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Select a template based on your deployment needs. Each comes with battle-tested 
            defaults that you can fully customize.
          </p>
        </header>

        {/* User's Custom Templates Section */}
        {customTemplates.length > 0 && (
          <section className="space-y-3 sm:space-y-4 animate-fade-in stagger-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Your Templates</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {customTemplates.map((template, index) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  index={index}
                  isHovered={hoveredTemplate === template.id}
                  onHover={setHoveredTemplate}
                  onSelect={onSelect}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  deleteConfirmId={deleteConfirmId}
                  isUserCustom
                />
              ))}
            </div>
          </section>
        )}

        {/* Built-in Templates */}
        <section className="space-y-3 sm:space-y-4 animate-fade-in stagger-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Built-in Templates</span>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={index}
                isHovered={hoveredTemplate === template.id}
                onHover={setHoveredTemplate}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>

        {/* Custom Configuration Card */}
        <section className="animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
              <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Advanced</span>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button
            onClick={() => onSelect(customTemplate)}
            onMouseEnter={() => setHoveredTemplate('custom')}
            onMouseLeave={() => setHoveredTemplate(null)}
            className={cn(
              "group relative w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-border bg-card/50 p-4 sm:p-6 text-left transition-all duration-300",
              "hover:border-cyan-500/50 hover:bg-card hover:shadow-lg hover:shadow-cyan-500/5",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            <div className={cn(
              "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300",
              "bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:scale-110"
            )}>
              <Settings2 className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <h3 className="font-semibold text-base sm:text-lg">{customTemplate.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-medium">
                  80+ Variables
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{customTemplate.description}</p>
            </div>
            <ArrowRight className={cn(
              "hidden sm:block h-5 w-5 text-muted-foreground transition-all duration-300",
              hoveredTemplate === 'custom' ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            )} />
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground space-y-2 pb-8 animate-fade-in stagger-4">
          <p>All configurations can be fully customized after selecting a template</p>
          <p className="text-xs text-muted-foreground/60">
            Need help? Check the{" "}
            <a
              href="https://docs.n8n.io/hosting/configuration/environment-variables/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              official n8n documentation
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

interface TemplateCardProps {
  template: Template | CustomTemplate
  index: number
  isHovered: boolean
  onHover: (id: string | null) => void
  onSelect: (template: Template | CustomTemplate) => void
  onEdit?: (e: React.MouseEvent, template: CustomTemplate) => void
  onDelete?: (e: React.MouseEvent, templateId: string) => void
  deleteConfirmId?: string | null
  isUserCustom?: boolean
}

function TemplateCard({
  template,
  index,
  isHovered,
  onHover,
  onSelect,
  onEdit,
  onDelete,
  deleteConfirmId,
  isUserCustom
}: TemplateCardProps) {
  const Icon = iconMap[template.icon] || Zap
  const styles = isUserCustom 
    ? {
        gradient: "from-violet-500/10 via-violet-500/5 to-transparent",
        iconBg: "bg-violet-500/10 group-hover:bg-violet-500/20",
        badge: "bg-violet-500/10 border-violet-500/30",
        badgeText: "text-violet-400",
        ring: "group-hover:ring-violet-500/20"
      }
    : templateStyles[template.id] || templateStyles.minimal
  const complexity = complexityLabels[template.id]

  return (
    <button
      onClick={() => onSelect(template)}
      onMouseEnter={() => onHover(template.id)}
      onMouseLeave={() => {
        onHover(null)
        if (deleteConfirmId === template.id) {
          // Keep delete confirm visible briefly
        }
      }}
      className={cn(
        "group relative flex flex-col items-start gap-3 sm:gap-4 rounded-lg sm:rounded-xl border bg-card p-4 sm:p-5 text-left transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/10 sm:hover:-translate-y-1",
        "ring-1 ring-transparent",
        styles.ring,
        "opacity-0 animate-scale-in",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300",
        styles.gradient,
        isHovered && "opacity-100"
      )} />

      {/* Header */}
      <div className="relative flex w-full items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300",
          styles.iconBg,
          "group-hover:scale-110"
        )}>
          <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", styles.badgeText)} />
        </div>
        
        {isUserCustom && onEdit && onDelete ? (
          <div className={cn(
            "flex items-center gap-1 transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={(e) => onEdit(e, template as CustomTemplate)}
              className="p-1.5 rounded-md hover:bg-violet-500/20 text-violet-400 transition-colors"
              title="Edit template"
              aria-label={`Edit ${template.name} template`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => onDelete(e, template.id)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                deleteConfirmId === template.id
                  ? "bg-red-500/20 text-red-400"
                  : "hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
              )}
              title={deleteConfirmId === template.id ? "Click again to confirm" : "Delete template"}
              aria-label={deleteConfirmId === template.id ? `Confirm delete ${template.name}` : `Delete ${template.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <ArrowRight className={cn(
            "h-5 w-5 text-muted-foreground transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          )} />
        )}
      </div>

      {/* Content */}
      <div className="relative space-y-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-base">{template.name}</h3>
          {isUserCustom ? (
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", styles.badge, styles.badgeText)}>
              Custom
            </span>
          ) : complexity && (
            <span className={cn("text-xs font-medium", styles.badgeText)}>
              {complexity.label}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Categories */}
      <div className="relative flex flex-wrap gap-1.5 w-full">
        {template.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className={cn(
              "inline-flex items-center rounded-md px-2 py-1 text-xs transition-colors",
              "bg-secondary/60 text-muted-foreground",
              isHovered && "bg-secondary"
            )}
          >
            {cat}
          </span>
        ))}
        {template.categories.length > 3 && (
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs bg-secondary/60 text-muted-foreground">
            +{template.categories.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5" />
        <span>{Object.keys(template.presets).length} pre-configured variables</span>
      </div>
    </button>
  )
}
