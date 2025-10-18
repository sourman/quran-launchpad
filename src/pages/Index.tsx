import { useEffect } from "react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { IntegrationShowcase } from "@/components/landing/IntegrationShowcase";
import { WhiteLabelDemo } from "@/components/landing/WhiteLabelDemo";
import { CTASection } from "@/components/landing/CTASection";
import { defaultConfig, applyWhiteLabelTheme } from "@/config/whitelabel";

const Index = () => {
  useEffect(() => {
    // Apply white-label theme on mount
    applyWhiteLabelTheme(defaultConfig);
  }, []);

  return (
    <div className="min-h-screen">
      <Hero 
        institutionName={defaultConfig.institutionName}
        tagline={defaultConfig.tagline}
      />
      <Features />
      <IntegrationShowcase />
      <WhiteLabelDemo />
      <CTASection />
    </div>
  );
};

export default Index;