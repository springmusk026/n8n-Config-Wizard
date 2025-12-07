export interface EnvVariable {
  name: string
  type: string
  default: string
  description: string
  required?: boolean
  fileSupport?: boolean
}

export interface ConfigCategory {
  id: string
  name: string
  description: string
  icon: string
  variables: EnvVariable[]
}

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  categories: string[]
  presets: Record<string, string>
}

export const templates: Template[] = [
  {
    id: "minimal",
    name: "Minimal Setup",
    description: "Basic n8n instance with SQLite database. Perfect for personal use or testing.",
    icon: "zap",
    categories: ["deployment"],
    presets: {
      N8N_HOST: "localhost",
      N8N_PORT: "5678",
      N8N_PROTOCOL: "http",
    },
  },
  {
    id: "production",
    name: "Production Ready",
    description: "Full production setup with PostgreSQL, security hardening, and proper logging.",
    icon: "shield",
    categories: ["deployment", "database", "security", "logs"],
    presets: {
      DB_TYPE: "postgresdb",
      N8N_PROTOCOL: "https",
      N8N_SECURE_COOKIE: "true",
      N8N_LOG_LEVEL: "warn",
      EXECUTIONS_DATA_PRUNE: "true",
      N8N_DIAGNOSTICS_ENABLED: "false",
    },
  },
  {
    id: "queue-mode",
    name: "Queue Mode (Scalable)",
    description: "Distributed setup with Redis queue for high-volume workflow execution.",
    icon: "layers",
    categories: ["deployment", "database", "queue", "executions"],
    presets: {
      EXECUTIONS_MODE: "queue",
      QUEUE_BULL_REDIS_HOST: "redis",
      QUEUE_BULL_REDIS_PORT: "6379",
      DB_TYPE: "postgresdb",
      N8N_CONCURRENCY_PRODUCTION_LIMIT: "10",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Full-featured setup with S3 storage, SMTP, source control, and multi-main support.",
    icon: "building",
    categories: ["deployment", "database", "security", "logs", "queue", "smtp", "storage", "source-control"],
    presets: {
      DB_TYPE: "postgresdb",
      EXECUTIONS_MODE: "queue",
      N8N_DEFAULT_BINARY_DATA_MODE: "s3",
      N8N_EMAIL_MODE: "smtp",
      N8N_MULTI_MAIN_SETUP_ENABLED: "true",
      N8N_MFA_ENABLED: "true",
    },
  },
  {
    id: "ai-enabled",
    name: "AI Assistant Enabled",
    description: "Setup with AI assistant configured for intelligent workflow building.",
    icon: "sparkles",
    categories: ["deployment", "ai"],
    presets: {
      N8N_AI_ASSISTANT_BASE_URL: "https://ai-assistant.n8n.io",
      N8N_DIAGNOSTICS_ENABLED: "true",
    },
  },
]

export const categories: ConfigCategory[] = [
  {
    id: "deployment",
    name: "Deployment",
    description: "Core deployment settings including URLs, ports, and SSL configuration",
    icon: "globe",
    variables: [
      { name: "N8N_HOST", type: "String", default: "localhost", description: "Host name n8n runs on", required: true },
      { name: "N8N_PORT", type: "Number", default: "5678", description: "The HTTP port n8n runs on", required: true },
      {
        name: "N8N_PROTOCOL",
        type: "Enum",
        default: "http",
        description: "The protocol used to reach n8n (http or https)",
      },
      {
        name: "N8N_EDITOR_BASE_URL",
        type: "String",
        default: "",
        description: "Public URL where users can access the editor",
      },
      { name: "N8N_PATH", type: "String", default: "/", description: "The path n8n deploys to" },
      { name: "N8N_LISTEN_ADDRESS", type: "String", default: "::", description: "The IP address n8n should listen on" },
      {
        name: "N8N_SSL_KEY",
        type: "String",
        default: "",
        description: "The SSL key for HTTPS protocol",
        fileSupport: true,
      },
      {
        name: "N8N_SSL_CERT",
        type: "String",
        default: "",
        description: "The SSL certificate for HTTPS protocol",
        fileSupport: true,
      },
      {
        name: "N8N_ENCRYPTION_KEY",
        type: "String",
        default: "",
        description: "Custom key to encrypt credentials in the database",
        fileSupport: true,
      },
      {
        name: "N8N_USER_FOLDER",
        type: "String",
        default: "user-folder",
        description: "Path where n8n creates the .n8n folder",
      },
      { name: "N8N_DISABLE_UI", type: "Boolean", default: "false", description: "Set to true to disable the UI" },
      {
        name: "N8N_TEMPLATES_ENABLED",
        type: "Boolean",
        default: "false",
        description: "Enable or disable workflow templates",
      },
      {
        name: "N8N_GRACEFUL_SHUTDOWN_TIMEOUT",
        type: "Number",
        default: "30",
        description: "Seconds to wait for components to shut down",
      },
      {
        name: "N8N_PROXY_HOPS",
        type: "Number",
        default: "0",
        description: "Number of reverse-proxies n8n is running behind",
      },
    ],
  },
  {
    id: "database",
    name: "Database",
    description: "Database connection settings for SQLite or PostgreSQL",
    icon: "database",
    variables: [
      {
        name: "DB_TYPE",
        type: "Enum",
        default: "sqlite",
        description: "Database type: sqlite or postgresdb",
        required: true,
      },
      { name: "DB_TABLE_PREFIX", type: "String", default: "", description: "Prefix for table names" },
      {
        name: "DB_POSTGRESDB_HOST",
        type: "String",
        default: "localhost",
        description: "PostgreSQL host",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_PORT",
        type: "Number",
        default: "5432",
        description: "PostgreSQL port",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_DATABASE",
        type: "String",
        default: "n8n",
        description: "PostgreSQL database name",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_USER",
        type: "String",
        default: "postgres",
        description: "PostgreSQL user",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_PASSWORD",
        type: "String",
        default: "",
        description: "PostgreSQL password",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_POOL_SIZE",
        type: "Number",
        default: "2",
        description: "Number of parallel Postgres connections",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_SCHEMA",
        type: "String",
        default: "public",
        description: "PostgreSQL schema",
        fileSupport: true,
      },
      {
        name: "DB_POSTGRESDB_SSL_ENABLED",
        type: "Boolean",
        default: "false",
        description: "Enable SSL for PostgreSQL",
        fileSupport: true,
      },
      {
        name: "DB_SQLITE_POOL_SIZE",
        type: "Number",
        default: "0",
        description: "SQLite pool size (0 for rollback mode, >0 for WAL)",
      },
    ],
  },
  {
    id: "executions",
    name: "Executions",
    description: "Workflow execution settings, timeouts, and data retention",
    icon: "play",
    variables: [
      { name: "EXECUTIONS_MODE", type: "Enum", default: "regular", description: "Execution mode: regular or queue" },
      {
        name: "EXECUTIONS_TIMEOUT",
        type: "Number",
        default: "-1",
        description: "Default timeout in seconds (-1 to disable)",
      },
      {
        name: "EXECUTIONS_TIMEOUT_MAX",
        type: "Number",
        default: "3600",
        description: "Maximum execution time users can set",
      },
      {
        name: "EXECUTIONS_DATA_SAVE_ON_ERROR",
        type: "Enum",
        default: "all",
        description: "Save execution data on error: all or none",
      },
      {
        name: "EXECUTIONS_DATA_SAVE_ON_SUCCESS",
        type: "Enum",
        default: "all",
        description: "Save execution data on success: all or none",
      },
      {
        name: "EXECUTIONS_DATA_PRUNE",
        type: "Boolean",
        default: "true",
        description: "Delete old execution data on rolling basis",
      },
      {
        name: "EXECUTIONS_DATA_MAX_AGE",
        type: "Number",
        default: "336",
        description: "Execution age in hours before deletion",
      },
      {
        name: "EXECUTIONS_DATA_PRUNE_MAX_COUNT",
        type: "Number",
        default: "10000",
        description: "Max executions to keep (0 = no limit)",
      },
      {
        name: "N8N_CONCURRENCY_PRODUCTION_LIMIT",
        type: "Number",
        default: "-1",
        description: "Max concurrent production executions",
      },
    ],
  },
  {
    id: "queue",
    name: "Queue Mode",
    description: "Redis queue configuration for scalable execution",
    icon: "layers",
    variables: [
      { name: "QUEUE_BULL_REDIS_HOST", type: "String", default: "localhost", description: "Redis host" },
      { name: "QUEUE_BULL_REDIS_PORT", type: "Number", default: "6379", description: "Redis port" },
      { name: "QUEUE_BULL_REDIS_DB", type: "Number", default: "0", description: "Redis database number" },
      { name: "QUEUE_BULL_REDIS_USERNAME", type: "String", default: "", description: "Redis username (v6+)" },
      { name: "QUEUE_BULL_REDIS_PASSWORD", type: "String", default: "", description: "Redis password" },
      { name: "QUEUE_BULL_REDIS_TLS", type: "Boolean", default: "false", description: "Enable TLS for Redis" },
      { name: "QUEUE_BULL_PREFIX", type: "String", default: "", description: "Prefix for queue keys" },
      { name: "QUEUE_HEALTH_CHECK_ACTIVE", type: "Boolean", default: "false", description: "Enable health checks" },
      { name: "QUEUE_HEALTH_CHECK_PORT", type: "Number", default: "5678", description: "Health check port" },
      {
        name: "N8N_MULTI_MAIN_SETUP_ENABLED",
        type: "Boolean",
        default: "false",
        description: "Enable multi-main setup (license required)",
      },
      {
        name: "OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS",
        type: "Boolean",
        default: "false",
        description: "Run manual executions on workers",
      },
    ],
  },
  {
    id: "security",
    name: "Security",
    description: "Security settings, cookies, and access controls",
    icon: "shield",
    variables: [
      { name: "N8N_SECURE_COOKIE", type: "Boolean", default: "true", description: "Only send cookies over HTTPS" },
      {
        name: "N8N_SAMESITE_COOKIE",
        type: "Enum",
        default: "lax",
        description: "Cross-site cookie behavior: strict, lax, none",
      },
      {
        name: "N8N_BLOCK_ENV_ACCESS_IN_NODE",
        type: "Boolean",
        default: "false",
        description: "Block env access in Code node",
      },
      {
        name: "N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES",
        type: "Boolean",
        default: "true",
        description: "Block access to .n8n directory",
      },
      {
        name: "N8N_RESTRICT_FILE_ACCESS_TO",
        type: "String",
        default: "",
        description: "Limit file access to these directories",
      },
      { name: "N8N_MFA_ENABLED", type: "Boolean", default: "true", description: "Enable two-factor authentication" },
      { name: "N8N_USER_MANAGEMENT_JWT_SECRET", type: "String", default: "", description: "Custom JWT secret" },
      {
        name: "N8N_USER_MANAGEMENT_JWT_DURATION_HOURS",
        type: "Number",
        default: "168",
        description: "JWT expiration in hours",
      },
    ],
  },
  {
    id: "logs",
    name: "Logging",
    description: "Log output configuration and debugging",
    icon: "file-text",
    variables: [
      { name: "N8N_LOG_LEVEL", type: "Enum", default: "info", description: "Log level: info, warn, error, debug" },
      { name: "N8N_LOG_OUTPUT", type: "Enum", default: "console", description: "Log output: console or file" },
      { name: "N8N_LOG_FORMAT", type: "Enum", default: "text", description: "Log format: text or json" },
      { name: "N8N_LOG_FILE_LOCATION", type: "String", default: "", description: "Log file location (if output=file)" },
      { name: "N8N_LOG_FILE_COUNT_MAX", type: "Number", default: "100", description: "Max number of log files" },
      { name: "N8N_LOG_FILE_SIZE_MAX", type: "Number", default: "16", description: "Max log file size in MB" },
      { name: "DB_LOGGING_ENABLED", type: "Boolean", default: "false", description: "Enable database logging" },
    ],
  },
  {
    id: "smtp",
    name: "Email / SMTP",
    description: "Email configuration for user invites and notifications",
    icon: "mail",
    variables: [
      { name: "N8N_EMAIL_MODE", type: "String", default: "smtp", description: "Email mode (smtp)" },
      { name: "N8N_SMTP_HOST", type: "String", default: "", description: "SMTP server hostname" },
      { name: "N8N_SMTP_PORT", type: "Number", default: "", description: "SMTP server port" },
      { name: "N8N_SMTP_USER", type: "String", default: "", description: "SMTP username" },
      { name: "N8N_SMTP_PASS", type: "String", default: "", description: "SMTP password" },
      { name: "N8N_SMTP_SENDER", type: "String", default: "", description: "Sender email address" },
      { name: "N8N_SMTP_SSL", type: "Boolean", default: "true", description: "Use SSL for SMTP" },
      { name: "N8N_SMTP_STARTTLS", type: "Boolean", default: "true", description: "Use STARTTLS" },
    ],
  },
  {
    id: "storage",
    name: "External Storage",
    description: "S3-compatible storage for binary data",
    icon: "hard-drive",
    variables: [
      {
        name: "N8N_DEFAULT_BINARY_DATA_MODE",
        type: "Enum",
        default: "default",
        description: "Binary data mode: default, filesystem, s3, database",
      },
      {
        name: "N8N_BINARY_DATA_STORAGE_PATH",
        type: "String",
        default: "",
        description: "Path for filesystem binary storage",
      },
      {
        name: "N8N_EXTERNAL_STORAGE_S3_HOST",
        type: "String",
        default: "",
        description: "S3 host (e.g., s3.us-east-1.amazonaws.com)",
      },
      { name: "N8N_EXTERNAL_STORAGE_S3_BUCKET_NAME", type: "String", default: "", description: "S3 bucket name" },
      { name: "N8N_EXTERNAL_STORAGE_S3_BUCKET_REGION", type: "String", default: "", description: "S3 bucket region" },
      { name: "N8N_EXTERNAL_STORAGE_S3_ACCESS_KEY", type: "String", default: "", description: "S3 access key" },
      { name: "N8N_EXTERNAL_STORAGE_S3_ACCESS_SECRET", type: "String", default: "", description: "S3 access secret" },
    ],
  },
  {
    id: "ai",
    name: "AI Assistant",
    description: "AI assistant configuration for intelligent workflow building",
    icon: "sparkles",
    variables: [
      {
        name: "N8N_AI_ASSISTANT_BASE_URL",
        type: "String",
        default: "",
        description: "AI assistant service URL (https://ai-assistant.n8n.io)",
      },
      {
        name: "N8N_DIAGNOSTICS_ENABLED",
        type: "Boolean",
        default: "true",
        description: "Enable telemetry (required for Ask AI)",
      },
    ],
  },
  {
    id: "source-control",
    name: "Source Control",
    description: "Git-based source control for environments",
    icon: "git-branch",
    variables: [
      {
        name: "N8N_SOURCECONTROL_DEFAULT_SSH_KEY_TYPE",
        type: "Enum",
        default: "ed25519",
        description: "SSH key type: ed25519 or rsa",
      },
    ],
  },
  {
    id: "timezone",
    name: "Timezone & Locale",
    description: "Timezone and language settings",
    icon: "clock",
    variables: [
      {
        name: "GENERIC_TIMEZONE",
        type: "String",
        default: "America/New_York",
        description: "Instance timezone (important for Cron)",
      },
      { name: "N8N_DEFAULT_LOCALE", type: "String", default: "en", description: "Default locale identifier" },
    ],
  },
  {
    id: "endpoints",
    name: "Endpoints & Metrics",
    description: "API endpoints, webhooks, and Prometheus metrics",
    icon: "activity",
    variables: [
      { name: "N8N_PAYLOAD_SIZE_MAX", type: "Number", default: "16", description: "Maximum payload size in MiB" },
      { name: "N8N_METRICS", type: "Boolean", default: "false", description: "Enable /metrics endpoint" },
      { name: "N8N_METRICS_PREFIX", type: "String", default: "n8n_", description: "Prefix for metric names" },
      { name: "N8N_ENDPOINT_WEBHOOK", type: "String", default: "webhook", description: "Webhook endpoint path" },
      {
        name: "N8N_ENDPOINT_WEBHOOK_TEST",
        type: "String",
        default: "webhook-test",
        description: "Test webhook endpoint path",
      },
      { name: "WEBHOOK_URL", type: "String", default: "", description: "Manual webhook URL (for reverse proxy)" },
      { name: "N8N_PUBLIC_API_DISABLED", type: "Boolean", default: "false", description: "Disable the public API" },
    ],
  },
  {
    id: "nodes",
    name: "Nodes & Community",
    description: "Node loading, community packages, and Code node settings",
    icon: "puzzle",
    variables: [
      {
        name: "N8N_COMMUNITY_PACKAGES_ENABLED",
        type: "Boolean",
        default: "true",
        description: "Enable community packages",
      },
      { name: "N8N_PYTHON_ENABLED", type: "Boolean", default: "true", description: "Enable Python in Code node" },
      {
        name: "NODE_FUNCTION_ALLOW_BUILTIN",
        type: "String",
        default: "",
        description: "Allow built-in modules in Code node",
      },
      {
        name: "NODE_FUNCTION_ALLOW_EXTERNAL",
        type: "String",
        default: "",
        description: "Allow external modules in Code node",
      },
      { name: "NODES_EXCLUDE", type: "String", default: "", description: "Nodes to exclude (JSON array)" },
      { name: "N8N_CUSTOM_EXTENSIONS", type: "String", default: "", description: "Path to custom nodes directory" },
    ],
  },
]

import type { GeneratorOptions, OutputFormat } from "./types"

// Re-export OutputFormat for backward compatibility
export type { OutputFormat }

// Sensitive field patterns for secret masking
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /credential/i,
  /pass$/i,
]

