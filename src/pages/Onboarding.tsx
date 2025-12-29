import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, Settings } from "lucide-react";

// Reserved subdomains that cannot be used
const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'app', 'mail', 'email', 'ftp', 'blog', 'shop', 
  'store', 'support', 'help', 'docs', 'cdn', 'assets', 'static', 'media',
  'dashboard', 'panel', 'console', 'login', 'auth', 'account', 'profile'
];

const onboardingSchema = z.object({
  institutionName: z.string().trim().min(2, "Institution name must be at least 2 characters").max(100),
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  subdomain: z.string()
    .trim()
    .optional()
    .refine((val) => !val || (val.length >= 3 && val.length <= 30), {
      message: "Subdomain must be between 3 and 30 characters"
    })
    .refine((val) => !val || /^[a-z0-9]+$/.test(val), {
      message: "Subdomain can only contain lowercase letters and numbers"
    })
    .refine((val) => !val || !RESERVED_SUBDOMAINS.includes(val), {
      message: "This subdomain is reserved and cannot be used"
    }),
});

const Onboarding = () => {
  const [formData, setFormData] = useState({ institutionName: "", fullName: "", subdomain: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // If already onboarded, go to dashboard
      const userId = session.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("institution_id, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.institution_id) {
        navigate("/dashboard");
        return;
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = onboardingSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check subdomain availability if provided
      if (formData.subdomain) {
        const { data: existingInstitution, error: checkError } = await supabase
          .from("institutions")
          .select("id")
          .eq("subdomain", formData.subdomain)
          .maybeSingle();

        if (checkError) {
          console.error("Subdomain check error:", checkError);
          throw new Error("Failed to check subdomain availability");
        }

        if (existingInstitution) {
          setErrors({ subdomain: "This subdomain is already taken. Please choose another one." });
          return;
        }
      }

      // 1) Create institution
      const institutionData: any = { 
        name: formData.institutionName, 
        contact_email: session.user.email 
      };
      
      if (formData.subdomain) {
        institutionData.subdomain = formData.subdomain;
      }

      const { data: institution, error: instErr } = await supabase
        .from("institutions")
        .insert(institutionData)
        .select()
        .single();
      if (instErr) throw instErr;

      // 2) Create profile (retry once for FK races)
      let profileError: any = null;
      {
        const { error } = await supabase
          .from("profiles")
          .insert({ id: session.user.id, institution_id: institution.id, full_name: formData.fullName });
        profileError = error;
      }
      if (profileError?.code === "23503") {
        await new Promise((r) => setTimeout(r, 600));
        const { error: retryErr } = await supabase
          .from("profiles")
          .insert({ id: session.user.id, institution_id: institution.id, full_name: formData.fullName });
        profileError = retryErr;
      }
      if (profileError) throw profileError;

      // 3) Assign role
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: session.user.id, role: "institution_admin", institution_id: institution.id });
      if (roleErr) throw roleErr;

      const successMessage = formData.subdomain 
        ? `Your institution has been created at ${formData.subdomain}.yourapp.com`
        : "Your institution has been created.";
      
      toast({ title: "Setup complete", description: successMessage });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({ variant: "destructive", title: "Setup failed", description: error.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
          </div>
          <CardDescription>
            Tell us about your institution to finish creating your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                placeholder="e.g., Al-Azhar University"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                disabled={submitting}
              />
              {errors.institutionName && (
                <p className="text-sm text-destructive">{errors.institutionName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Your Full Name</Label>
              <Input
                id="fullName"
                placeholder="e.g., Ahmed Hassan"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={submitting}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Custom Subdomain (Optional)</Label>
              <div className="space-y-1">
                <Input
                  id="subdomain"
                  placeholder="e.g., madinahacademy"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                  disabled={submitting}
                />
                {formData.subdomain && (
                  <p className="text-xs text-muted-foreground">
                    Your institution will be available at: <span className="font-medium">{formData.subdomain}.yourapp.com</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Leave empty to set up later. Only lowercase letters and numbers allowed.
                </p>
              </div>
              {errors.subdomain && (
                <p className="text-sm text-destructive">{errors.subdomain}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing setup...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;


