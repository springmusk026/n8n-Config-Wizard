"use client"

import { useState } from "react"
import { ConfigWizard } from "@/components/config-wizard"
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Code2, 
  ArrowRight, 
  CheckCircle2,
  Github,
  ExternalLink,
  Layers,
  Terminal,
  FileCode,
  Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Terminal,
    title: "Docker Compose",
    description: "Production-ready compose files with best practices"
  },
  {
    icon: FileCode,
    title: "Environment Files",
    description: "Secure .env configurations for any deployment"
  },
  {
    icon: Server,
    title: "Kubernetes",
    description: "Generate K8s manifests for cloud-native deployments"
  },
  {
    icon: Shield,
    title: "Security First",
    description: "Built-in validation and secret masking"
  }
]

const benefits = [
  "80+ environment variables with documentation",
  "Pre-configured templates for common use cases",
  "Real-time validation and error checking",
  "Export and import configurations",
  "Compare changes with diff view",
  "Save custom templates locally"
]

export default function Home() {
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <main className="min-h-screen">
        <h1 className="sr-only">n8n Configuration Wizard - Generate Docker Compose and Environment Variables</h1>
        <ConfigWizard />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <h1 className="sr-only">n8n Configuration Wizard - Generate Docker Compose and Environment Variables</h1>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-foreground to-foreground/80 shadow-lg">
              <Sparkles className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-semibold tracking-tight">n8n Config Wizard</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://docs.n8n.io/hosting/configuration/environment-variables/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1"
            >
              Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://github.com/n8n-io/n8n"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
            </a>
            <Button onClick={() => setShowWizard(true)} size="sm" className="gap-2">
              Launch Wizard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/5 via-transparent to-transparent blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border text-sm text-muted-foreground mb-8 animate-fade-in">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Enterprise-grade configuration generator</span>
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in stagger-1">
            Configure n8n
            <br />
            <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              in minutes, not hours
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-2">
            Generate production-ready Docker Compose files, environment configurations, 
            and Kubernetes manifests for your self-hosted n8n workflow automation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
            <Button 
              onClick={() => setShowWizard(true)} 
              size="lg" 
              className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Code2 className="h-5 w-5" />
              Start Configuring
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a 
              href="https://docs.n8n.io/hosting/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-base">
                View Hosting Docs
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold tracking-tight mb-4">Everything you need</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Generate configurations for any deployment scenario with built-in best practices
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={cn(
                  "group relative p-6 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all duration-300",
                  "opacity-0 animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary mb-4 group-hover:bg-foreground/10 transition-colors">
                  <feature.icon className="h-6 w-6 text-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-6">
                Built for developers,
                <br />
                <span className="text-muted-foreground">loved by DevOps teams</span>
              </h3>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Stop copying environment variables from documentation. Our wizard provides 
                intelligent defaults, real-time validation, and export options that fit 
                your workflow.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li 
                    key={benefit}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      "opacity-0 animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-mono">docker-compose.yml</span>
                </div>
                <pre className="text-sm font-mono text-muted-foreground overflow-x-auto">
                  <code>{`version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_HOST=n8n.example.com
      - N8N_PROTOCOL=https
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-card/50 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 mb-8 shadow-lg">
            <Layers className="h-8 w-8 text-background" />
          </div>
          <h3 className="text-3xl font-bold tracking-tight mb-4">
            Ready to deploy n8n?
          </h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Choose from pre-configured templates or build your custom configuration 
            from scratch. Export to Docker Compose, .env, or Kubernetes.
          </p>
          <Button 
            onClick={() => setShowWizard(true)} 
            size="lg" 
            className="gap-2 h-12 px-8 text-base"
          >
            <Sparkles className="h-5 w-5" />
            Launch Configuration Wizard
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>n8n Config Wizard</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="https://n8n.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              n8n.io
            </a>
            <a 
              href="https://docs.n8n.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a 
              href="https://community.n8n.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Community
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