const SECRET_PLACEHOLDER = "********"

export function getAllCategoryIds(): string[] {
  return categories.map((cat) => cat.id)
}

export function getTotalVariableCount(): number {
  return categories.reduce((sum, cat) => sum + cat.variables.length, 0)
}

/**
 * Check if a field name represents a sensitive value
 */
function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(fieldName))
}

/**
 * Mask sensitive values in config entries
 */
function maskSensitiveValues(
  entries: [string, string][],
  maskSecrets: boolean
): [string, string][] {
  if (!maskSecrets) return entries
  return entries.map(([key, value]) => {
    if (isSensitiveField(key) && value !== "") {
      return [key, SECRET_PLACEHOLDER]
    }
    return [key, value]
  })
}

/**
 * Generate a header comment with timestamp and version
 */
function generateHeader(
  format: OutputFormat,
  wizardVersion?: string,
  includeComments?: boolean
): string {
  if (!includeComments && format !== "env") return ""
  
  const timestamp = new Date().toISOString()
  const version = wizardVersion || "1.0.0"
  const commentPrefix = format === "env" ? "#" : "#"
  
  if (format === "env") {
    return `${commentPrefix} Generated by n8n Configuration Wizard v${version}
${commentPrefix} Timestamp: ${timestamp}
${commentPrefix}
`
  }
  
  if (format === "docker-compose" && includeComments) {
    return `# Generated by n8n Configuration Wizard v${version}
# Timestamp: ${timestamp}
#
`
  }
  
  if (format === "docker-run" && includeComments) {
    return `# Generated by n8n Configuration Wizard v${version}
# Timestamp: ${timestamp}
`
  }
  
  if (format === "kubernetes" && includeComments) {
    return `# Generated by n8n Configuration Wizard v${version}
# Timestamp: ${timestamp}
# This manifest includes a ConfigMap and Deployment for n8n
---
`
  }
  
  return ""
}

