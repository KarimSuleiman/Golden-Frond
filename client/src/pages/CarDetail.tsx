import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  ArrowLeft,
  Calendar, 
  Palette, 
  Fingerprint, 
  Ship, 
  Package, 
  ExternalLink,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function CarDetail() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, language, dir } = useLanguage();
  const [, params] = useRoute("/car/:id");
  const carId = params?.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: car, isLoading, error } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId && !!user,
  });

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Purchased": return t("car.status.purchased");
      case "Reserved": return t("car.status.reserved");
      case "In Transit": return t("car.status.inTransit");
      default: return status;
    }
  };

  if (!isAuthLoading && !user) {
    window.location.href = "/login";
    return null;
  }

  if (isAuthLoading || isLoading) {
    return <CarDetailSkeleton />;
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir={dir}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t("carDetail.notFound")}</h1>
            <p className="text-muted-foreground mb-6">{t("carDetail.notFoundDesc")}</p>
            <Link href="/dashboard">
              <Button data-testid="button-back-dashboard">
                <BackArrow className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                {t("carDetail.back")}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const allImages = [car.imageUrl, ...(car.images || [])].filter(Boolean);

  const statusColors: Record<string, string> = {
    "Purchased": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <BackArrow className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {t("carDetail.back")}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: language === "ar" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div 
              className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-secondary cursor-pointer group"
              onClick={() => setIsGalleryOpen(true)}
              data-testid="image-main"
            >
              <img
                src={allImages[selectedImageIndex]}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Badge 
                className={`absolute top-4 ${language === "ar" ? "right-4" : "left-4"} border shadow-sm ${statusColors[car.status] || "bg-gray-100 text-gray-700"}`}
              >
                {getStatusLabel(car.status)}
              </Badge>
              
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    data-testid={`thumbnail-${idx}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: language === "ar" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                {car.make} <span className="text-primary">{car.model}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("car.model")} {car.year}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <Palette className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-muted-foreground tracking-wider">{t("carDetail.color")}</span>
                  <span className="font-medium" data-testid="text-color">{car.color}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <Fingerprint className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-muted-foreground tracking-wider">{t("car.vin")}</span>
                  <span className="font-medium font-mono text-sm" data-testid="text-vin">{car.vin}</span>
                </div>
              </div>
              {car.price && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs uppercase text-muted-foreground tracking-wider">{t("carDetail.price")}</span>
                    <span className="font-medium" data-testid="text-price">${car.price.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                <Calendar className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-muted-foreground tracking-wider">
                    {t("carDetail.dateAdded")}
                  </span>
                  <span className="font-medium" data-testid="text-date">
                    {new Date(car.createdAt!).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                  </span>
                </div>
              </div>
            </div>

            {car.details && (
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium">{t("carDetail.additionalDetails")}</span>
                </div>
                <p className="text-muted-foreground" data-testid="text-details">{car.details}</p>
              </div>
            )}

            {car.status === "In Transit" && (car.containerNumber || car.bookingNumber) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Ship className="w-5 h-5" />
                  <span>{t("carDetail.shippingInfo")}</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {car.containerNumber && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Package className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-xs text-muted-foreground block">{t("car.container")}</span>
                        <span className="font-mono font-medium" data-testid="text-container">{car.containerNumber}</span>
                      </div>
                    </div>
                  )}
                  {car.bookingNumber && (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Fingerprint className="w-4 h-4 text-blue-500" />
                      <div>
                        <span className="text-xs text-muted-foreground block">{t("car.booking")}</span>
                        <span className="font-mono font-medium" data-testid="text-booking">{car.bookingNumber}</span>
                      </div>
                    </div>
                  )}
                </div>

                {car.trackingUrl && (
                  <a
                    href={car.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors w-full justify-center"
                    data-testid="link-track"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {t("car.track")}
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setIsGalleryOpen(false)}
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              className={`absolute top-4 ${language === "ar" ? "left-4" : "right-4"} text-white p-2 hover:bg-white/10 rounded-full`}
              data-testid="button-close-gallery"
            >
              <X className="w-8 h-8" />
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className={`absolute ${language === "ar" ? "right-4" : "left-4"} text-white p-2 hover:bg-white/10 rounded-full`}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className={`absolute ${language === "ar" ? "left-4" : "right-4"} text-white p-2 hover:bg-white/10 rounded-full`}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}

            <motion.img
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={allImages[selectedImageIndex]}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-8 border-t border-border bg-card text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("dashboard.copyright")}
        </p>
      </footer>
    </div>
  );
}

function CarDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-border bg-card" />
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[16/10] rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
