import React from 'react';
import { Brain, BrainCircuit, Database, Layers } from 'lucide-react';

interface IconProps extends React.ComponentProps<typeof Brain> {
    className?: string;
}

// "The Core Mind" - Represents qortex-core
export function CoreIcon({ className, ...props }: IconProps) {
    return <Brain className={className} {...props} />;
}

// "The Synapse" - Represents qortex-react
export function ReactIcon({ className, ...props }: IconProps) {
    return <BrainCircuit className={className} {...props} />;
}

// "The Memory" - Represents qortex-db
export function DbIcon({ className, strokeWidth, ...props }: IconProps) {
    // We separate strokeWidth so we can manipulate it for the smaller inner icon
    const sw = strokeWidth ? Number(strokeWidth) : 2;

    return (
        <div className={`relative inline-flex items-center justify-center ${className || ''}`} {...props as any}>
            <Brain className="w-full h-full" strokeWidth={strokeWidth} />

            {/* Database Badge */}
            {/* 
                We use a percentage-based badge to scale with the icon.
                -bottom-[5%] puts it slightly overlapping the bottom edge.
                w-[60%] gives it substantial presence.
             */}
            <div className="absolute -bottom-[5%] -right-[5%] w-[60%] h-[60%] flex items-center justify-center">
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    {/* 
                        CRITICAL FIX: 
                        Hardcoded text-indigo-600 to ensure the database icon is visible 
                        against the white badge background, avoiding white-on-white.
                     */}
                    <Database className="w-[60%] h-[60%] text-indigo-600" strokeWidth={sw + 0.5} />
                </div>
            </div>
        </div>
    );
}

// "The Vault" - Represents qortex-store
export function StoreIcon({ className, strokeWidth, ...props }: IconProps) {
    const sw = strokeWidth ? Number(strokeWidth) : 2;

    return (
        <div className={`relative inline-flex items-center justify-center ${className || ''}`} {...props as any}>
            <Brain className="w-full h-full" strokeWidth={strokeWidth} />
            <div className="absolute -bottom-[5%] -right-[5%] w-[60%] h-[60%] flex items-center justify-center">
                <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    <Layers className="w-[60%] h-[60%] text-emerald-600" strokeWidth={sw + 0.5} />
                </div>
            </div>
        </div>
    );
}

