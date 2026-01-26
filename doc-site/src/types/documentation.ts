export interface ApiDocumentation {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    tags?: string[];
    version?: string;
    status?: 'stable' | 'beta' | 'deprecated';
    signature: {
        language: string;
        code: string;
    };
    parameters?: {
        columns: string[];
        rows: Array<{
            name: string;
            type: string;
            required: boolean;
            default: string;
            description: string;
        }>;
    };
    returns?: {
        type: string;
        description: string;
        properties?: Array<{
            name: string;
            type: string;
            description: string;
        }>;
    };
    examples: Array<{
        title: string;
        description?: string;
        language: string;
        code: string;
    }>;
    behavior?: Array<{
        title: string;
        description: string;
        icon: string;
    }>;
    bestPractices?: {
        dos: string[];
        donts: string[];
    };
    callouts?: Array<{
        type: 'info' | 'warning' | 'error' | 'success';
        title?: string;
        content: string;
        icon?: string;
    }>;
    badges?: Array<{
        text: string;
        variant: 'default' | 'success' | 'warning' | 'error' | 'info';
    }>;
    relatedPages?: string[];
    additionalSections?: Array<{
        title: string;
        icon: string;
        content: string | Array<any>;
    }>;
}

export interface GuideDocumentation {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    category: string;
    tags?: string[];
    content: string;
    callouts?: Array<{
        type: 'info' | 'warning' | 'error' | 'success';
        title?: string;
        content: string;
        icon?: string;
    }>;
    badges?: Array<{
        text: string;
        variant: 'default' | 'success' | 'warning' | 'error' | 'info';
    }>;
    sections?: Array<{
        title: string;
        content: string;
        code?: {
            language: string;
            code: string;
        };
    }>;
    relatedPages?: string[];
}

export type DocumentationData = ApiDocumentation | GuideDocumentation;
