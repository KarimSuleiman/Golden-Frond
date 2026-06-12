import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car as CarIcon, Package, Ship, ExternalLink, Mail } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { Link, Redirect } from "wouter";
import logoImage from "@assets/image_1769171762465.png";
import type { Car } from "@shared/schema";

export default function MyCars() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, language, dir } = useLanguage();

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string; isTrader: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const { data: cars, isLoading, error } = useQuery<Car[]>({
    queryKey: ["/api/trader/cars"],
    enabled: !!user && authInfo?.isTrader === true,
  });

  if (!isAuthLoading && !user) {
    return <Redirect to="/login" />;
  }

  if (authInfo && !authInfo.isTrader) {
    return <Redirect to="/" />;
  }

  if (isAuthLoading || isLoading || !authInfo) {
    return <MyCarsSkeleton />;
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Purchased": return t("car.status.purchased");
      case "Reserved": return t("car.status.reserved");
      case "In Transit": return t("car.status.inTransit");
      default: return status;
    }
  };

  const statusColors: Record<string, string> = {
    "Purchased": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4" data-testid="text-my-cars-title">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.welcome")} {user?.firstName || t("dashboard.welcomeSuffix")} dd
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.errorLoading")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{t("dashboard.errorDesc")}</p>
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <Link key={car.id} href={`/car/${car.id}`}>
                <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group" data-testid={`card-car-${car.id}`}>
                  <div className="relative aspect-video overflow-hidden bg-secondary">
                    <img
                      src={car.imageUrl || ""}
                      alt={[car.make, car.model].filter(Boolean).join(" ") || t("dashboard.vehicle")}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-car.svg"; }}
                    />
                    <Badge
                      className={`absolute top-3 ${language === "ar" ? "right-3" : "left-3"} border shadow-sm ${statusColors[car.status] || "bg-gray-100 text-gray-700"}`}
                      data-testid={`badge-status-${car.id}`}
                    >
                      {getStatusLabel(car.status)}
                    </Badge>
                    {car.images && car.images.length > 0 && (
                      <div className={`absolute bottom-2 ${language === "ar" ? "left-2" : "right-2"} bg-black/60 text-white text-xs px-2 py-1 rounded-md`}>
                        {car.images.length + 1}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-bold text-foreground text-lg">
                      {car.make} {car.model} <span className="text-muted-foreground font-normal">{car.year}</span>
                    </h3>
                    {car.price && (
                      <p className="text-primary font-bold text-xl" data-testid={`text-car-price-${car.id}`}>
                        ${car.price.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      {car.containerNumber && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {car.containerNumber}
                        </span>
                      )}
                      {car.bookingNumber && (
                        <span className="flex items-center gap-1">
                          <Ship className="w-3.5 h-3.5" />
                          {car.bookingNumber}
                        </span>
                      )}
                      {car.trackingUrl && (
                        <span className="flex items-center gap-1 text-primary">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t("carDetail.openLink")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <CarIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-no-cars">
              {t("dashboard.noCarsTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {t("dashboard.noCars")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("dashboard.contactSupport")}
            </p>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt={t("common.altLogo")} className="h-12 w-auto" />
              </div>
              <p className="text-lg font-display font-bold text-foreground">{t("footer.trackingTagline")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.trackingDesc")}</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all" data-testid="footer-whatsapp">
                  <SiWhatsapp className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all" data-testid="footer-facebook">
                  <SiFacebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">{t("footer.quickLinks")}</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.home")}</a></li>
                <li><a href="/cars-for-sale" className="text-muted-foreground hover:text-foreground transition-colors">{t("nav.carsForSale")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">{t("footer.contactUs")}</h3>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href="mailto:amairehkareem@gmail.com" className="text-foreground hover:text-primary transition-colors text-sm" dir="ltr">amairehkareem@gmail.com</a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2">
                    <SiWhatsapp className="w-4 h-4 text-muted-foreground" />
                    <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors text-sm" dir="ltr">+962-796796108</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t("landing.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MyCarsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-border bg-card" />
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-4 bg-secondary" />
        <Skeleton className="h-6 w-96 mb-12 bg-secondary" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-md bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}
