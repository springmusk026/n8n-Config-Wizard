"use client"

import { useState, useCallback } from "react"
import { Save, FileText, Zap, Shield, Layers, Building, Sparkles, Settings2, Star, Bookmark, Heart, Folder, Box, Package, Code, Database, Server, Cloud, Lock, Key, Globe, Terminal, Cpu, HardDrive, Network, Workflow } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { saveTemplate, TemplateManagerError } from "@/lib/template-manager"
import { useToast } from "@/components/ui/use-toast"

interface TemplateSaveModalProps {
  open: boolean
  onClose: () => void
  onSave: (templateId: string) => void
  currentConfig: Record<string, string>
  categories?: string[]
}

// Available icons for template selection
const availableIcons = [
  { id: "zap", icon: Zap, label: "Zap" },
  { id: "shield", icon: Shield, label: "Shield" },
  { id: "layers", icon: Layers, label: "Layers" },
  { id: "building", icon: Building, label: "Building" },
  { id: "sparkles", icon: Sparkles, label: "Sparkles" },
  { id: "settings", icon: Settings2, label: "Settings" },
  { id: "star", icon: Star, label: "Star" },
  { id: "bookmark", icon: Bookmark, label: "Bookmark" },
  { id: "heart", icon: Heart, label: "Heart" },
  { id: "folder", icon: Folder, label: "Folder" },
  { id: "box", icon: Box, label: "Box" },
  { id: "package", icon: Package, label: "Package" },
  { id: "code", icon: Code, label: "Code" },
  { id: "database", icon: Database, label: "Database" },
  { id: "server", icon: Server, label: "Server" },
  { id: "cloud", icon: Cloud, label: "Cloud" },
  { id: "lock", icon: Lock, label: "Lock" },
  { id: "key", icon: Key, label: "Key" },
  { id: "globe", icon: Globe, label: "Globe" },
  { id: "terminal", icon: Terminal, label: "Terminal" },
  { id: "cpu", icon: Cpu, label: "CPU" },
  { id: "hard-drive", icon: HardDrive, label: "Hard Drive" },
  { id: "network", icon: Network, label: "Network" },
  { id: "workflow", icon: Workflow, label: "Workflow" },
] as const

type IconId = typeof availableIcons[number]["id"]


interface FormState {
  name: string
  description: string
  icon: IconId
}

interface FormErrors {
  name?: string
  description?: string
}

export function TemplateSaveModal({
  open,
  onClose,
  onSave,
  currentConfig,
  categories = [],
}: TemplateSaveModalProps) {
  const { toast } = useToast()
  const [formState, setFormState] = useState<FormState>({
    name: "",
    description: "",
    icon: "zap",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const resetState = useCallback(() => {
    setFormState({ name: "", description: "", icon: "zap" })
    setErrors({})
    setIsSaving(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formState.name.trim()) {
      newErrors.name = "Template name is required"
    } else if (formState.name.length > 100) {
      newErrors.name = "Template name must be 100 characters or less"
    }

    if (formState.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formState.name, formState.description])

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)

    try {
      const template = saveTemplate({
        name: formState.name.trim(),
        description: formState.description.trim(),
        icon: formState.icon,
        categories: categories,
        presets: currentConfig,
      })

      toast({
        title: "Template saved",
        description: `"${template.name}" has been saved to your custom templates.`,
      })

      onSave(template.id)
      handleClose()
    } catch (error) {
      if (error instanceof TemplateManagerError) {
        if (error.code === "DUPLICATE_NAME") {
          setErrors({ name: error.message })
        } else {
          toast({
            title: "Failed to save template",
            description: error.message,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Failed to save template",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }, [validateForm, formState, categories, currentConfig, toast, onSave, handleClose])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, name: e.target.value }))
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }))
    }
  }, [errors.name])

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, description: e.target.value }))
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }))
    }
  }, [errors.description])

  const handleIconSelect = useCallback((iconId: IconId) => {
    setFormState(prev => ({ ...prev, icon: iconId }))
  }, [])

  const configuredCount = Object.keys(currentConfig).filter(k => currentConfig[k] !== "").length

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save your current configuration as a custom template for future use.
            {configuredCount > 0 && (
              <span className="block mt-1 text-xs">
                {configuredCount} configured variable{configuredCount !== 1 ? "s" : ""} will be saved.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="My Custom Template"
              value={formState.name}
              onChange={handleNameChange}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              maxLength={100}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="A brief description of this template..."
              value={formState.description}
              onChange={handleDescriptionChange}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              maxLength={500}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.description ? (
                <p id="description-error" className="text-destructive">
                  {errors.description}
                </p>
              ) : (
                <span>Optional</span>
              )}
              <span>{formState.description.length}/500</span>
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-1.5 p-2 rounded-md border bg-secondary/30">
              {availableIcons.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleIconSelect(id)}
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md transition-all",
                    "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                    formState.icon === id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title={label}
                  aria-label={`Select ${label} icon`}
                  aria-pressed={formState.icon === id}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formState.name.trim()}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
