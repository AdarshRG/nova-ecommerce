// ==============================================================================
// FILE: lib/errors.ts
// ARCHITECTURE ROLE: Enterprise API Error Normalizer & Information Disclosure Guard
//
// 🎓 BEGINNER'S GUIDE TO SECURE API ERROR HANDLING:
//   1. What is Information Disclosure?
//      If an unexpected error happens (e.g. database timeout), raw Node.js or SQL errors
//      can contain private table schemas, server file paths, or internal IP addresses.
//      If an attacker sees: `Error: column "password_hash" not found at /var/app/db.ts:42`,
//      they learn how your internal system is structured!
//
//   2. What does this file do?
//      It catches all errors, logs the full technical stack trace securely to `logger.ts`,
//      and returns a sanitized, clean JSON response to the user with a unique `referenceId`
//      (e.g., `err_ref_948201`).
//      If a customer contacts support, they provide that ID, allowing developers to search
//      the exact error in CloudWatch without leaking secrets to the public!
// ==============================================================================

import { NextResponse } from "next/server";
import { logger } from "./logger";

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, code = "INTERNAL_SERVER_ERROR", isOperational = true) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found.") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  public details?: Record<string, string>;

  constructor(message = "Submitted payload failed validation.", details?: Record<string, string>) {
    super(message, 400, "VALIDATION_FAILED");
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication is required to access this resource.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class RateLimitExceededError extends AppError {
  constructor(message = "Too many requests. Please slow down and try again later.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

/**
 * Standardized API Error Handler Response Formatter
 */
export function handleApiError(error: unknown, endpointName = "api"): NextResponse {
  const referenceId = `err_ref_${Math.random().toString(36).substring(2, 9)}`;
  const isProduction = process.env.NODE_ENV === "production";

  // Case 1: Known operational Application Error
  if (error instanceof AppError) {
    logger.warn(`[${endpointName}] Operational Error: ${error.message}`, {
      referenceId,
      code: error.code,
      statusCode: error.statusCode,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        referenceId,
        details: error instanceof ValidationError ? error.details : undefined,
      },
      { status: error.statusCode }
    );
  }

  // Case 2: Unknown unhandled exception (Database crash, third-party timeout)
  logger.error(`[${endpointName}] Critical Unhandled Exception`, error, { referenceId });

  // In production: Return safe generic message without leaking internals
  const safeMessage = isProduction
    ? "An unexpected system error occurred. Please quote the reference ID to support."
    : error instanceof Error
    ? error.message
    : "Unknown server error.";

  return NextResponse.json(
    {
      success: false,
      error: safeMessage,
      code: "INTERNAL_SERVER_ERROR",
      referenceId,
    },
    { status: 500 }
  );
}
