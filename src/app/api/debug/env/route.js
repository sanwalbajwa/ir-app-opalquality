// Create: src/app/api/debug/env/route.js
export async function GET() {
  return Response.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20),
    timestamp: new Date().toISOString()
  })
}