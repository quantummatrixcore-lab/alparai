import { NextResponse } from "next/server";

export interface ApiProblemDetails {
  error: string;
  code: string;
  status: number;
  timestamp: string;
  retryAfter?: number;
  details?: unknown;
  [key: string]: unknown;
}

export interface ApiErrorOptions {
  error: string;
  status?: number;
  code?: string;
  details?: unknown;
  retryAfter?: number;
  headers?: Record<string, string> | HeadersInit;
  [key: string]: unknown;
}

const STATUS_CODE_MAP: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  402: "PAYMENT_REQUIRED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
  408: "REQUEST_TIMEOUT",
  409: "CONFLICT",
  410: "GONE",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
  501: "NOT_IMPLEMENTED",
  502: "BAD_GATEWAY",
  503: "SERVICE_UNAVAILABLE",
  504: "GATEWAY_TIMEOUT",
};

export function apiError(
  errorOrOptions: string | ApiErrorOptions,
  status = 500,
  code?: string,
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
): NextResponse<ApiProblemDetails> {
  let errorMessage: string;
  let statusCode = status;
  let errorCode = code;
  let customHeaders = headers;
  let extraData: Record<string, unknown> = extra ? { ...extra } : {};

  if (typeof errorOrOptions === "object" && errorOrOptions !== null) {
    const {
      error,
      status: optStatus,
      code: optCode,
      headers: optHeaders,
      ...rest
    } = errorOrOptions;
    errorMessage = error;
    if (optStatus !== undefined) statusCode = optStatus;
    if (optCode !== undefined) errorCode = optCode;
    if (optHeaders !== undefined) customHeaders = optHeaders;
    extraData = { ...rest };
  } else {
    errorMessage = errorOrOptions;
  }

  const finalCode =
    errorCode ||
    STATUS_CODE_MAP[statusCode] ||
    (statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "API_ERROR");

  const body: ApiProblemDetails = {
    error: errorMessage,
    code: finalCode,
    status: statusCode,
    timestamp: new Date().toISOString(),
    ...extraData,
  };

  const responseHeaders: Record<string, string> = {
    "Content-Type": "application/problem+json; charset=utf-8",
  };

  if (body.retryAfter !== undefined) {
    responseHeaders["Retry-After"] = String(body.retryAfter);
  }

  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((val, key) => {
        responseHeaders[key] = val;
      });
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, val]) => {
        responseHeaders[key] = val;
      });
    } else {
      Object.assign(responseHeaders, customHeaders);
    }
  }

  return NextResponse.json(body, {
    status: statusCode,
    headers: responseHeaders,
  });
}

export function badRequest(
  error = "Bad Request",
  code = "BAD_REQUEST",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 400, code, extra, headers);
}

export function unauthorized(
  error = "Unauthorized",
  code = "UNAUTHORIZED",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 401, code, extra, headers);
}

export function forbidden(
  error = "Forbidden",
  code = "FORBIDDEN",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 403, code, extra, headers);
}

export function notFound(
  error = "Not Found",
  code = "NOT_FOUND",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 404, code, extra, headers);
}

export function rateLimited(
  error = "Rate limited",
  retryAfter?: number,
  code = "RATE_LIMITED",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 429, code, { retryAfter, ...extra }, headers);
}

export function internalError(
  error = "Internal server error",
  code = "INTERNAL_SERVER_ERROR",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 500, code, extra, headers);
}

export function unprocessable(
  error = "Unprocessable Entity",
  code = "UNPROCESSABLE_ENTITY",
  extra?: Record<string, unknown>,
  headers?: Record<string, string> | HeadersInit
) {
  return apiError(error, 422, code, extra, headers);
}
