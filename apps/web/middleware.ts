import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export function middleware(request: NextRequest) {
  // Generate a unique nonce for each request
  const nonce = randomBytes(16).toString('hex');
  
  // Create the CSP header with report-uri directive
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "frame-ancestors 'self'",
    "report-uri /csp-report"  // Endpoint to collect CSP violations
  ].join('; ');

  // Clone the response to modify headers
  const response = NextResponse.next();
  
  // Add the CSP Report-Only header (won't block, just report)
  response.headers.set('Content-Security-Policy-Report-Only', cspHeader);
  
  // Add the nonce to the response for use in templates
  response.headers.set('X-Nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};