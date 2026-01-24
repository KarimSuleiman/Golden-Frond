import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Loader2, Mail, ArrowLeft, ArrowRight, Key, Lock, Eye, EyeOff, Globe, CheckCircle } from "lucide-react";
import logoImage from "@assets/image_1769171762465.png";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language, setLanguage, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [resetToken, setResetToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setStep("reset");
      toast({
        title: t("forgot.tokenSent"),
        description: t("forgot.tokenSentDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; token: string; newPassword: string }) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      return res.json();
    },
    onSuccess: () => {
      setStep("success");
      toast({
        title: t("reset.success"),
        description: t("reset.successDesc"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t("common.error"),
        description: t("forgot.emailPlaceholder"),
        variant: "destructive",
      });
      return;
    }
    requestResetMutation.mutate(email);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: t("common.error"),
        description: t("reset.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("reset.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({
      email,
      token: tokenInput || resetToken,
      newPassword,
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;

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
              data-testid="button-language-toggle-forgot"
            >
              <Globe className="w-4 h-4" />
              <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("common.langToggle")}</span>
            </Button>
            <img src={logoImage} alt={t("common.altLogo")} className="h-20 w-auto mx-auto" />
            <div className="w-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {step === "success" ? t("reset.success") : step === "reset" ? t("reset.title") : t("forgot.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === "success" ? t("reset.successDesc") : step === "reset" ? t("reset.desc") : t("forgot.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "request" && (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t("forgot.email")}</Label>
                <div className="relative">
                  <Mail className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("forgot.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={language === "ar" ? "pr-10 text-left" : "pl-10 text-left"}
                    dir="ltr"
                    data-testid="input-forgot-email"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-bold text-lg py-6"
                disabled={requestResetMutation.isPending}
                data-testid="button-request-reset"
              >
                {requestResetMutation.isPending ? (
                  <>
                    <Loader2 className={`h-5 w-5 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("forgot.sending")}
                  </>
                ) : (
                  <>
                    <Key className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("forgot.submit")}
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  data-testid="link-back-to-login"
                >
                  <BackArrow className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("forgot.backToLogin")}
                </Button>
              </Link>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {resetToken && (
                <div className="p-4 bg-primary/10 rounded-lg text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t("forgot.yourCode")}</p>
                  <p className="text-3xl font-mono font-bold text-primary tracking-widest" data-testid="text-reset-token">
                    {resetToken}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("forgot.codeExpiry")}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token" className="text-foreground">{t("reset.code")}</Label>
                <div className="relative">
                  <Key className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="token"
                    type="text"
                    placeholder={t("reset.codePlaceholder")}
                    value={tokenInput || resetToken}
                    onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} text-center font-mono tracking-widest uppercase`}
                    maxLength={6}
                    data-testid="input-reset-token"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-foreground">{t("reset.newPassword")}</Label>
                <div className="relative">
                  <Lock className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("reset.newPasswordPlaceholder")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={language === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}
                    data-testid="input-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">{t("reset.confirmPassword")}</Label>
                <div className="relative">
                  <Lock className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("reset.confirmPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={language === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground font-bold text-lg py-6"
                disabled={resetPasswordMutation.isPending}
                data-testid="button-reset-password"
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className={`h-5 w-5 animate-spin ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("reset.changing")}
                  </>
                ) : (
                  <>
                    <Lock className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("reset.submit")}
                  </>
                )}
              </Button>

              <Link href="/login">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground"
                  data-testid="link-back-to-login-reset"
                >
                  <BackArrow className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("forgot.backToLogin")}
                </Button>
              </Link>
            </form>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <Link href="/login">
                <Button 
                  className="w-full bg-primary text-primary-foreground font-bold text-lg py-6"
                  data-testid="button-go-to-login"
                >
                  <BackArrow className={`h-5 w-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("forgot.backToLogin")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
