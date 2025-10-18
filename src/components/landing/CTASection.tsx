import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-4 gradient-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
          Ready to Launch Your Institution's Platform?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
          Join forward-thinking educational institutions already using our white-label solution
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg font-semibold hover:scale-105 transition-transform"
            onClick={() => navigate("/institution-signup")}
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg font-semibold bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20"
            onClick={() => navigate("/demo")}
          >
            <Calendar className="mr-2 w-5 h-5" />
            View Demo Institution
          </Button>
        </div>
        
        <p className="mt-8 text-primary-foreground/80">
          No credit card required • Setup in 5 minutes • Cancel anytime
        </p>
      </div>
    </section>
  );
};