import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart3, Video, MessageSquare, CreditCard } from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Track student progress, attendance, and performance with built-in CRM",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated booking system powered by Calendly integration",
    },
    {
      icon: Video,
      title: "Multi-Platform Video",
      description: "Choose between Zoom, Google Meet, or Microsoft Teams",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track enrollment, revenue, and student engagement metrics",
    },
    {
      icon: MessageSquare,
      title: "Lead Management",
      description: "Capture and nurture leads with integrated CRM tools",
    },
    {
      icon: CreditCard,
      title: "Stripe Marketplace",
      description: "Secure payment processing with automatic teacher payouts",
    },
  ];

  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Run Your Academy</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete platform designed specifically for Quran teaching institutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};