'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface StarData {
    totalStars: number
    userStarred: boolean
    success: boolean
    message?: string
    error?: string
    unstarAttempts?: number
}

interface StarContextType {
    starData: StarData
    loading: boolean
    actionLoading: boolean
    message: string
    fetchStarData: () => Promise<void>
    handleStarToggle: () => Promise<void>
    setMessage: (message: string) => void
}

const StarContext = createContext<StarContextType | undefined>(undefined)

export function StarProvider({ children }: { children: ReactNode }) {
    const [starData, setStarData] = useState<StarData>({ totalStars: 0, userStarred: false, success: true, unstarAttempts: 0 })
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null)

    // Helper function to clear message with timeout
    const clearMessageWithTimeout = (newMessage: string) => {
        // Clear existing timeout
        if (messageTimeout) {
            clearTimeout(messageTimeout)
        }

        setMessage(newMessage)

        // Set new timeout
        const timeout = setTimeout(() => {
            setMessage('')
            setMessageTimeout(null)
        }, 3000)

        setMessageTimeout(timeout)
    }

    // Load initial data once on provider mount
    useEffect(() => {
        fetchStarData()
    }, [])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (messageTimeout) {
                clearTimeout(messageTimeout)
            }
        }
    }, [messageTimeout])

    const fetchStarData = async () => {
        try {
            const response = await fetch('/api/stars')
            if (response.ok) {
                const data = await response.json()
                setStarData(data)
            }
        } catch (error) {
            console.error('Failed to fetch star data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStarToggle = async () => {
        if (actionLoading) return


        // Client-side check for unstar attempts
        if (starData.userStarred && (starData.unstarAttempts || 0) >= 2) {
            clearMessageWithTimeout('You have reached the maximum attempts!')
            return
        }

        setActionLoading(true)
        setMessage('')

        try {
            const method = starData.userStarred ? 'DELETE' : 'POST'
            const response = await fetch('/api/stars', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setStarData({
                    totalStars: data.totalStars,
                    userStarred: data.userStarred,
                    success: true,
                    unstarAttempts: data.unstarAttempts || 0
                })

                clearMessageWithTimeout(data.message || 'Success!')
            } else {
                clearMessageWithTimeout(data.error || 'Something went wrong')
            }
        } catch (error) {
            console.error('Failed to toggle star:', error)
            clearMessageWithTimeout('Failed to update star. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <StarContext.Provider value={{
            starData,
            loading,
            actionLoading,
            message,
            fetchStarData,
            handleStarToggle,
            setMessage
        }}>
            {children}
        </StarContext.Provider>
    )
}

export function useStar() {
    const context = useContext(StarContext)
    if (context === undefined) {
        throw new Error('useStar must be used within a StarProvider')
    }
    return context
}
