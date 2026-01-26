import {
    BrainCircuit,
    CheckCircle,
    XCircle,
    Info,
    AlertTriangle,
    Zap,
    Database,
    RefreshCw,
    Activity,
    AlertCircle,
    Trash2,
    ExternalLink
} from 'lucide-react';

export const iconMap = {
    'info': Info,
    'warning': AlertTriangle,
    'error': XCircle,
    'success': CheckCircle,
    'zap': Zap,
    'database': Database,
    'refresh-cw': RefreshCw,
    'activity': Activity,
    'alert-triangle': AlertTriangle,
    'trash-2': Trash2,
    'external-link': ExternalLink,
    'brain-circuit': BrainCircuit
};

export const badgeVariants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
};

export const calloutVariants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
};
