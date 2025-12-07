"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { X, Check, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  description?: string
  type: ToastType
}

interface ToastContextValue {
  toasts: Toast[]
  toast: {
    success: (message: string, options?: { description?: string }) => void
    error: (message: string, options?: { description?: string }) => void
    info: (message: string, options?: { description?: string }) => void
    warning: (message: string, options?: { description?: string }) => void
  }
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const icons: Record<ToastType, ReactNode> = {
  success: <Check className="h-4 w-4" />,
  error: <X className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
}

const styles: Record<ToastType, string> = {
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType, options?: { description?: string }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type, description: options?.description }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (message: string, options?: { description?: string }) => addToast(message, "success", options),
    error: (message: string, options?: { description?: string }) => addToast(message, "error", options),
    info: (message: string, options?: { description?: string }) => addToast(message, "info", options),
    warning: (message: string, options?: { description?: string }) => addToast(message, "warning", options),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm",
              "animate-in slide-in-from-right-full fade-in duration-300",
              styles[t.type],
            )}
          >
            <span className="mt-0.5">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t.message}</p>
              {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
