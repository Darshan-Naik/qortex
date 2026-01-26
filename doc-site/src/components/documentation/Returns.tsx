interface ReturnsProps {
    type: string;
    description: string;
    properties?: Array<{
        name: string;
        type: string;
        description: string;
    }>;
}

export function Returns({ type, description, properties }: ReturnsProps) {
    return (
        <div className="space-y-4">
            <div className="border-l-4 border-green-200 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">
                        Returns
                    </h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-mono">
                        {type}
                    </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {description}
                </p>
            </div>
            
            {properties && properties.length > 0 && (
                <div className="ml-4 space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Properties:</h5>
                    {properties.map((prop, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-3 py-1">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                    {prop.name}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                                    {prop.type}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                {prop.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
