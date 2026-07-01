import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Car } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  ArrowLeft,
  Fingerprint,
  Ship,
  Package,
  ExternalLink,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Gauge,
  Settings2,
  Fuel,
  Users,
  Car as CarIcon,
} from "lucide-react";
import logoImage from "@assets/logo_optimized.png";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const INTERIOR_FEATURES = ["auxUsb","airbags","powerSeats","steeringControl","seatMemory","powerWindows","centralLock","heatedSeats","cdPlayer","leatherSeats","sportSeats","heatedSteering","rearElectric","cooledSeats","ac","alarm"];
const EXTERIOR_FEATURES = ["sunroof","panoramicRoof","rearCamera","360Camera","parkingSensors","frontCamera","ledLights","adaptiveLights","remoteStart","keylessEntry","spareWheel","towHook","roofRack","runFlatTires"];

export default function CarDetail() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, language, dir } = useLanguage();
  const [, params] = useRoute("/car/:id");
  const carId = params?.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { data: car, isLoading } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId && !!user,
  });

  usePageMeta({
    title: car ? `${car.make} ${car.model} ${car.year} - السعفة الذهبية` : "تفاصيل السيارة - السعفة الذهبية",
    description: car ? `تفاصيل سيارة ${car.make} ${car.model} ${car.year} - منصة السعفة الذهبية لتداول وتتبع السيارات في الأردن.` : "تفاصيل السيارة - منصة السعفة الذهبية.",
  });

  useEffect(() => {
    if (!car) return;
    const imgs = [car.imageUrl, ...(car.images || [])].filter(Boolean);
    imgs.forEach(src => { const i = new Image(); i.src = src; });
  }, [car]);

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Purchased": return t("car.status.purchased");
      case "Reserved":  return t("car.status.reserved");
      case "In Transit": return t("car.status.inTransit");
      case "In Loading": return t("car.status.inLoading");
      default: return status;
    }
  };

  if (!isAuthLoading && !user) {
    window.location.href = "/login";
    return null;
  }

  if (isAuthLoading || isLoading) return <CarDetailSkeleton />;

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir={dir}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t("carDetail.notFound")}</h1>
            <p className="text-muted-foreground mb-6">{t("carDetail.notFoundDesc")}</p>
            <Link href="/my-cars">
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

  const c = car as any;
  const allImages = [car.imageUrl, ...(car.images || [])].filter(Boolean);
  const pdfList: string[] = c.pdfUrls?.length > 0 ? c.pdfUrls : (c.pdfUrl ? [c.pdfUrl] : []);

  const statusColors: Record<string, string> = {
    "Purchased":  "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Reserved":   "bg-amber-100 text-amber-700 border-amber-200",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
    "In Loading": "bg-purple-100 text-purple-700 border-purple-200",
  };

  const nextImage = () => setSelectedImageIndex(p => (p + 1) % allImages.length);
  const prevImage = () => setSelectedImageIndex(p => (p - 1 + allImages.length) % allImages.length);

  const specsGrid = [
    c.mileage     && { icon: <Gauge className="w-5 h-5 text-muted-foreground" />,    label: `${c.mileage.toLocaleString()} ${language === "ar" ? "ميل" : "mi"}` },
    c.fuelType    && { icon: <Fuel className="w-5 h-5 text-muted-foreground" />,     label: c.fuelType },
    c.transmission && { icon: <Settings2 className="w-5 h-5 text-muted-foreground" />, label: language === "ar" ? (c.transmission === "automatic" ? "أوتوماتيك" : "يدوي") : c.transmission },
    c.seats       && { icon: <Users className="w-5 h-5 text-muted-foreground" />,    label: `${c.seats} ${language === "ar" ? "مقاعد" : "seats"}` },
    c.bodyType    && { icon: <CarIcon className="w-5 h-5 text-muted-foreground" />,  label: c.bodyType },
    c.engineSize  && { icon: <span className="text-muted-foreground text-xs font-bold">CC</span>, label: c.engineSize },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[];

  const infoTable = [
    c.condition       && { key: language === "ar" ? "الحالة"           : "Condition",    val: language === "ar" ? (c.condition === "new" ? "جديد" : "مستعمل") : c.condition },
    car.make          && { key: language === "ar" ? "الماركة"          : "Brand",        val: car.make },
    car.model         && { key: language === "ar" ? "الموديل"          : "Model",        val: car.model },
    car.year          && { key: language === "ar" ? "السنة"            : "Year",         val: String(car.year) },
    car.color         && { key: language === "ar" ? "اللون الخارجي"    : "Color",        val: car.color },
    c.interiorColor   && { key: language === "ar" ? "لون الداخلية"     : "Interior",     val: c.interiorColor },
    c.countryOfOrigin && { key: language === "ar" ? "بلد المنشأ"       : "Origin",       val: c.countryOfOrigin },
    c.regionalSpecs   && { key: language === "ar" ? "المواصفات الإقليمية" : "Regional Specs", val: c.regionalSpecs },
    car.vin           && { key: t("car.vin"),                                            val: car.vin },
    car.price         && { key: language === "ar" ? "السعر"            : "Price",        val: car.currency === "JOD" ? `${car.price.toLocaleString()} ${language === "ar" ? "د.أ" : "JOD"}` : `$${car.price.toLocaleString()}` },
  ].filter(Boolean) as { key: string; val: string }[];

  const intFeatures = (c.interiorFeatures as string[] | null) || [];
  const extFeatures = (c.exteriorFeatures as string[] | null) || [];

  const getFeatureLabel = (feat: string, type: "int" | "ext") => {
    const key = `filter.${type}${feat.charAt(0).toUpperCase() + feat.slice(1)}`;
    return t(key) || feat;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/my-cars">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <BackArrow className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {t("carDetail.back")}
          </Button>
        </Link>

        {/* ── Image Gallery ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div
            className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-secondary cursor-pointer group"
            onClick={() => setIsGalleryOpen(true)}
            data-testid="image-main"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={selectedImageIndex}
                src={allImages[selectedImageIndex]}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </AnimatePresence>
            <Badge className={`absolute top-4 ${language === "ar" ? "right-4" : "left-4"} border ${statusColors[car.status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {getStatusLabel(car.status)}
            </Badge>
            {allImages.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100" data-testid="button-prev-main">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={e => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100" data-testid="button-next-main">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mt-3">
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  data-testid={`thumbnail-${idx}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Car Title + Price ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          {car.price && (
            <div className="text-3xl font-bold text-primary mb-1" data-testid="text-price">
              {car.currency === "JOD"
                ? <span>{car.price.toLocaleString()} {language === "ar" ? "د.أ" : "JOD"}</span>
                : <span className="flex items-center gap-1"><DollarSign className="w-6 h-6" />{car.price.toLocaleString()}</span>
              }
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {car.make} <span className="text-primary">{car.model}</span> {car.year}
          </h1>
        </motion.div>

        <div className="space-y-5">
          {/* ── Vehicle Summary (specs icons) ── */}
          {specsGrid.length > 0 && (
            <Card data-testid="section-vehicle-summary">
              <CardContent className="p-5">
                <h2 className="font-bold text-foreground text-lg mb-4">
                  {language === "ar" ? "ملخص المركبة" : "Vehicle Summary"}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {specsGrid.map((spec, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 text-center" data-testid={`spec-item-${i}`}>
                      {spec.icon}
                      <span className="text-sm font-medium text-foreground leading-tight">{spec.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Info Table ── */}
          <Card data-testid="section-info-table">
            <CardContent className="p-0 overflow-hidden">
              {infoTable.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-5 py-3.5 ${i !== infoTable.length - 1 ? "border-b border-border" : ""}`}
                  data-testid={`info-row-${i}`}
                >
                  <span className="text-muted-foreground text-sm">{row.key}</span>
                  <span className="font-medium text-foreground text-sm max-w-[55%] text-end font-mono-if-vin" data-testid={`info-val-${i}`}>{row.val}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Description ── */}
          {car.details && (
            <Card data-testid="section-description">
              <CardContent className="p-5">
                <h2 className="font-bold text-foreground text-lg mb-3">
                  {language === "ar" ? "الوصف" : "Description"}
                </h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed" data-testid="text-details">
                  {car.details}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── Specifications (interior + exterior features) ── */}
          {(intFeatures.length > 0 || extFeatures.length > 0) && (
            <Card data-testid="section-specifications">
              <CardContent className="p-5">
                <h2 className="font-bold text-foreground text-lg mb-4">
                  {language === "ar" ? "المواصفات" : "Specifications"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {intFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">
                        {t("filter.interiorSpecs")}
                      </p>
                      <ul className="space-y-2">
                        {intFeatures.map(feat => (
                          <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground" data-testid={`feature-int-${feat}`}>
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {getFeatureLabel(feat, "int")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {extFeatures.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">
                        {t("filter.exteriorSpecs")}
                      </p>
                      <ul className="space-y-2">
                        {extFeatures.map(feat => (
                          <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground" data-testid={`feature-ext-${feat}`}>
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {getFeatureLabel(feat, "ext")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Shipping / Tracking ── */}
          {(car.containerNumber || car.bookingNumber || car.trackingUrl || (c as any).shippingLine) && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800" data-testid="section-shipping">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                  <Ship className="w-5 h-5" />
                  <span>{t("carDetail.shippingInfo")}</span>
                </div>
                {(c as any).shippingLine && (
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <Ship className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">{language === "ar" ? "الخط الملاحي" : "Shipping Lane"}</span>
                      <span className="font-medium text-sm" data-testid="text-shipping-line">{(c as any).shippingLine}</span>
                    </div>
                  </div>
                )}
                {(car.containerNumber || car.bookingNumber) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {car.containerNumber && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("car.container")}</span>
                          <span className="font-mono font-medium text-sm" data-testid="text-container">{car.containerNumber}</span>
                        </div>
                      </div>
                    )}
                    {car.bookingNumber && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <Fingerprint className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-muted-foreground block">{t("car.booking")}</span>
                          <span className="font-mono font-medium text-sm" data-testid="text-booking">{car.bookingNumber}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {car.trackingUrl && (
                  <a href={car.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors w-full"
                    data-testid="link-track">
                    <ExternalLink className="w-5 h-5" />
                    {t("car.track")}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Custom URL ── */}
          {car.customUrl && (
            <Card className="border-primary/20 bg-primary/5" data-testid="section-custom-url">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <ExternalLink className="w-5 h-5" />
                  <span>{t("carDetail.customUrl")}</span>
                </div>
                {car.customUrlReason && (
                  <div className="p-3 bg-card rounded-xl border border-border">
                    <span className="text-xs text-muted-foreground block mb-1">{t("carDetail.customUrlReason")}</span>
                    <p className="text-foreground text-sm" data-testid="text-custom-url-reason">{car.customUrlReason}</p>
                  </div>
                )}
                <a href={car.customUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors w-full"
                  data-testid="link-custom-url">
                  <ExternalLink className="w-5 h-5" />
                  {t("carDetail.openLink")}
                </a>
              </CardContent>
            </Card>
          )}

          {/* ── PDF Documents ── */}
          {pdfList.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800" data-testid="section-pdfs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                  <FileText className="w-5 h-5" />
                  <span>{t("carDetail.pdfDoc")}</span>
                </div>
                {pdfList.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors w-full"
                    data-testid={`link-pdf-${idx}`}>
                    <FileText className="w-5 h-5" />
                    {t("carDetail.viewPdf")}{pdfList.length > 1 ? ` ${idx + 1}` : ""}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* ── Fullscreen gallery ── */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
            onClick={() => setIsGalleryOpen(false)}>
            <button onClick={() => setIsGalleryOpen(false)}
              className={`absolute top-4 ${language === "ar" ? "left-4" : "right-4"} text-white p-2 hover:bg-white/10 rounded-full`}
              data-testid="button-close-gallery">
              <X className="w-8 h-8" />
            </button>
            {allImages.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full" data-testid="button-prev-image">
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button onClick={e => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full" data-testid="button-next-image">
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
            <motion.img key={selectedImageIndex} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              src={allImages[selectedImageIndex]} alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
              onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg bg-black/40 px-4 py-1 rounded-full">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="py-8 border-t border-border bg-secondary mt-12">
        <div className="container mx-auto px-4 text-center">
          <img src={logoImage} alt={t("common.altLogo")} className="h-10 w-auto mx-auto mb-3 opacity-70" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {t("landing.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}

function CarDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-border bg-card" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="aspect-[16/9] rounded-2xl mb-6" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-5">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
