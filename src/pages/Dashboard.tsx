import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Copy, Loader2, LogOut, Plus, Users } from "lucide-react";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().trim().min(2, "Class name must be at least 2 characters").max(100),
  monthlyPrice: z.number().min(0.01, "Price must be greater than 0"),
});

interface Class {
  id: string;
  name: string;
  monthly_price: number;
  stripe_payment_link: string;
  student_count?: number;
}

interface Institution {
  id: string;
  name: string;
  logo_url: string | null;
}

const Dashboard = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", monthlyPrice: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      await loadInstitution(session.user.id);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    }
  };

  const loadInstitution = async (userId: string) => {
    try {
      // Get user's institution
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("institution_id")
        .eq("user_id", userId)
        .eq("role", "institution_admin")
        .single();

      if (roleError || !roles) {
        throw new Error("No institution found for user");
      }

      const { data: inst, error: instError } = await supabase
        .from("institutions")
        .select("*")
        .eq("id", roles.institution_id)
        .single();

      if (instError || !inst) {
        throw new Error("Institution not found");
      }

      setInstitution(inst);
      await loadClasses(inst.id);
    } catch (error) {
      console.error("Error loading institution:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load institution data",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async (institutionId: string) => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select(`
          *,
          students(count)
        `)
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const classesWithCount = data?.map((cls: any) => ({
        ...cls,
        student_count: cls.students?.[0]?.count || 0,
      })) || [];

      setClasses(classesWithCount);
    } catch (error) {
      console.error("Error loading classes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Payment link copied to clipboard",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = classSchema.safeParse({
      name: formData.name,
      monthlyPrice: parseFloat(formData.monthlyPrice),
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    if (!institution) return;

    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-class`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            className: formData.name,
            monthlyPrice: parseFloat(formData.monthlyPrice),
            institutionId: institution.id,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create class");
      }

      toast({
        title: "Success!",
        description: "Class created successfully",
      });

      setDialogOpen(false);
      setFormData({ name: "", monthlyPrice: "" });
      await loadClasses(institution.id);
    } catch (error: any) {
      console.error("Error creating class:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create class",
      });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {institution?.logo_url ? (
              <img src={institution.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{institution?.name}</h1>
              <p className="text-xs text-muted-foreground">Institution Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Your Classes</h2>
            <p className="text-muted-foreground">Manage subscription-based classes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Add a new subscription-based class. A Stripe payment link will be generated automatically.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sharh Al-Bukhari"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (USD)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 30.00"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                    disabled={submitting}
                  />
                  {formErrors.monthlyPrice && (
                    <p className="text-sm text-destructive">{formErrors.monthlyPrice}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Class"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first class to start accepting student subscriptions
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>View and manage your subscription classes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Payment Link</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow
                      key={cls.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/dashboard/class/${cls.id}`)}
                    >
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>${cls.monthly_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(cls.stripe_payment_link);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{cls.student_count || 0}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
