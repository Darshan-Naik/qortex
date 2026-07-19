import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://qortex.dev'

    const formSlugs = [
        'installation',
        'quick-start',
        'concepts',
        'createForm',
        'validation',
        'zodResolver',
        'persist',
        'fields-arrays',
        'alpha-limitations',
    ]

    const formReactSlugs = [
        'installation',
        'quick-start',
        'useForm',
        'FormProvider',
        'useField',
        'useFieldArray',
        'sharing-patterns',
        'useFormQuery',
        'useFormMutation',
        'useFormStore',
        'recipes',
    ]

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/docs`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/docs/installation`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/store`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/store/docs/installation`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/store/docs/quick-start`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/store/docs/createStore`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/store-react`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/store-react/docs/installation`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/store-react/docs/quick-start`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/form`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...formSlugs.map((slug) => ({
            url: `${baseUrl}/form/docs/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        {
            url: `${baseUrl}/form-react`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...formReactSlugs.map((slug) => ({
            url: `${baseUrl}/form-react/docs/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ]
}
