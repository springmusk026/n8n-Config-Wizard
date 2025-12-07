"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle2, FileCode } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { detectFormat, parseAuto, type ImportFormat } from "@/lib/parser"

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onImport: (config: Record<string, string>) => void
}

interface ParseState {
  status: "idle" | "success" | "error"
  message?: string
  format?: ImportFormat
  variableCount?: number
}

const formatLabels: Record<ImportFormat, string> = {
  env: ".env file",
  "docker-compose": "Docker Compose",
  json: "JSON Export",
  unknown: "Unknown",
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste")
  const [content, setContent] = useState("")
  const [parseState, setParseState] = useState<ParseState>({ status: "idle" })
  const [parsedConfig, setParsedConfig] = useState<Record<string, string> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)


  const resetState = useCallback(() => {
    setContent("")
    setParseState({ status: "idle" })
    setParsedConfig(null)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const parseContent = useCallback((text: string) => {
    if (!text.trim()) {
      setParseState({ status: "idle" })
      setParsedConfig(null)
      return
    }

    const format = detectFormat(text)
    const result = parseAuto(text)

    if (result.success && result.data) {
      const variableCount = Object.keys(result.data).length
      setParseState({
        status: "success",
        format,
        message: `Detected ${formatLabels[format]} with ${variableCount} variable${variableCount !== 1 ? "s" : ""}`,
        variableCount,
      })
      setParsedConfig(result.data)
    } else {
      setParseState({
        status: "error",
        format,
        message: result.error || "Failed to parse configuration",
      })
      setParsedConfig(null)
    }
  }, [])

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value)
      parseContent(value)
    },
    [parseContent]
  )

  const handleFileRead = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        parseContent(text)
        setActiveTab("paste")
      }
      reader.onerror = () => {
        setParseState({
          status: "error",
          message: "Failed to read file",
        })
      }
      reader.readAsText(file)
    },
    [parseContent]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileRead(file)
      }
    },
    [handleFileRead]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileRead(file)
      }
    },
    [handleFileRead]
  )

  const handleImport = useCallback(() => {
    if (parsedConfig) {
      onImport(parsedConfig)
      handleClose()
    }
  }, [parsedConfig, onImport, handleClose])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Configuration</DialogTitle>
          <DialogDescription>
            Import an existing configuration from a .env file, docker-compose.yml, or JSON export.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "paste" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paste">
              <FileText className="h-4 w-4 mr-2" />
              Paste Content
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </TabsTrigger>
          </TabsList>


          <TabsContent value="paste" className="mt-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Paste your .env, docker-compose.yml, or JSON configuration here..."
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                aria-label="Configuration content"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  isDragging ? "bg-primary/10" : "bg-secondary"
                )}
              >
                <FileCode className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports .env, docker-compose.yml, and .json files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".env,.yml,.yaml,.json"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload configuration file"
              />
            </div>
          </TabsContent>
        </Tabs>

        {parseState.status !== "idle" && (
          <Alert variant={parseState.status === "error" ? "destructive" : "default"}>
            {parseState.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {parseState.status === "success" ? "Configuration Detected" : "Parse Error"}
            </AlertTitle>
            <AlertDescription>{parseState.message}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={parseState.status !== "success" || !parsedConfig}>
            Import Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
