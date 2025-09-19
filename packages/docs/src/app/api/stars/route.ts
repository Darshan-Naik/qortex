import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'redis'

// Create Redis client with connection pooling
const redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        connectTimeout: 10000
    }
})

// Connect to Redis with health monitoring
redis.on('error', (err: any) => {
    console.error('Redis Client Error', err)
    isConnected = false
})
redis.on('connect', () => {
    console.log('Redis Client Connected')
    isConnected = true
})
redis.on('ready', () => {
    console.log('Redis Client Ready')
    isConnected = true
})
redis.on('end', () => {
    console.log('Redis Client Disconnected')
    isConnected = false
})
redis.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...')
    isConnected = false
})

// Global connection state
let isConnected = false

// Helper function to ensure Redis connection with retry logic
async function ensureRedisConnection(retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            if (!isConnected || !redis.isOpen) {
                await redis.connect()
                isConnected = true
            }
            return redis
        } catch (error) {
            console.error(`Redis connection attempt ${attempt} failed:`, error)

            if (attempt === retries) {
                throw new Error(`Failed to connect to Redis after ${retries} attempts: ${error}`)
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
        }
    }
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // Max 10 requests per minute per IP

// In-memory rate limiting store
interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    const entries = Array.from(rateLimitStore.entries())
    for (const [ip, entry] of entries) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(ip)
        }
    }
}, 5 * 60 * 1000)

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

// In-memory rate limiting function
function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(ip)

    if (!entry || now > entry.resetTime) {
        // First request or window expired - create new entry
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
        })
        return true
    }

    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        return false // Rate limit exceeded
    }

    // Increment count
    entry.count++
    return true
}

// GET /api/stars - Get star count and user status
export async function GET(request: NextRequest) {
    try {
        const client = await ensureRedisConnection()
        const ip = getClientIP(request)

        // Use MGET to fetch all data in a single round trip
        const keys = [
            'stars:total',
            `stars:user:${ip}`,
            `stars:unstar_attempts:${ip}`
        ]

        const values = await client.mGet(keys)
        const [totalStarsStr, userStarredStr, unstarAttemptsStr] = values

        const totalStars = totalStarsStr ? parseInt(totalStarsStr) : 0
        const userStarred = userStarredStr === 'true'
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

        // Check rate limit (now synchronous and in-memory)
        const rateLimitOk = checkRateLimit(ip)
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', success: false },
                { status: 429 }
            )
        }

        const client = await ensureRedisConnection()

        // Use transaction for atomic operations
        const multi = client.multi()

        // Check if user already starred and get current attempts
        multi.get(`stars:user:${ip}`)
        multi.get(`stars:unstar_attempts:${ip}`)

        const results = await multi.exec()
        const [alreadyStarredStr, currentAttemptsStr] = results as [string | null, string | null]

        const alreadyStarred = alreadyStarredStr === 'true'
        if (alreadyStarred) {
            return NextResponse.json(
                { error: 'You have already starred this project!', success: false },
                { status: 400 }
            )
        }

        // Atomic star addition
        const starMulti = client.multi()
        starMulti.set(`stars:user:${ip}`, 'true')
        starMulti.incr('stars:total')

        const starResults = await starMulti.exec()
        const newTotal = starResults?.[1] as number

        return NextResponse.json({
            totalStars: newTotal,
            userStarred: true,
            unstarAttempts: currentAttemptsStr ? parseInt(currentAttemptsStr) : 0,
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

        // Check rate limit (now synchronous and in-memory)
        const rateLimitOk = checkRateLimit(ip)
        if (!rateLimitOk) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.', success: false },
                { status: 429 }
            )
        }

        const client = await ensureRedisConnection()

        // Use transaction to check user status and attempts atomically
        const checkMulti = client.multi()
        checkMulti.get(`stars:user:${ip}`)
        checkMulti.get(`stars:unstar_attempts:${ip}`)

        const checkResults = await checkMulti.exec()
        const [userStarredStr, unstarAttemptsStr] = checkResults as [string | null, string | null]

        const userStarred = userStarredStr === 'true'
        if (!userStarred) {
            return NextResponse.json(
                { error: 'You have not starred this project yet.', success: false },
                { status: 400 }
            )
        }

        const unstarAttempts = unstarAttemptsStr ? parseInt(unstarAttemptsStr) : 0
        if (unstarAttempts >= 2) {
            return NextResponse.json(
                { error: 'You have reached the maximum attempts!', success: false },
                { status: 400 }
            )
        }

        // Atomic star removal with attempt tracking
        const removeMulti = client.multi()
        removeMulti.del(`stars:user:${ip}`)
        removeMulti.incr(`stars:unstar_attempts:${ip}`)
        removeMulti.decr('stars:total')

        const removeResults = await removeMulti.exec()
        const newUnstarAttempts = removeResults?.[1] as number
        const newTotal = removeResults?.[2] as number

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
