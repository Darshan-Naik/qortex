import { ExternalLink, Check, Info } from 'lucide-react'

interface BundleStatsProps {
    packageName: string;
    size: string;
    minifiedSize: string;
    dependencyCount: number;
    highlightColor: string;
    sizeBreakdown?: string;
}

export function BundleStats({ packageName, size, minifiedSize, dependencyCount, highlightColor, sizeBreakdown }: BundleStatsProps) {
    // Extract number from size string (e.g. "~2KB" -> 2) for progress bar
    const sizeNum = parseFloat(size.replace(/[^0-9.]/g, ''));
    // Assume a "budget" of 10KB for the progress bar
    const percentage = Math.min((sizeNum / 10) * 100, 100);

    return (
        <section className="py-16 bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Tiny Bundle Size</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Lightweight and optimized for performance.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        {/* Main Size Stat */}
                        <div className="text-center md:text-left">
                            <div className="flex items-baseline justify-center md:justify-start">
                                <span className={`text-5xl font-bold text-${highlightColor}-600`}>{size}</span>
                                <span className="ml-2 text-gray-500 font-medium">min + gzip</span>
                            </div>
                            {sizeBreakdown && (
                                <p className="text-sm text-gray-500 mt-2 font-medium">
                                    {sizeBreakdown}
                                </p>
                            )}
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`bg-${highlightColor}-500 h-2 rounded-full`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                                {sizeNum}KB / 10KB Performance Budget
                            </p>
                        </div>

                        {/* Detailed Stats */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                <span className="text-gray-600">Minified Size</span>
                                <span className="font-mono font-medium text-gray-900">{minifiedSize}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                                <span className="text-gray-600">Dependencies</span>
                                <span className="font-mono font-medium text-gray-900">{dependencyCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tree Shaking</span>
                                <div className="flex items-center text-green-600">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span className="font-medium">Supported</span>
                                </div>
                            </div>
                        </div>

                        {/* External Link */}
                        <div className="flex flex-col items-center justify-center space-y-4">

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
