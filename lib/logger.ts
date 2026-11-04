// ==============================================================================
// FILE: lib/logger.ts
// ARCHITECTURE ROLE: Enterprise Structured JSON Observability & Telemetry Logger
//
// 🎓 BEGINNER'S GUIDE TO ENTERPRISE OBSERVABILITY & LOGGING:
//   1. Why do we NEVER use raw `console.log("Error occurred")` in production?
//      Raw text strings cannot be searched, aggregated, or alerted on by cloud platforms
//      (like AWS CloudWatch, Datadog, Sentry, or Grafana).
//      Instead, enterprise backends output Structured JSON:
//      `{"level":"error","time":"2026-11-04T12:00:00Z","message":"Payment failed","orderNumber":"NV-102"}`
//      Cloud log processors automatically parse this JSON, allowing DevOps engineers to graph
//      payment failure rates in real-time and trigger automated alerts!
//
//   2. What is Sensitive Data Redaction?
//      Under PCI-DSS and GDPR laws, logging raw credit cards, passwords, or secret API keys
//      is illegal and can result in massive fines!
//      This logger automatically scans payloads and redacts credit cards and passwords
//      before writing to disk or stdout.
// ==============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error" | "security" | "audit";

export interface LogContext {
  requestId?: string;
  orderNumber?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  environment: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isProduction: boolean;
  private minLevelWeight: number;

  private levelWeights: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
    security: 50,
    audit: 60,
  };

  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    const configuredLevel = (process.env.LOG_LEVEL || "info").toLowerCase() as LogLevel;
    this.minLevelWeight = this.levelWeights[configuredLevel] || 20;
  }

  /**
   * Redacts sensitive financial and authentication keys to comply with PCI-DSS & GDPR
   */
  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "creditcard",
      "cardnumber",
      "cvv",
      "clientsecret",
      "apikey",
      "authorization",
    ];

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        sanitized[key] = "[REDACTED_FOR_SECURITY]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Internal output dispatcher
   */
  private output(level: LogLevel, message: string, context?: LogContext, err?: unknown): void {
    if (this.levelWeights[level] < this.minLevelWeight) return;

    const timestamp = new Date().toISOString();
    const cleanContext = context ? (this.sanitizeData(context) as Record<string, unknown>) : undefined;

    let errorDetails: LogEntry["error"] | undefined;
    if (err instanceof Error) {
      errorDetails = {
        name: err.name,
        message: err.message,
        stack: this.isProduction ? undefined : err.stack, // Strip verbose stacks in prod logs
      };
    }

    const entry: LogEntry = {
      level,
      timestamp,
      message,
      environment: process.env.NODE_ENV || "development",
      context: cleanContext,
      error: errorDetails,
    };

    if (this.isProduction) {
      // In production: Output machine-readable single-line JSON for cloud ingestion
      console.log(JSON.stringify(entry));
    } else {
      // In development: Pretty formatted colored console output for developers
      const colorMap: Record<LogLevel, string> = {
        debug: "\x1b[34m[DEBUG]\x1b[0m",
        info: "\x1b[32m[INFO]\x1b[0m",
        warn: "\x1b[33m[WARN]\x1b[0m",
        error: "\x1b[31m[ERROR]\x1b[0m",
        security: "\x1b[35m[SECURITY]\x1b[0m",
        audit: "\x1b[36m[AUDIT]\x1b[0m",
      };

      const tag = colorMap[level] || `[${level.toUpperCase()}]`;
      const contextStr = cleanContext ? `\n  Context: ${JSON.stringify(cleanContext)}` : "";
      const errStr = err instanceof Error ? `\n  Error: ${err.message}` : "";

      console.log(`${tag} ${timestamp} - ${message}${contextStr}${errStr}`);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.output("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.output("warn", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.output("error", message, context, error);
  }

  security(message: string, context?: LogContext): void {
    this.output("security", message, context);
  }

  audit(action: string, context: LogContext): void {
    this.output("audit", `Audit Trail: ${action}`, context);
  }
}

// Global logger singleton
export const logger = new Logger();
