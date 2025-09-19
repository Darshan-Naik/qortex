import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

// Create Redis client
const redis = createClient({
    url: process.env.REDIS_URL
})

// Connect to Redis
redis.on('error', (err: any) => console.error('Redis Client Error', err))
redis.on('connect', () => console.log('Redis Client Connected'))

// Helper function to ensure Redis connection
async function ensureRedisConnection() {
    if (!redis.isOpen) {
        await redis.connect()
    }
    return redis
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // Max 10 requests per minute per IP

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIP) {
        return realIP
    }

    if (cfConnectingIP) {
        return cfConnectingIP
    }

    return request.ip || 'unknown'
}

// Rate limiting function
async function checkRateLimit(ip: string): Promise<boolean> {
    try {
        const client = await ensureRedisConnection()
        const key = `rate_limit:${ip}`
        const current = await client.get(key) as string
        const count = current ? parseInt(current) : 0

        if (count >= MAX_REQUESTS_PER_WINDOW) {
            return false
        }

        await client.incr(key)
        await client.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000))

        return true
    } catch (error) {
        console.error('Rate limit check failed:', error)
        return true // Allow request if rate limiting fails
    }
}

// GET /api/stars - Get star count and user status
export async function GET(request: NextRequest) {
    try {
        const client = await ensureRedisConnection()
        const ip = getClientIP(request)

        // Get total star count (always fresh from database)
        const totalStarsStr = await client.get('stars:total') as string
        const totalStars = totalStarsStr ? parseInt(totalStarsStr) : 0

        // Check if user has starred (always fresh from database)
        const userStarredStr = await client.get(`stars:user:${ip}`) as string
        const userStarred = userStarredStr === 'true'

        // Get unstar attempts
        const unstarAttemptsStr = await client.get(`stars:unstar_attempts:${ip}`) as string
        const unstarAttempts = unstarAttemptsStr ? parseInt(unstarAttemptsStr) : 0


        return NextResponse.json({
            totalStars,
            userStarred,
            unstarAttempts,
            success: true
        })
    } catch (error) {
        console.error('Error fetching stars:', error)
        return NextResponse.json(
            { error: 'Failed to fetch star data', success: false },
            { status: 500 }
        )
    }
}

// POST /api/stars - Add a star
export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request)

        // Check rate limit
        const rateLimitOk = await checkRateLimit(ip)
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', success: false },
                { status: 429 }
            )
        }

        // Check if user already starred
        const client = await ensureRedisConnection()
        const alreadyStarredStr = await client.get(`stars:user:${ip}`) as string
        const alreadyStarred = alreadyStarredStr === 'true'
        if (alreadyStarred) {
            return NextResponse.json(
                { error: 'You have already starred this project!', success: false },
                { status: 400 }
            )
        }

        // Add star (don't reset unstar attempts - they should accumulate)
        await client.set(`stars:user:${ip}`, 'true')
        const newTotal = await client.incr('stars:total')

        // Get current unstar attempts (don't reset them)
        const currentAttempts = await client.get(`stars:unstar_attempts:${ip}`) as string

        return NextResponse.json({
            totalStars: newTotal,
            userStarred: true,
            unstarAttempts: currentAttempts ? parseInt(currentAttempts) : 0,
            success: true,
            message: 'Thank you for starring Qortex! ⭐'
        })
    } catch (error) {
        console.error('Error adding star:', error)
        return NextResponse.json(
            { error: 'Failed to add star', success: false },
            { status: 500 }
        )
    }
}

// DELETE /api/stars - Remove a star
export async function DELETE(request: NextRequest) {
    try {
        const ip = getClientIP(request)

        // Check rate limit
        const rateLimitOk = await checkRateLimit(ip)
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', success: false },
                { status: 429 }
            )
        }

        // Check if user has starred
        const client = await ensureRedisConnection()
        const userStarredStr = await client.get(`stars:user:${ip}`) as string
        const userStarred = userStarredStr === 'true'
        if (!userStarred) {
            return NextResponse.json(
                { error: 'You have not starred this project yet.', success: false },
                { status: 400 }
            )
        }

        // Check unstar attempts
        const unstarAttemptsStr = await client.get(`stars:unstar_attempts:${ip}`) as string
        const unstarAttempts = unstarAttemptsStr ? parseInt(unstarAttemptsStr) : 0

        if (unstarAttempts >= 2) {
            return NextResponse.json(
                { error: 'You have reached the maximum attempts!', success: false },
                { status: 400 }
            )
        }

        // Remove star and increment unstar attempts
        await client.del(`stars:user:${ip}`)
        const newUnstarAttempts = await client.incr(`stars:unstar_attempts:${ip}`)
        const newTotal = await client.decr('stars:total')


        return NextResponse.json({
            totalStars: Math.max(0, newTotal), // Ensure count doesn't go below 0
            userStarred: false,
            unstarAttempts: newUnstarAttempts,
            success: true,
            message: 'Star removed successfully.'
        })
    } catch (error) {
        console.error('Error removing star:', error)
        return NextResponse.json(
            { error: 'Failed to remove star', success: false },
            { status: 500 }
        )
    }
}
