"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Download, X, FileCode, FileText, Terminal, Sparkles, Ship, Settings2 } from "lucide-react"
import { generateOutput, type OutputFormat } from "@/lib/n8n-config"
import { useToast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { GeneratorOptions } from "@/lib/types"

interface OutputPanelProps {
  config: Record<string, string>
  format: OutputFormat
  onFormatChange: (format: OutputFormat) => void
  onClose: () => void
}

const formatInfo: Record<OutputFormat, { icon: React.ReactNode; description: string; filename: string; color: string }> = {
  "docker-compose": {
    icon: <FileCode className="h-4 w-4" />,
    description: "Complete Docker Compose file with all services",
    filename: "docker-compose.yml",
    color: "text-blue-400",
  },
  env: {
    icon: <FileText className="h-4 w-4" />,
    description: "Environment variables for any deployment method",
    filename: ".env",
    color: "text-emerald-400",
  },
  "docker-run": {
    icon: <Terminal className="h-4 w-4" />,
    description: "Single command to run n8n with Docker",
    filename: "run-n8n.sh",
    color: "text-amber-400",
  },
  kubernetes: {
    icon: <Ship className="h-4 w-4" />,
    description: "Kubernetes deployment manifest with ConfigMap",
    filename: "n8n-deployment.yaml",
    color: "text-purple-400",
  },
}

type ComposeVersion = '3.7' | '3.8' | '3.9'

export function OutputPanel({ config, format, onFormatChange, onClose }: OutputPanelProps) {
  const [copied, setCopied] = useState(false)
  const [composeVersion, setComposeVersion] = useState<ComposeVersion>('3.8')
  const [maskSecrets, setMaskSecrets] = useState(false)
  const { toast } = useToast()

  const generatorOptions: GeneratorOptions = {
    format,
    composeVersion,
    maskSecrets,
    includeComments: true,
    wizardVersion: '1.0.0',
  }

  const output = generateOutput(config, generatorOptions)
  const currentFormat = formatInfo[format]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = currentFormat.filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${currentFormat.filename}`)
  }

  const configuredCount = Object.keys(config).filter((k) => config[k] && config[k] !== "").length

  return (
    <div 
      className="w-full md:w-[560px] h-full border-l border-border bg-card/95 backdrop-blur-xl flex flex-col shadow-2xl"
      role="dialog"
      aria-label="Generated configuration output"
      aria-modal="false"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-foreground to-foreground/80">
              <Sparkles className="h-4 w-4 text-background" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold">Generated Output</h3>
              <p className="text-xs text-muted-foreground">{configuredCount} variables configured</p>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="h-8 w-8 rounded-lg hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close output panel (Escape)"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Tabs value={format} onValueChange={(v) => onFormatChange(v as OutputFormat)} className="flex-1 flex flex-col">
        {/* Format Tabs */}
        <div className="border-b border-border px-4 bg-secondary/30">
          <TabsList className="h-14 bg-transparent p-0 gap-1 w-full justify-start">
            {(Object.keys(formatInfo) as OutputFormat[]).map((f) => {
              const info = formatInfo[f]
              const isActive = format === f
              return (
                <TabsTrigger
                  key={f}
                  value={f}
                  className={cn(
                    "relative rounded-none border-b-2 border-transparent px-4 py-4 gap-2 transition-all",
                    "data-[state=active]:border-foreground data-[state=active]:bg-transparent",
                    "text-muted-foreground hover:text-foreground",
                    "data-[state=active]:text-foreground",
                  )}
                >
                  <span className={cn(isActive && info.color)}>{info.icon}</span>
                  <span className="text-xs font-medium">
                    {f === "docker-compose" ? "Compose" : f === "env" ? ".env" : f === "docker-run" ? "Run" : "K8s"}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Format Description */}
        <div className="px-6 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-secondary", currentFormat.color)}>
              {currentFormat.icon}
            </div>
            <div>
              <p className="text-sm font-medium">{currentFormat.filename}</p>
              <p className="text-xs text-muted-foreground">{currentFormat.description}</p>
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <div className="px-6 py-3 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Output Options</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {format === "docker-compose" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="compose-version" className="text-xs text-muted-foreground whitespace-nowrap">
                  Version:
                </Label>
                <Select
                  value={composeVersion}
                  onValueChange={(v) => setComposeVersion(v as ComposeVersion)}
                >
                  <SelectTrigger id="compose-version" className="h-8 w-20 text-xs bg-card" aria-label="Select Docker Compose version">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3.7">3.7</SelectItem>
                    <SelectItem value="3.8">3.8</SelectItem>
                    <SelectItem value="3.9">3.9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="mask-secrets"
                checked={maskSecrets}
                onCheckedChange={setMaskSecrets}
                aria-label="Mask sensitive values"
              />
              <Label htmlFor="mask-secrets" className="text-xs text-muted-foreground cursor-pointer">
                Mask secrets
              </Label>
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="flex-1 overflow-hidden flex flex-col bg-background/50">
          <TabsContent value={format} className="flex-1 m-0 overflow-auto scrollbar-thin">
            <div className="relative">
              {/* Line numbers gutter */}
              <pre className="p-6 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
                <code className="text-muted-foreground">{output}</code>
              </pre>
            </div>
          </TabsContent>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-border p-4 flex gap-3 bg-card">
          <Button
            onClick={handleCopy}
            variant="outline"
            className={cn(
              "flex-1 gap-2 h-10 font-medium transition-all duration-200",
              copied && "bg-success/10 border-success/50 text-success hover:bg-success/20",
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={handleDownload} className="flex-1 gap-2 h-10 font-medium">
            <Download className="h-4 w-4" />
            Download File
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
