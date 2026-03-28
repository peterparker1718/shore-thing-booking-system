import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, LogIn, UserPlus, Shield, Phone, Mail, Loader2 } from "lucide-react";

interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
}

export default function Account() {
  const { toast } = useToast();
  const [user, setUser] = useState<AuthUser | null>(null);

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", {
        username: loginUsername,
        password: loginPassword,
      });
      return (await res.json()) as AuthUser;
    },
    onSuccess: (data) => {
      setUser(data);
      toast({ title: "Welcome back", description: `Signed in as ${data.fullName}` });
    },
    onError: (err: Error) => {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/register", {
        username: signupUsername,
        password: signupPassword,
        fullName: signupName,
        email: signupEmail,
        phone: signupPhone,
        role: "customer",
      });
      return (await res.json()) as AuthUser;
    },
    onSuccess: (data) => {
      setUser(data);
      toast({ title: "Account created", description: `Welcome, ${data.fullName}` });
    },
    onError: (err: Error) => {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    },
  });

  // Logged-in profile
  if (user) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(213,55%,20%)]">
                <User className="h-7 w-7 text-white" />
              </div>
              <h2 className="mt-3 text-lg font-semibold" data-testid="text-user-name">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>

              <div className="mt-5 w-full space-y-3 text-left">
                <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2.5">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm capitalize">{user.role}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setUser(null)}
                className="mt-6 w-full"
                data-testid="button-logout"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth forms
  return (
    <div className="mx-auto max-w-[420px] px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold" data-testid="text-account-title">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in or create an account to manage your rides.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="login-user" className="text-xs text-muted-foreground">Username</Label>
                <Input
                  id="login-user"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Your username"
                  className="mt-1 h-10"
                  data-testid="input-login-username"
                />
              </div>
              <div>
                <Label htmlFor="login-pass" className="text-xs text-muted-foreground">Password</Label>
                <Input
                  id="login-pass"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Password"
                  className="mt-1 h-10"
                  data-testid="input-login-password"
                />
              </div>
              <Button
                onClick={() => loginMutation.mutate()}
                disabled={!loginUsername || !loginPassword || loginMutation.isPending}
                className="w-full bg-[hsl(213,55%,20%)] text-white hover:bg-[hsl(213,55%,25%)]"
                data-testid="button-login"
              >
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="mt-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1 h-10"
                  data-testid="input-signup-name"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1 h-10"
                  data-testid="input-signup-email"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone (optional)</Label>
                <Input
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="(732) 555-0100"
                  className="mt-1 h-10"
                  data-testid="input-signup-phone"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Username</Label>
                <Input
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="mt-1 h-10"
                  data-testid="input-signup-username"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="mt-1 h-10"
                  data-testid="input-signup-password"
                />
              </div>
              <Button
                onClick={() => signupMutation.mutate()}
                disabled={!signupName || !signupEmail || !signupUsername || !signupPassword || signupMutation.isPending}
                className="w-full bg-[hsl(43,85%,55%)] text-[hsl(213,55%,12%)] hover:bg-[hsl(43,85%,48%)] font-semibold"
                data-testid="button-signup"
              >
                {signupMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
