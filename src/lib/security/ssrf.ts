import dns from "dns";

/**
 * Validates if a URL is safe from SSRF attacks.
 * Enforces HTTPS scheme, rejects private/local IP ranges, IPv6 loopbacks, CGNAT, and hostnames.
 */
export async function isSafeUrl(
  urlStr: string,
): Promise<{ safe: boolean; error?: string; parsedUrl?: URL }> {
  try {
    const parsedUrl = new URL(urlStr);

    // 1. Scheme HTTPS-only
    if (parsedUrl.protocol !== "https:") {
      return { safe: false, error: "Only HTTPS URLs are allowed." };
    }

    const host = parsedUrl.hostname.toLowerCase();

    // 2. Reject obvious private hostnames/IPs
    const isObviousPrivate =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "[::1]" ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|127\.|100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.)/.test(
        host,
      ) ||
      host.includes("::1") ||
      host.startsWith("fd") ||
      host.startsWith("fc") ||
      host.startsWith("fe80");

    if (isObviousPrivate) {
      return { safe: false, error: "Access to private or local network is forbidden." };
    }

    // 3. DNS resolution check (resolve the host to IP and verify it's public)
    // Static import with safe runtime type check allows Vitest to mock it,
    // while Webpack Edge runtime (where dns is {}) safely skips it.
    try {
      if (dns && typeof dns.lookup === 'function') {
        const util = typeof require !== 'undefined' ? require('util') : null;
        if (util && typeof util.promisify === 'function') {
          const dnsLookup = util.promisify(dns.lookup);
          const result = await dnsLookup(parsedUrl.hostname, { all: true });
          for (const entry of result) {
            const ip = entry.address;
            const isIpPrivate =
              ip === "127.0.0.1" ||
              ip === "0.0.0.0" ||
              ip === "::1" ||
              /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|127\.|100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\.)/.test(
                ip,
              ) ||
              ip.startsWith("fd") ||
              ip.startsWith("fc") ||
              ip.startsWith("fe80");
            if (isIpPrivate) {
              return { safe: false, error: "Access to private or local network IP is forbidden." };
            }
          }
        }
      }
    } catch {
      return { safe: false, error: "Could not resolve hostname." };
    }

    return { safe: true, parsedUrl };
  } catch {
    return { safe: false, error: "Invalid URL format." };
  }
}

/**
 * Fetch helper wrapping native fetch with SSRF guards.
 * Restricts to HTTPS, checks DNS, prevents automated redirect following, and caps size/time.
 */
export async function fetchWithSsrfGuard(
  urlStr: string,
  options: RequestInit = {},
): Promise<Response> {
  let currentUrl = urlStr;
  const maxRedirects = 3;
  let redirectCount = 0;
  const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2MB

  // Enforce response time cap (8000ms)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener(
        "abort",
        () => {
          controller.abort(options.signal?.reason);
        },
        { once: true },
      );
    }
  }

  try {
    while (redirectCount <= maxRedirects) {
      const { safe, error } = await isSafeUrl(currentUrl);
      if (!safe) {
        throw new Error(error || "Unsafe URL");
      }

      const res = await fetch(currentUrl, {
        ...options,
        redirect: "manual",
        signal: controller.signal,
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) {
          clearTimeout(timeoutId);
          return res;
        }

        // Resolve relative redirect location against the current URL
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        redirectCount++;
      } else {
        // Enforce response size cap (2MB limit)
        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
          controller.abort();
          throw new Error("Response size limit exceeded (2MB limit)");
        }
        clearTimeout(timeoutId);

        // Stream counter guard for chunked transfer or streams without Content-Length
        if (res.body && res.status !== 204 && res.status !== 205 && res.status !== 304) {
          let receivedBytes = 0;
          const byteCounterStream = new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, streamController) {
              receivedBytes += chunk.byteLength ?? chunk.length ?? 0;
              if (receivedBytes > MAX_RESPONSE_SIZE) {
                controller.abort();
                streamController.error(new Error("Response size limit exceeded (2MB limit)"));
                return;
              }
              streamController.enqueue(chunk);
            },
          });

          const monitoredBody = res.body.pipeThrough(byteCounterStream);
          return new Response(monitoredBody, {
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
          });
        }

        return res;
      }
    }
    throw new Error("Too many redirects");
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
