import CTASection from "@/components/module/marketing/main/cta-section"
import FeaturesSection from "@/components/module/marketing/main/feature-section"
import HeroSection from "@/components/module/marketing/main/hero-section"
import InteractiveDemoSection from "@/components/module/marketing/main/interactive-section"
import PriceSection from "@/components/module/marketing/main/price-section"
import TestimonySection from "@/components/module/marketing/main/testimony-section"
import TrustedBySection from "@/components/module/marketing/main/trustedby-section"
import WorkSection from "@/components/module/marketing/main/work-section"

export default async function Page() {

  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection />
      <TrustedBySection />
      <FeaturesSection />
      <InteractiveDemoSection />
      <WorkSection />
      <TestimonySection />
      <PriceSection />
      <CTASection />
    </div>
  )
}
