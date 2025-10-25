interface Parameter {
    name: string;
    type: string;
    required: boolean;
    default: string;
    description: string;
}

interface ParametersTableProps {
    columns: string[];
    rows: Parameter[];
}

export function ParametersTable({ rows }: ParametersTableProps) {
    return (
        <div className="space-y-4">
            {rows.map((param, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                            {param.name}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 font-mono">
                            {param.type}
                        </span>
                        {param.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Required
                            </span>
                        )}
                        {!param.required && param.default && param.default !== '-' && param.default.trim() !== '' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Default: {param.default}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {param.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
