import { DocumentationData, ApiDocumentation, GuideDocumentation } from '@/types/documentation';
import { navigationData } from './navigation';

/**
 * Load documentation data from JSON file by slug
 */
export async function getDocumentation(slug: string): Promise<DocumentationData | null> {
    try {
        // Import the JSON file dynamically
        const data = await import(`@/data/${slug}.json`);
        return data.default as DocumentationData;
    } catch (error) {
        console.error(`Failed to load documentation for slug: ${slug}`, error);
        return null;
    }
}

/**
 * Get all available documentation slugs for static generation
 */
export function getAllDocumentationSlugs(): string[] {
    return navigationData.flatMap(section =>
        section.items.map(item => item.href.replace('/docs/', ''))
    );
}

/**
 * Check if documentation exists for a given slug
 */
export async function documentationExists(slug: string): Promise<boolean> {
    try {
        await import(`@/data/${slug}.json`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get documentation metadata without loading full content
 */
export async function getDocumentationMetadata(slug: string): Promise<{
    id: string;
    title: string;
    category: string;
    status?: string;
} | null> {
    try {
        const data = await import(`@/data/${slug}.json`);
        const doc = data.default as DocumentationData;
        return {
            id: doc.id,
            title: doc.title,
            category: doc.category,
            status: 'status' in doc ? doc.status : undefined
        };
    } catch (error) {
        console.error(`Failed to load metadata for slug: ${slug}`, error);
        return null;
    }
}

/**
 * Type guard to check if documentation is API documentation
 */
export function isApiDocumentation(doc: DocumentationData): doc is ApiDocumentation {
    return 'signature' in doc;
}

/**
 * Type guard to check if documentation is guide documentation
 */
export function isGuideDocumentation(doc: DocumentationData): doc is GuideDocumentation {
    return 'content' in doc && !('signature' in doc);
}
