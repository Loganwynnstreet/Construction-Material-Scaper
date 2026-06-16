"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { HardHat } from "lucide-react";
import { Card, CardBody, Field, Input, Button } from "../../components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardBody className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded bg-primary">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-semibold leading-none">Construction OS</div>
              <div className="text-xs text-fg-faint">Sign in</div>
            </div>
          </div>
          {sent ? (
            <p className="text-base text-fg-muted">Check your email for a magic link to sign in.</p>
          ) : (
            <form onSubmit={signIn} className="space-y-3">
              <Field label="Work email" error={error}>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.co.nz"
                />
              </Field>
              <Button type="submit" variant="primary" size="md" className="w-full">
                Send magic link
              </Button>
            </form>
          )}
          <p className="mt-4 text-xs text-fg-faint">Powered by Supabase Auth.</p>
        </CardBody>
      </Card>
    </div>
  );
}
