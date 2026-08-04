import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const latencyTrend = new Trend("latency");

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "4m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    errors: ["rate<0.01"],
    http_req_duration: ["p(95)<300"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const ENDPOINTS = ["/en", "/en/incidents", "/en/ratings"];

export default function loadTest() {
  const url = `${BASE_URL}${ENDPOINTS[__ITER % ENDPOINTS.length]}`;
  const res = http.get(url, { tags: { endpoint: ENDPOINTS[__ITER % ENDPOINTS.length] } });

  latencyTrend.add(res.timings.duration);
  errorRate.add(res.status >= 400);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response < 300ms": (r) => r.timings.duration < 300,
  });

  sleep(1);
}
