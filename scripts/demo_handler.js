/**
 * AlparAi Demo Request Handler
 * Minimal HTTP server and handler to capture and persist enterprise demo requests.
 * 
 * Target storage: D:\AlparAi\data\demo_requests.json
 * Runtime: Node.js (ES Module compatible with package.json type: module)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATA_DIR = path.resolve(__dirname, '..', 'data');
export const DEMO_REQUESTS_FILE = path.join(DATA_DIR, 'demo_requests.json');
export const DEFAULT_PORT = process.env.DEMO_PORT ? parseInt(process.env.DEMO_PORT, 10) : 3005;

/**
 * Ensures the data file exists and contains valid JSON array
 */
export function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DEMO_REQUESTS_FILE)) {
    fs.writeFileSync(DEMO_REQUESTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

/**
 * Reads existing demo requests from JSON storage
 */
export function getDemoRequests() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DEMO_REQUESTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[DemoHandler] Error reading demo requests:', err.message);
    return [];
  }
}

/**
 * Saves a new demo request into JSON storage
 */
export function saveDemoRequest(data) {
  ensureDataFile();
  const requests = getDemoRequests();

  const newEntry = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    company: String(data.company || '').trim(),
    email: String(data.email || '').trim(),
    preferred_time: String(data.preferred_time || '').trim(),
    status: 'pending',
    source: data.source || 'landing_page_en',
    ip: data.ip || 'anonymous',
    created_at: new Date().toISOString()
  };

  requests.push(newEntry);
  fs.writeFileSync(DEMO_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf8');
  return newEntry;
}

/**
 * Creates HTTP request listener
 */
export function createDemoHandler() {
  return function requestListener(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && (parsedUrl.pathname === '/api/demo-request' || parsedUrl.pathname === '/demo-request')) {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 1e6) {
          req.destroy(); // 1MB payload flood guard
        }
      });

      req.on('end', () => {
        try {
          let payload = {};
          const contentType = req.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            payload = JSON.parse(body || '{}');
          } else {
            const params = new URLSearchParams(body);
            for (const [key, value] of params.entries()) {
              payload[key] = value;
            }
          }

          if (!payload.company || !payload.email || !payload.preferred_time) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              error: 'Missing required fields: company, email, and preferred_time are mandatory.'
            }));
            return;
          }

          payload.ip = req.socket.remoteAddress;
          const saved = saveDemoRequest(payload);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Demo request received successfully. Our compliance team will reach out shortly.',
            request: saved
          }));
        } catch (err) {
          console.error('[DemoHandler] Parse error:', err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Malformed request payload.' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && (parsedUrl.pathname === '/api/demo-requests' || parsedUrl.pathname === '/demo-requests')) {
      const requests = getDemoRequests();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: requests.length, requests }));
      return;
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  };
}

// Start standalone server if executed directly
if (process.argv[1] && process.argv[1].endsWith('demo_handler.js')) {
  const handler = createDemoHandler();
  const server = http.createServer(handler);
  server.listen(DEFAULT_PORT, () => {
    console.log(`[AlparAi Demo Handler] Listening on http://localhost:${DEFAULT_PORT}`);
    console.log(`[Storage File] ${DEMO_REQUESTS_FILE}`);
  });
}

export default {
  createDemoHandler,
  saveDemoRequest,
  getDemoRequests,
  DEMO_REQUESTS_FILE
};
