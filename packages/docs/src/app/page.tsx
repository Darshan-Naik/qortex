import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { BundleSize } from '@/components/BundleSize'
import { QuickStart } from '@/components/QuickStart'
import { CTA } from '@/components/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <BundleSize />
      <QuickStart />
      <CTA />
    </>
  )
}