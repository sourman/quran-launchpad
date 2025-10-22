import { Button } from "@/components/ui/button";
import { BookOpen, Video, Calendar, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  institutionName: string;
  tagline: string;
}

export const Hero = ({ institutionName, tagline }: HeroProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-subtle overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAxMGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6bTAgMTBjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0xMC0yMGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6bTAgMTBjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0wIDEwYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMTAtMjBjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTQgMS43OS00IDQtNCA0IDEuNzkgNCA0em0wIDEwYzAgMi4yMS0xLjc5IDQtNCA0cy00LTEuNzktNC00IDEuNzktNCA0LTQgNCAxLjc5IDQgNHptMCAxMGMwIDIuMjEtMS43OSA0LTQgNHMtNC0xLjc5LTQtNCAxLjc5LTQgNC00IDQgMS43OSA0IDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10 backdrop-blur-sm">
              <BookOpen className="w-16 h-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary-glow to-accent">
            The All-in-One Platform for Islamic Educational Institutions
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Empower your institution with a complete white-label solution. CRM, scheduling, video integrations, and marketplace—all under your brand.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
              onClick={() => navigate("/institution-signup")}
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2"
              onClick={() => navigate("/demo")}
            >
              View Demo Institution
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
              <Video className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Multi-Platform Video</h3>
              <p className="text-sm text-muted-foreground">Integrate with Zoom, Google Meet, MS Teams for live classes</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
              <Users className="w-10 h-10 text-accent mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Complete CRM</h3>
              <p className="text-sm text-muted-foreground">Manage students, instructors, leads, and operations in one place</p>
            </div>
            
            <div className="p-6 rounded-lg bg-card/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all">
              <BookOpen className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">White-Label Ready</h3>
              <p className="text-sm text-muted-foreground">Your brand, your colors, your domain—fully customizable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};