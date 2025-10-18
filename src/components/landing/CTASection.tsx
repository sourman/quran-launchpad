import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 px-4 gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
          Ready to Launch Your Quran Academy?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
          Get your fully-branded platform with integrated payments, scheduling, and CRM in minutes.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg font-semibold hover:scale-105 transition-transform"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg font-semibold bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20"
          >
            Schedule a Demo
          </Button>
        </div>
        
        <p className="mt-8 text-primary-foreground/80">
          No credit card required • Setup in 5 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
};