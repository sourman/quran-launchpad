import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DemoInstitution = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Al-Azhar University</h1>
              <p className="text-xs text-muted-foreground">Online Learning Platform</p>
            </div>
          </div>
          <Button onClick={() => navigate("/institution-signup")}>Enroll Now</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to Our Learning Platform
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Access world-class Islamic education with live classes, recorded lectures, and interactive learning experiences
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg">Browse Courses</Button>
          <Button size="lg" variant="outline">View Schedule</Button>
        </div>
      </section>

      {/* Features for Students */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">What You'll Get</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Video className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Live & Recorded Classes</CardTitle>
              <CardDescription>
                Join live sessions with renowned scholars or watch recordings at your convenience
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Flexible Scheduling</CardTitle>
              <CardDescription>
                Book one-on-one sessions with instructors and manage your learning schedule
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Community Learning</CardTitle>
              <CardDescription>
                Connect with fellow students, join study groups, and participate in discussions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Comprehensive Curriculum</CardTitle>
              <CardDescription>
                Access structured courses covering Quran, Hadith, Fiqh, Arabic, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Certificates & Progress</CardTitle>
              <CardDescription>
                Earn recognized certificates and track your learning journey with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Personalized Learning</CardTitle>
              <CardDescription>
                Get recommendations based on your interests and progress at your own pace
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students already learning on our platform
            </p>
            <Button size="lg" onClick={() => navigate("/institution-signup")}>
              Get Started Today
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              This is a demo of what your institution's page could look like
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default DemoInstitution;
