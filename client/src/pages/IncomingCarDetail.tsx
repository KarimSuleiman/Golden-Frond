import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useJsonLd } from "@/hooks/use-json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft, Truck, Calendar, ChevronLeft, ChevronRight, Gauge, Settings2, Fuel, Users, Car } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import type { IncomingCar } from "@shared/schema";

const SITE_ORIGIN = "https://golden-palm.replit.app";

export default function IncomingCarDetail() {
  const params = useParams<{ id: string }>();
  const { t, language, dir } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const BackIcon = language === "ar" ? ArrowLeft : ArrowRight;

  const { data: car, isLoading, isError } = useQuery<IncomingCar>({
    queryKey: ["/api/incoming-cars", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/incoming-cars/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const allImages = car ? [car.imageUrl, ...(car.images || [])].filter(Boolean) as string[] : [];

  const carTitle = car ? `${car.make} ${car.model} ${car.year}` : "";

  usePageMeta({
    title: car ? `${carTitle} - سيارة قادمة | السعفة الذهبية` : "سيارة قيد التحميل - السعفة الذهبية",
    description: car
      ? `${carTitle}${car.color ? " - " + car.color : ""}. ${car.status === "arrived" ? "وصلت" : "قيد الشحن"}${car.estimatedArrival ? " - موعد الوصول: " + car.estimatedArrival : ""}. ${car.details ? car.details.slice(0, 120) : "سيارة مستوردة في معرض السعفة الذهبية - الأردن."}`
      : "سيارة مستوردة قادمة إلى معرض السعفة الذهبية في الأردن.",
    ogImage: car?.imageUrl,
  });

  useJsonLd(car ? {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": carTitle,
    "brand": { "@type": "Brand", "name": car.make },
    "model": car.model,
    "modelDate": String(car.year),
    "color": car.color ?? undefined,
    "image": allImages.map(img => img.startsWith("http") ? img : `${SITE_ORIGIN}${img}`),
    "description": car.details ?? undefined,
    "vehicleTransmission": car.transmission ?? undefined,
    "fuelType": car.fuelType ?? undefined,
    "mileageFromOdometer": car.mileage ? { "@type": "QuantitativeValue", "value": car.mileage, "unitCode": "SMI" } : undefined,
    "numberOfDoors": undefined,
    "vehicleSeatingCapacity": car.seats ?? undefined,
    "bodyType": car.bodyType ?? undefined,
    "url": `${SITE_ORIGIN}/incoming-cars/${car.id}`,
    "offers": car.price ? {
      "@type": "Offer",
      "priceCurrency": "JOD",
      "price": car.price,
      "availability": car.status === "arrived" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "seller": { "@type": "Organization", "name": "السعفة الذهبية" },
    } : undefined,
  } : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-72 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-64 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <Car className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-6">
            {language === "ar" ? "السيارة غير موجودة" : "Car not found"}
          </p>
          <Link href="/incoming-cars">
            <Button variant="outline">
              <BackIcon className="w-4 h-4 me-2" />
              {language === "ar" ? "العودة للقائمة" : "Back to list"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/incoming-cars">
          <Button variant="ghost" className="mb-6 -ms-2" data-testid="button-back-incoming">
            <BackIcon className="w-4 h-4 me-2" />
            {language === "ar" ? "سيارات قيد التحميل" : "Incoming Cars"}
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Image carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-muted mb-6" style={{ height: "340px" }}>
            {allImages.length > 0 && (
              <>
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${car.make} ${car.model} ${car.year}`}
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(i => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            <Badge className={`absolute top-4 start-4 text-sm font-semibold ${car.status === "arrived" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
              {car.status === "arrived" ? t("incoming.status.arrived") : t("incoming.status.coming")}
            </Badge>
          </div>

          {/* Car info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{car.make} {car.model} {car.year}</h1>
              {car.color && <p className="text-muted-foreground mt-1">{car.color}</p>}
            </div>

            {car.estimatedArrival && (
              <div className="flex items-center gap-2 text-primary font-medium">
                <Truck className="w-4 h-4" />
                <span>{t("incoming.estimatedArrival")}: {car.estimatedArrival}</span>
              </div>
            )}

            {/* Specs grid */}
            {(car.mileage || car.transmission || car.fuelType || car.bodyType || car.seats || car.engineSize) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/50 rounded-xl">
                {car.mileage && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span>{car.mileage.toLocaleString()} {language === "ar" ? "ميل" : "mi"}</span>
                  </div>
                )}
                {car.transmission && (
                  <div className="flex items-center gap-2 text-sm">
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                    <span>{language === "ar" ? (car.transmission === "automatic" ? "أوتوماتيك" : "يدوي") : car.transmission}</span>
                  </div>
                )}
                {car.fuelType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <span>{car.fuelType}</span>
                  </div>
                )}
                {car.seats && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{car.seats} {language === "ar" ? "مقاعد" : "seats"}</span>
                  </div>
                )}
                {car.bodyType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span>{car.bodyType}</span>
                  </div>
                )}
                {car.engineSize && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground text-xs font-bold">CC</span>
                    <span>{car.engineSize}</span>
                  </div>
                )}
              </div>
            )}

            {car.price && (
              <div className="text-xl font-bold text-primary">
                {car.price.toLocaleString(language === "ar" ? "ar-JO" : "en-JO")} {language === "ar" ? "دينار" : "JOD"}
              </div>
            )}

            {car.details && (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{car.details}</p>
              </div>
            )}

            {/* Additional info */}
            {(car.countryOfOrigin || car.regionalSpecs || car.condition) && (
              <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-4">
                {car.countryOfOrigin && (
                  <div>
                    <span className="text-muted-foreground">{language === "ar" ? "بلد المنشأ" : "Origin"}: </span>
                    <span className="font-medium">{car.countryOfOrigin}</span>
                  </div>
                )}
                {car.condition && (
                  <div>
                    <span className="text-muted-foreground">{language === "ar" ? "الحالة" : "Condition"}: </span>
                    <span className="font-medium">{language === "ar" ? (car.condition === "new" ? "جديدة" : "مستعملة") : car.condition}</span>
                  </div>
                )}
                {car.regionalSpecs && (
                  <div>
                    <span className="text-muted-foreground">{language === "ar" ? "المواصفات" : "Specs"}: </span>
                    <span className="font-medium">{car.regionalSpecs}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
