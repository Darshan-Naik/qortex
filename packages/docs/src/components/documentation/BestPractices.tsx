interface BestPracticesProps {
    dos: string[];
    donts: string[];
}

export function BestPractices({ dos, donts }: BestPracticesProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Do's
                </h4>
                <ul className="space-y-2">
                    {dos.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">✓</span>
                            <span className="text-sm text-gray-700">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Don'ts */}
            <div>
                <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Don'ts
                </h4>
                <ul className="space-y-2">
                    {donts.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2 mt-1">✗</span>
                            <span className="text-sm text-gray-700">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
