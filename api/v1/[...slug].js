/**
 * Vercel Serverless Function: catch-all for /api/v1/*
 *
 * This function catches every request to /api/v1/* on Vercel (POST, PUT, PATCH, DELETE, GET).
 * It returns an empty 200 response with a header that tells the frontend to use the mock engine.
 * The actual data is handled entirely client-side by mockApi.ts.
 *
 * Without this, Vercel's static file server returns 405 Method Not Allowed for non-GET requests.
 */
export default function handler(req, res) {
  // Allow CORS for all origins (frontend JS on same domain)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Mock-Mode', 'true');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return a consistent JSON response that signals "use mock engine"
  // The frontend's mock engine intercepts before this even fires in most cases,
  // but this acts as a safety net so the network never returns 405.
  return res.status(200).json({
    success: true,
    mockMode: true,
    message: 'Demo mode: data is managed client-side',
    data: null,
  });
}
