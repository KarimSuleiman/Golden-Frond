import { useAuth } from "@/hooks/use-auth";
import { useCars } from "@/hooks/use-cars";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CarFront, Mail } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: cars, isLoading: isCarsLoading, error } = useCars();
  const { t, dir } = useLanguage();

  if (!isAuthLoading && !user) {
    window.location.href = "/api/login";
    return null;
  }

  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.welcome")} {user?.firstName || t("dashboard.welcomeSuffix")}
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 rounded-3xl border border-destructive/20 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t("dashboard.errorLoading")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("dashboard.errorDesc")}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              {t("dashboard.retry")}
            </Button>
          </div>
        ) : isCarsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl bg-secondary" />
                <Skeleton className="h-8 w-3/4 bg-secondary" />
                <Skeleton className="h-4 w-1/2 bg-secondary" />
              </div>
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car, idx) => (
              <CarCard key={car.id} car={car} index={idx} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-3xl border border-border border-dashed shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <CarFront className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {t("dashboard.noCarsTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {t("dashboard.noCars")} {t("dashboard.contactSupport")}
            </p>
            <div className="flex gap-4">
              <Button variant="outline">
                {t("dashboard.contactUs")}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoImage}
                  alt={t("common.altLogo")}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                {t("footer.trackingTagline")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("footer.trackingDesc")}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/962796796108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all"
                  data-testid="footer-whatsapp"
                >
                  <SiWhatsapp className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/golden.frond.gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all"
                  data-testid="footer-facebook"
                >
                  <SiFacebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-foreground mb-4">
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-home">
                    {t("footer.home")}
                  </a>
                </li>
                <li>
                  <a href="/#about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">
                    {t("footer.aboutUs")}
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-dashboard">
                    {t("nav.dashboard")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-bold text-foreground mb-4">
                {t("footer.contactUs")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <span className="text-xs text-muted-foreground block mb-1">{t("contact.email")}</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href="mailto:amairehkareem@gmail.com" 
                      className="text-foreground hover:text-primary transition-colors text-sm"
                      dir="ltr"
                      data-testid="footer-contact-email"
                    >
                      amairehkareem@gmail.com
                    </a>
                  </div>
                </li>
                <li>
                  <span className="text-xs text-muted-foreground block mb-1">{t("contact.whatsapp")}</span>
                  <div className="flex items-center gap-2">
                    <SiWhatsapp className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href="https://wa.me/962796796108" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors text-sm"
                      dir="ltr"
                      data-testid="footer-contact-whatsapp"
                    >
                      +962-796796108
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t("landing.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-border bg-card" />
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-4 bg-secondary" />
        <Skeleton className="h-6 w-96 mb-12 bg-secondary" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}
