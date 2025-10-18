import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const IntegrationShowcase = () => {
  const integrations = [
    {
      name: "Calendly",
      description: "Seamless booking system for scheduling classes",
      icon: "📅",
      link: "https://calendly.com",
    },
    {
      name: "Zoom",
      description: "High-quality video conferencing for classes",
      icon: "🎥",
      link: "https://zoom.us",
    },
    {
      name: "Google Meet",
      description: "Simple and secure video meetings",
      icon: "📹",
      link: "https://meet.google.com",
    },
    {
      name: "Microsoft Teams",
      description: "Professional video collaboration platform",
      icon: "💼",
      link: "https://teams.microsoft.com",
    },
    {
      name: "Google Calendar",
      description: "Sync all your classes and schedules",
      icon: "📆",
      link: "https://calendar.google.com",
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powered by Industry Leaders</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We integrate with the best tools to provide you with a seamless learning experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {integrations.map((integration) => (
            <Card key={integration.name} className="hover:shadow-elegant transition-all duration-300 group">
              <CardHeader>
                <div className="text-5xl mb-4">{integration.icon}</div>
                <CardTitle className="flex items-center justify-between">
                  {integration.name}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => window.open(integration.link, '_blank')}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};