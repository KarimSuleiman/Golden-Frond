import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useJsonLd } from "@/hooks/use-json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, ArrowLeft, Truck, ChevronLeft, ChevronRight,
  Gauge, Settings2, Fuel, Users, Car as CarIcon, X,
  Palette, MapPin, Phone, DollarSign, FileText
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IncomingCar } from "@shared/schema";

const SITE_ORIGIN = "https://golden-palm.replit.app";

export default function IncomingCarDetail() {
  const params = useParams<{ id: string }>();
  const { t, language, dir } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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
    "vehicleSeatingCapacity": car.seats ?? undefined,
    "bodyType": car.bodyType ?? undefined,
    "url": `${SITE_ORIGIN}/incoming-cars/${car?.id}`,
    "offers": car.price ? {
      "@type": "Offer",
      "priceCurrency": "JOD",
      "price": car.price,
      "availability": car.status === "arrived" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      "seller": { "@type": "Organization", "name": "السعفة الذهبية" },
    } : undefined,
  } : null);

  const nextImage = () => setCurrentImageIndex(i => (i + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex(i => (i - 1 + allImages.length) % allImages.length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[16/10] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="grid grid-cols-2 gap-3">
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

  if (isError || !car) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <CarIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-6">
            {language === "ar" ? "السيارة غير موجودة" : "Car not found"}
          </p>
          <Link href="/incoming-cars">
            <Button variant="outline" data-testid="button-back-not-found">
              <BackIcon className="w-4 h-4 me-2" />
              {language === "ar" ? "العودة للقائمة" : "Back to list"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = car.status === "arrived"
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : "bg-primary/10 text-primary border-primary/20";
  const statusLabel = car.status === "arrived" ? t("incoming.status.arrived") : t("incoming.status.coming");

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/incoming-cars">
          <Button variant="ghost" className="mb-6 -ms-2" data-testid="button-back-incoming">
            <BackIcon className="w-4 h-4 me-2" />
            {language === "ar" ? "سيارات قيد التحميل" : "Incoming Cars"}
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Image Gallery ── */}
            <div className="space-y-4">
              <div
                className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted cursor-pointer group"
                onClick={() => setIsGalleryOpen(true)}
                data-testid="image-main"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={currentImageIndex}
                    src={allImages[currentImageIndex]}
                    alt={carTitle}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  />
                </AnimatePresence>

                <Badge className={`absolute top-4 start-4 border ${statusColors}`}>
                  {statusLabel}
                </Badge>

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors md:opacity-0 md:group-hover:opacity-100"
                      data-testid="button-prev"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors md:opacity-0 md:group-hover:opacity-100"
                      data-testid="button-next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${idx === currentImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                      data-testid={`thumbnail-${idx}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info Panel ── */}
            <div className="space-y-5">
              {/* Title + Price */}
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  {car.make} <span className="text-primary">{car.model}</span>
                </h1>
                <p className="text-muted-foreground mt-1">{car.year}{car.color ? ` · ${car.color}` : ""}</p>
              </div>

              {car.price && (
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <DollarSign className="w-5 h-5" />
                  {car.price.toLocaleString()} {language === "ar" ? "دينار" : "JOD"}
                </div>
              )}

              {/* Estimated arrival */}
              {car.estimatedArrival && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-medium">
                  <Truck className="w-5 h-5 flex-shrink-0" />
                  <span>{t("incoming.estimatedArrival")}: <strong>{car.estimatedArrival}</strong></span>
                </div>
              )}

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                {car.color && (
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                    <Palette className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{language === "ar" ? "اللون الخارجي" : "Color"}</span>
                      <span className="font-medium text-sm">{car.color}</span>
                    </div>
                  </div>
                )}
                {car.interiorColor && (
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                    <Palette className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{language === "ar" ? "لون الداخلية" : "Interior"}</span>
                      <span className="font-medium text-sm">{car.interiorColor}</span>
                    </div>
                  </div>
                )}
                {car.condition && (
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                    <CarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{language === "ar" ? "الحالة" : "Condition"}</span>
                      <span className="font-medium text-sm">{language === "ar" ? (car.condition === "new" ? "جديدة" : "مستعملة") : car.condition}</span>
                    </div>
                  </div>
                )}
                {car.countryOfOrigin && (
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{language === "ar" ? "بلد المنشأ" : "Origin"}</span>
                      <span className="font-medium text-sm">{car.countryOfOrigin}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Specs grid */}
              {(car.mileage || car.transmission || car.fuelType || car.bodyType || car.seats || car.engineSize) && (
                <div className="p-4 bg-muted/40 rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {language === "ar" ? "المواصفات التقنية" : "Specifications"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
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
                    {car.engineSize && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground text-xs font-bold w-4 text-center">CC</span>
                        <span>{car.engineSize}</span>
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
                        <CarIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{car.bodyType}</span>
                      </div>
                    )}
                    {car.mileage && (
                      <div className="flex items-center gap-2 text-sm">
                        <Gauge className="w-4 h-4 text-muted-foreground" />
                        <span>{car.mileage.toLocaleString()} {language === "ar" ? "ميل" : "mi"}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Regional specs */}
              {car.regionalSpecs && (
                <div className="text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">{language === "ar" ? "المواصفات الإقليمية: " : "Regional Specs: "}</span>
                  <span className="font-medium">{car.regionalSpecs}</span>
                </div>
              )}

              {/* Contact / Location */}
              {(car.contactPhone || car.location) && (
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                  {car.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${car.contactPhone}`} className="text-primary hover:underline" dir="ltr">{car.contactPhone}</a>
                    </div>
                  )}
                  {car.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{car.location}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              {car.details && (
                <div className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{language === "ar" ? "تفاصيل إضافية" : "Additional Details"}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line" data-testid="text-details">{car.details}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen gallery */}
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
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-full" data-testid="button-gallery-prev">
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white p-2 hover:bg-white/10 rounded-full" data-testid="button-gallery-next">
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={allImages[currentImageIndex]}
              alt={carTitle}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
