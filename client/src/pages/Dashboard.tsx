import { useAuth } from "@/hooks/use-auth";
import { useCars } from "@/hooks/use-cars";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CarFront } from "lucide-react";

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

      <footer className="py-8 border-t border-border bg-card text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("dashboard.copyright")}
        </p>
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
