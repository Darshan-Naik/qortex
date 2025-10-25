import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { BundleSize } from '@/components/BundleSize'
import { Footer } from '@/components/Footer'
import { generateMetadata as generateSEOMetadata, seoConfigs } from '@/lib/seo'

export const metadata = generateSEOMetadata(seoConfigs.home)

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <BundleSize />
      <Footer />
    </>
  )
}