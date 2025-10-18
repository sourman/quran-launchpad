import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const WhiteLabelDemo = () => {
  const [institutionName, setInstitutionName] = useState("Quran Academy");
  const [tagline, setTagline] = useState("Learn Quran Online with Expert Teachers");

  const handlePreview = () => {
    toast.success("Preview Updated!", {
      description: `Your institution: ${institutionName}`,
    });
    // In production, this would update the white-label config
  };

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">White-Label Ready</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Customize the platform with your institution's branding in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Platform</CardTitle>
              <CardDescription>
                See how easy it is to make this platform your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input
                  id="institution"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Enter your institution name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Enter your tagline"
                />
              </div>
              
              <Button onClick={handlePreview} className="w-full gradient-primary">
                Preview Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="gradient-subtle">
            <CardHeader>
              <CardTitle>What You Can Customize</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Institution Name & Logo",
                  "Brand Colors & Theme",
                  "Custom Domain Name",
                  "Contact Information",
                  "Video Provider Preference",
                  "Calendar Integration",
                  "Payment Gateway Settings",
                  "Email Templates",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};