# qortex Documentation Site

This is the official documentation and brand site for qortex, built with Next.js 14 and optimized for SEO.

## Features

- 🚀 **Next.js 14** with App Router
- 🎨 **Tailwind CSS** for styling
- 📱 **Responsive Design** for all devices
- 🔍 **SEO Optimized** with meta tags and structured data
- ⚡ **Server-Side Rendering** for better performance
- 🎯 **TypeScript** for type safety
- 📊 **Analytics Ready** for tracking

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── docs/           # Documentation pages
│   ├── examples/       # Example pages
│   ├── blog/           # Blog pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Homepage
│   ├── robots.ts       # Robots.txt
│   └── sitemap.ts      # Sitemap
├── components/         # Reusable components
│   ├── Header.tsx      # Site header
│   ├── Footer.tsx      # Site footer
│   ├── Hero.tsx        # Hero section
│   ├── Features.tsx    # Features section
│   ├── QuickStart.tsx  # Quick start section
│   ├── Examples.tsx    # Examples section
│   ├── Stats.tsx       # Statistics section
│   └── CTA.tsx         # Call-to-action section
└── lib/                # Utility functions
```

## Deployment

The site is configured for static export and can be deployed to any static hosting service:

- Vercel (recommended)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## SEO Features

- Meta tags optimization
- Open Graph tags
- Twitter Card tags
- Structured data
- Sitemap generation
- Robots.txt
- Canonical URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

LGPL-3.0 License - see [LICENSE](../../LICENSE) file for details.