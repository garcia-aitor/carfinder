"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/endpoints";
import { setAuthToken } from "@/lib/auth/auth-store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/cars";
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: (data) => {
      setAuthToken(data.accessToken);
      router.push(redirectTo);
    },
  });

  const errorMessage = useMemo(() => {
    if (!mutation.error) {
      return null;
    }
    return "Unable to sign in. Verify credentials and backend status.";
  }, [mutation.error]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Card className="w-full p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-text-primary">Sign in</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Use your credentials to browse the car catalog.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">Username</span>
            <Input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-text-secondary">Password</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin123"
              required
            />
          </label>
          {errorMessage ? <p className="text-sm text-danger">{errorMessage}</p> : null}
          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Card className="mx-auto h-72 max-w-md animate-pulse bg-surface-alt" />}>
      <LoginForm />
    </Suspense>
  );
}
