'use client'

import { Star } from 'lucide-react'
import { useStar } from '../contexts/StarContext'

// Utility function to format large numbers
function formatStarCount(count: number): string {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + 'M'
    } else if (count >= 1000) {
        return (count / 1000).toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '') + 'K'
    }
    return count.toLocaleString()
}

interface StarButtonProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    showCount?: boolean
    showMessage?: boolean
}

export function StarButton({
    className = '',
    size = 'md',
    showCount = true,
    showMessage = true
}: StarButtonProps) {
    const { starData, loading, actionLoading, message, handleStarToggle } = useStar()

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    }

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    }

    if (loading) {
        return (
            <div className="relative">
                <button
                    disabled
                    className={`
          inline-flex items-center gap-2 ${sizeClasses[size]} 
          rounded-lg font-medium transition-all duration-200
          bg-gray-100 text-gray-700 border border-gray-200 opacity-50 cursor-not-allowed
          ${className}
        `}
                >
                    <Star className={`${iconSizes[size]} animate-spin`} />

                    {showCount && (
                        <span className="font-semibold">
                            --
                        </span>
                    )}

                    <span className="hidden sm:inline">
                        Star
                    </span>
                </button>
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={handleStarToggle}
                disabled={actionLoading}
                className={`
          inline-flex items-center gap-2 ${sizeClasses[size]} 
          rounded-lg font-medium transition-all duration-200
          ${starData.userStarred
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }
          ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          active:scale-95
          ${className}
        `}
                title={starData.userStarred ? 'Remove your star' : 'Give us a star!'}
            >
                <Star
                    className={`${iconSizes[size]} ${actionLoading ? 'animate-spin' : ''} ${starData.userStarred ? 'fill-current' : ''
                        }`}
                />

                {showCount && (
                    <span className="font-semibold">
                        {formatStarCount(starData.totalStars)}
                    </span>
                )}

                <span className="hidden sm:inline">
                    {starData.userStarred ? 'Starred' : 'Star'}
                </span>
            </button>

            {/* Fixed position message to prevent layout shift */}
            {showMessage && message && (
                <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50
          text-sm px-3 py-1 rounded-md transition-all duration-300 whitespace-nowrap
          ${message.includes('Thank you') || message.includes('removed successfully')
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }
        `}>
                    {message}
                </div>
            )}
        </div>
    )
}
