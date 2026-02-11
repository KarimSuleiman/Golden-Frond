import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Mail } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import logoImage from "@assets/image_1769171762465.png";
import type { Listing } from "@shared/schema";

interface FavoriteWithListing {
  id: number;
  listingId: number;
  listing: Listing;
}

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, language, dir } = useLanguage();

  const { data: favorites, isLoading: isFavLoading } = useQuery<FavoriteWithListing[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    enabled: !!user,
  });

  if (!isAuthLoading && !user) {
    window.location.href = "/login";
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
            {t("dashboard.favorites")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.welcome")} {user?.firstName || t("dashboard.welcomeSuffix")}
          </p>
        </div>

        {isFavLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-md bg-secondary" />
                <Skeleton className="h-8 w-3/4 bg-secondary" />
                <Skeleton className="h-4 w-1/2 bg-secondary" />
              </div>
            ))}
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((fav) => (
              <Link key={fav.id} href={`/listing/${fav.listingId}`}>
                <Card className="overflow-hidden cursor-pointer hover-elevate transition-all" data-testid={`card-favorite-${fav.id}`}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={fav.listing.imageUrl}
                      alt={[fav.listing.make, fav.listing.model].filter(Boolean).join(" ")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-bold text-foreground text-lg">
                      {[fav.listing.make, fav.listing.model, fav.listing.year].filter(Boolean).join(" ")}
                    </p>
                    {fav.listing.price && (
                      <p className="text-primary font-bold mt-1">
                        {fav.listing.price.toLocaleString()} {t("marketplace.currency")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                      <span>{t("marketplace.saved")}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {t("dashboard.noFavoritesTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {t("dashboard.noFavorites")}
            </p>
            <Link href="/cars-for-sale">
              <Button data-testid="button-browse-cars">
                {t("dashboard.browseCars")}
              </Button>
            </Link>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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
                  <a href="/cars-for-sale" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-cars-for-sale">
                    {t("nav.carsForSale")}
                  </a>
                </li>
              </ul>
            </div>

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

          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("landing.copyright")}
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
            <Skeleton key={i} className="h-80 w-full rounded-md bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}
