import { iconMap, calloutVariants } from './constants';

interface CalloutProps {
    type: 'info' | 'warning' | 'error' | 'success';
    title?: string;
    content: string;
    icon?: keyof typeof iconMap;
}

export function Callout({ type, title, content, icon }: CalloutProps) {
    const IconComponent = icon 
        ? (iconMap[icon] || iconMap['info'])
        : (iconMap[type as keyof typeof iconMap] || iconMap['info']);

    return (
        <div className={`rounded-lg border p-4 ${calloutVariants[type]}`}>
            <div className="flex items-start">
                <IconComponent className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                    {title && (
                        <h4 className="font-semibold mb-1">{title}</h4>
                    )}
                    <p className="text-sm leading-relaxed">{content}</p>
                </div>
            </div>
        </div>
    );
}
