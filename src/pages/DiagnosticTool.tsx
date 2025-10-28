import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const DiagnosticTool = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: [],
    };

    try {
      // Check 1: Authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      diagnostics.checks.push({
        name: "Authentication",
        status: session ? "pass" : "fail",
        details: session ? `Logged in as: ${session.user.email}` : "Not logged in",
        data: session ? { userId: session.user.id, email: session.user.email } : null,
        error: authError?.message,
      });

      if (session) {
        // Check 2: User Roles
        const { data: roles, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", session.user.id);

        diagnostics.checks.push({
          name: "User Roles",
          status: roles && roles.length > 0 ? "pass" : "fail",
          details: roles && roles.length > 0 
            ? `Found ${roles.length} role(s)` 
            : "No roles found for this user",
          data: roles,
          error: roleError?.message,
        });

        // Check 3: Institution
        if (roles && roles.length > 0) {
          const institutionId = roles[0].institution_id;
          const { data: institution, error: instError } = await supabase
            .from("institutions")
            .select("*")
            .eq("id", institutionId)
            .single();

          diagnostics.checks.push({
            name: "Institution",
            status: institution ? "pass" : "fail",
            details: institution 
              ? `Institution: ${institution.name}` 
              : "Institution not found",
            data: institution,
            error: instError?.message,
          });
        } else {
          diagnostics.checks.push({
            name: "Institution",
            status: "skip",
            details: "Skipped (no roles found)",
          });
        }

        // Check 4: Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        diagnostics.checks.push({
          name: "Profile",
          status: profile ? "pass" : "fail",
          details: profile 
            ? `Profile exists: ${profile.full_name}` 
            : "Profile not found",
          data: profile,
          error: profileError?.message,
        });

        // Check 5: Tables exist
        const { data: classes, error: classError } = await supabase
          .from("classes")
          .select("count")
          .limit(1);

        diagnostics.checks.push({
          name: "Classes Table",
          status: classError ? "fail" : "pass",
          details: classError 
            ? "Classes table not accessible" 
            : "Classes table exists",
          error: classError?.message,
        });

        const { data: students, error: studentError } = await supabase
          .from("students")
          .select("count")
          .limit(1);

        diagnostics.checks.push({
          name: "Students Table",
          status: studentError ? "fail" : "pass",
          details: studentError 
            ? "Students table not accessible" 
            : "Students table exists",
          error: studentError?.message,
        });
      }
    } catch (error: any) {
      diagnostics.checks.push({
        name: "General Error",
        status: "fail",
        details: error.message,
        error: error.message,
      });
    }

    setResults(diagnostics);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "fail") return <XCircle className="h-5 w-5 text-red-500" />;
    return <div className="h-5 w-5 rounded-full bg-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>QuranPlace Diagnostic Tool</CardTitle>
            <CardDescription>
              Check your database setup and user configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                "Run Diagnostics"
              )}
            </Button>

            {results && (
              <div className="space-y-4 mt-6">
                <Alert>
                  <AlertDescription>
                    Diagnostics completed at {new Date(results.timestamp).toLocaleString()}
                  </AlertDescription>
                </Alert>

                {results.checks.map((check: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <CardTitle className="text-lg">{check.name}</CardTitle>
                          <CardDescription>{check.details}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {(check.data || check.error) && (
                      <CardContent>
                        {check.error && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertDescription>
                              <strong>Error:</strong> {check.error}
                            </AlertDescription>
                          </Alert>
                        )}
                        {check.data && (
                          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                            {JSON.stringify(check.data, null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))}

                {/* Recommendations */}
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.checks.find((c: any) => c.name === "User Roles" && c.status === "fail") && (
                      <Alert>
                        <AlertDescription>
                          <strong>Missing Role:</strong> You need to add an institution_admin role.
                          <br />
                          Go to Supabase Dashboard → SQL Editor and run:
                          <pre className="bg-muted p-2 rounded mt-2 text-xs">
{`INSERT INTO public.user_roles (user_id, role, institution_id)
VALUES (
  '${results.checks.find((c: any) => c.name === "Authentication")?.data?.userId}',
  'institution_admin',
  'YOUR_INSTITUTION_ID'
);`}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    )}
                    {results.checks.find((c: any) => c.name === "Classes Table" && c.status === "fail") && (
                      <Alert>
                        <AlertDescription>
                          <strong>Missing Tables:</strong> Run migrations in Supabase.
                          <br />
                          Command: <code>supabase db push</code>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticTool;
