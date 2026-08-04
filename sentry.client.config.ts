import * as Sentry from "@sentry/nextjs";
import { maskPII } from "./src/lib/pii/guardian";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event) {
    if (event.message) {
      event.message = maskPII(event.message).masked;
    }
    if (event.exception?.values) {
      for (const val of event.exception.values) {
        if (val.value) {
          val.value = maskPII(val.value).masked;
        }
      }
    }
    return event;
  },
});
