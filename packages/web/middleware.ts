import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

const isApiRoute = createRouteMatcher(['/api(.*)']);

const isPublicRoute = createRouteMatcher([
  '/api(.*)',
  '/sign-in(.*)',
  '/webhook(.*)',
  '/top-up-success',
  '/top-up-cancelled',
  '/robots.txt',
]);

const isClerkProtectedRoute = createRouteMatcher(['/(.*)']);

// Check if Clerk is configured
const hasClerkConfig =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

const soloApiKeyMiddleware = (req: NextRequest) => {
  if (isApiRoute(req)) {
    const header = req.headers.get('authorization');
    console.log('header', header);
    if (!header) {
      return new NextResponse('No Authorization header', { status: 401 });
    }
    const token = header.replace('Bearer ', '');
    if (token !== process.env.SOLO_API_KEY) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }
  return NextResponse.next();
};

// Helper to check if a path is a static file that should be skipped
function isStaticFile(pathname: string): boolean {
  // Check for common static file patterns
  const staticPatterns = [
    /^\/apple-touch-icon/i,
    /^\/favicon\.ico$/i,
    /^\/robots\.txt$/i,
    /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|css|js|txt)$/i,
  ];
  return staticPatterns.some((pattern) => pattern.test(pathname));
}

// Main middleware function that handles CORS and routing
async function baseMiddleware(
  req: NextRequest,
  _event: NextFetchEvent
): Promise<NextResponse> {
  // Skip static files immediately
  if (isStaticFile(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Allow all origins
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const isSoloInstance =
    process.env.SOLO_API_KEY && process.env.SOLO_API_KEY.length > 0;

  // If not using Clerk and using solo instance, use API key middleware
  if (!hasClerkConfig && isSoloInstance) {
    return soloApiKeyMiddleware(req);
  }

  return res;
}

// Create the middleware export
// If Clerk is configured, always use clerkMiddleware (required for auth() to work)
// Clerk needs to see clerkMiddleware() at the top level to detect it
const middleware = hasClerkConfig
  ? clerkMiddleware(async (auth, req) => {
      // Skip static files - don't run Clerk middleware on them
      if (isStaticFile(req.nextUrl.pathname)) {
        return NextResponse.next();
      }

      // First run base middleware logic (CORS, etc.)
      const baseResponse = await baseMiddleware(req, {} as NextFetchEvent);

      // If base middleware returned early (e.g., OPTIONS), use that response
      if (baseResponse.status === 204 || baseResponse.status !== 200) {
        return baseResponse;
      }

      const enableUserManagement =
        process.env.ENABLE_USER_MANAGEMENT === 'true';

      // Handle public routes - always allow through
      if (isPublicRoute(req)) {
        console.log('isPublicRoute');
        return NextResponse.next();
      }

      // If user management is enabled, enforce authentication
      if (enableUserManagement) {
        console.log('enableUserManagement', req.url);
        if (isClerkProtectedRoute(req)) {
          console.log('isClerkProtectedRoute');
          const { userId } = await auth();
          console.log('userId', userId);
          if (!userId) {
            // (await auth()).redirectToSignIn();
          }
        }
      }
      // If user management is disabled, just pass through (permissive)
      // This allows auth() calls to work without enforcing authentication

      return NextResponse.next();
    })
  : baseMiddleware;

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - apple-touch-icon.* (iOS icons with any extension)
     * - *.png, *.jpg, *.jpeg, *.gif, *.svg, *.ico (image files)
     * - *.woff, *.woff2, *.ttf, *.eot (font files)
     * - *.css, *.js (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|apple-touch-icon.*|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|css|js|txt)$).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
