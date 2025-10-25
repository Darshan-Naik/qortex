import { badgeVariants } from './constants';

interface BadgeProps {
    text: string;
    variant?: keyof typeof badgeVariants;
}

export function Badge({ text, variant = 'default' }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeVariants[variant]}`}>
            {text}
        </span>
    );
}
