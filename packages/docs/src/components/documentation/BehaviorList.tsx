import { iconMap } from './constants';

interface Behavior {
    title: string;
    description: string;
    icon: string;
}

interface BehaviorListProps {
    behaviors: Behavior[];
}

export function BehaviorList({ behaviors }: BehaviorListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {behaviors.map((behavior, index) => {
                const IconComponent = iconMap[behavior.icon as keyof typeof iconMap] || iconMap['info'];
                return (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{behavior.title}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{behavior.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