/**
 * Generate .env format output
 */
function generateEnvOutput(
  entries: [string, string][],
  options: GeneratorOptions
): string {
  const header = generateHeader("env", options.wizardVersion, true)
  const content = entries.map(([key, value]) => `${key}=${value}`).join("\n")
  return header + content
}

/**
 * Generate docker-compose format output
 */
function generateDockerComposeOutput(
  config: Record<string, string>,
  entries: [string, string][],
  options: GeneratorOptions
): string {
  const composeVersion = options.composeVersion || "3.8"
  const includeComments = options.includeComments ?? false
  const header = generateHeader("docker-compose", options.wizardVersion, includeComments)
  
  const envVars = entries.map(([key, value]) => `      - ${key}=${value}`).join("\n")
  
  const n8nServiceComment = includeComments
    ? `  # n8n workflow automation service
  # Documentation: https://docs.n8n.io/
`
    : ""
  
  const volumesComment = includeComments
    ? `# Persistent volumes for data storage
`
    : ""
  
  const postgresComment = includeComments
    ? `  # PostgreSQL database for n8n data persistence
`
    : ""
  
  const redisComment = includeComments
    ? `  # Redis for queue mode execution
`
    : ""

  let output = `${header}version: '${composeVersion}'

services:
${n8nServiceComment}  n8n:
    image: docker.n8n.io/n8nio/n8n
    restart: always
    ports:
      - "${config.N8N_PORT || "5678"}:5678"
    environment:
${envVars}
    volumes:
      - n8n_data:/home/node/.n8n
`

  if (config.DB_TYPE === "postgresdb") {
    output += `
${postgresComment}  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=${config.DB_POSTGRESDB_USER || "postgres"}
      - POSTGRES_PASSWORD=${config.DB_POSTGRESDB_PASSWORD || "password"}
      - POSTGRES_DB=${config.DB_POSTGRESDB_DATABASE || "n8n"}
    volumes:
      - postgres_data:/var/lib/postgresql/data
`
  }

  if (config.EXECUTIONS_MODE === "queue") {
    output += `
${redisComment}  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
`
  }

  output += `
${volumesComment}volumes:
  n8n_data:`
  
  if (config.DB_TYPE === "postgresdb") {
    output += "\n  postgres_data:"
  }
  
  if (config.EXECUTIONS_MODE === "queue") {
    output += "\n  redis_data:"
  }

  return output
}

