import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCars } from "@/hooks/use-cars";
import { Navbar } from "@/components/Navbar";
import { CarCard } from "@/components/CarCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, CarFront } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: cars, isLoading: isCarsLoading, error } = useCars();

  // Redirect if not logged in is handled by App router usually, but safe guard here
  if (!isAuthLoading && !user) {
    window.location.href = "/api/login";
    return null;
  }

  if (isAuthLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            My <span className="text-primary">Garage</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.firstName || 'Valued Client'}. Here are your exclusive vehicles.
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-destructive/5 rounded-3xl border border-destructive/20 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to Load Garage</h3>
            <p className="text-muted-foreground mb-6">We encountered an issue fetching your vehicles.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry Connection</Button>
          </div>
        ) : isCarsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
                <Skeleton className="h-8 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
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
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card/50 rounded-3xl border border-white/5 border-dashed">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <CarFront className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Garage Empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              You don't have any vehicles linked to your account yet. Please contact our sales team if you believe this is an error.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-white/5 bg-black/20 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Al-Saafa Al-Thahabeya. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-white/10 bg-card/50" />
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-4 bg-white/5" />
        <Skeleton className="h-6 w-96 mb-12 bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
