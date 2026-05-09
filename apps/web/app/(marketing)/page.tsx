import FeaturesSection from "@/components/module/marketing/main/feature-section"
import HeroSection from "@/components/module/marketing/main/hero-section"
import InteractiveDemoSection from "@/components/module/marketing/main/interactive-section"
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
    </div>
  )
}
