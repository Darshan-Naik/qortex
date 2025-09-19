'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { StarButton } from './StarButton'
import { useStar } from '../contexts/StarContext'

export function HeroButtons() {
    const { message } = useStar()

    return (
        <div className="mt-10 relative">
            <div className="flex items-center justify-center gap-6">
                <Link href="/docs" className="btn-primary text-lg px-8 py-4 flex items-center justify-center w-fit h-14">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <div className="h-14 flex items-center">
                    <StarButton size="lg" showMessage={false} />
                </div>
            </div>

            {/* Absolute positioned message to avoid layout shift */}
            {message && (
                <div className={`
                    absolute top-full left-1/2 transform -translate-x-1/2 mt-4 z-50
                    text-sm px-4 py-2 rounded-md transition-all duration-300 whitespace-nowrap
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
