import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Loader2, Car, Lock, Mail, Eye, EyeOff, Globe } from "lucide-react";
import logoImage from "@assets/image_1769171762465.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language, setLanguage, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || t("login.failed"));
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t("login.welcome"),
        description: t("login.success"),
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: t("login.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: t("common.error"),
        description: t("login.enterCredentials"),
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-between items-start">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleLanguage}
              className="text-muted-foreground hover:text-primary"
              data-testid="button-language-toggle-login"
            >
              <Globe className="w-4 h-4" />
              <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("common.langToggle")}</span>
            </Button>
            <img src={logoImage} alt={t("common.altLogo")} className="h-20 w-auto mx-auto" />
            <div className="w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">{t("login.title")}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("login.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t("login.email")}</Label>
              <div className="relative">
                <Mail className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={language === "ar" ? "pr-10 text-left" : "pl-10 text-left"}
                  dir="ltr"
                  data-testid="input-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">{t("login.password")}</Label>
              <div className="relative">
                <Lock className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={language === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground font-bold text-lg py-6"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className={`h-5 w-5 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("login.loading")}
                </>
              ) : (
                <>
                  <Car className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("login.submit")}
                </>
              )}
            </Button>

            <div className="text-center">
              <a 
                href="/forgot-password" 
                className="text-sm text-primary hover:underline"
                data-testid="link-forgot-password"
              >
                {t("forgot.title")}
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