/**
 * Generate docker-run format output
 */
function generateDockerRunOutput(
  config: Record<string, string>,
  entries: [string, string][],
  options: GeneratorOptions
): string {
  const includeComments = options.includeComments ?? false
  const header = generateHeader("docker-run", options.wizardVersion, includeComments)
  
  const envFlags = entries.map(([key, value]) => `-e ${key}="${value}"`).join(" \\\n  ")

  return `${header}docker run -d \\
  --name n8n \\
  --restart always \\
  -p ${config.N8N_PORT || "5678"}:5678 \\
  ${envFlags} \\
  -v n8n_data:/home/node/.n8n \\
  docker.n8n.io/n8nio/n8n`
}

/**
 * Generate Kubernetes manifest output
 * Requirements: 8.4
 */
function generateKubernetesOutput(
  config: Record<string, string>,
  entries: [string, string][],
  options: GeneratorOptions
): string {
  const includeComments = options.includeComments ?? false
  const header = generateHeader("kubernetes", options.wizardVersion, includeComments)
  
  // Generate ConfigMap data
  const configMapData = entries
    .map(([key, value]) => `  ${key}: "${value.replace(/"/g, '\\"')}"`)
    .join("\n")
  
  // Generate environment variables from ConfigMap
  const envFromConfigMap = entries
    .map(([key]) => `        - name: ${key}
          valueFrom:
            configMapKeyRef:
              name: n8n-config
              key: ${key}`)
    .join("\n")

  const configMapComment = includeComments
    ? `# ConfigMap containing n8n environment variables
`
    : ""
  
  const deploymentComment = includeComments
    ? `# Deployment for n8n workflow automation
`
    : ""

  return `${header}${configMapComment}apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-config
  labels:
    app: n8n
data:
${configMapData}
---
${deploymentComment}apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
  labels:
    app: n8n
spec:
  replicas: 1
  selector:
    matchLabels:
      app: n8n
  template:
    metadata:
      labels:
        app: n8n
    spec:
      containers:
      - name: n8n
        image: docker.n8n.io/n8nio/n8n
        ports:
        - containerPort: 5678
        env:
${envFromConfigMap}
        volumeMounts:
        - name: n8n-data
          mountPath: /home/node/.n8n
      volumes:
      - name: n8n-data
        persistentVolumeClaim:
          claimName: n8n-data-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: n8n
  labels:
    app: n8n
spec:
  type: ClusterIP
  ports:
  - port: 5678
    targetPort: 5678
  selector:
    app: n8n`
}

/**
 * Generate configuration output in the specified format
 * 
 * @param config - Configuration key-value pairs
 * @param formatOrOptions - Output format string or GeneratorOptions object
 * @returns Generated configuration string
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function generateOutput(
  config: Record<string, string>,
  formatOrOptions: OutputFormat | GeneratorOptions
): string {
  // Handle both old signature (format string) and new signature (options object)
  const options: GeneratorOptions =
    typeof formatOrOptions === "string"
      ? { format: formatOrOptions }
      : formatOrOptions

  const { format, maskSecrets = false } = options

  // Filter out empty values and apply secret masking
  let entries = Object.entries(config).filter(([, value]) => value !== "")
  entries = maskSensitiveValues(entries, maskSecrets)

  switch (format) {
    case "env":
      return generateEnvOutput(entries, options)
    case "docker-compose":
      return generateDockerComposeOutput(config, entries, options)
    case "docker-run":
      return generateDockerRunOutput(config, entries, options)
    case "kubernetes":
      return generateKubernetesOutput(config, entries, options)
    default:
      return ""
  }
}
