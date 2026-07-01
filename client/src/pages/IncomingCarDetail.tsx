import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useJsonLd } from "@/hooks/use-json-ld";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight, ArrowLeft, Truck, ChevronLeft, ChevronRight,
  Gauge, Settings2, Fuel, Users, Car as CarIcon, X,
  Palette, MapPin, Phone, DollarSign, FileText, Pencil, Upload
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IncomingCar } from "@shared/schema";

const SITE_ORIGIN = "https://golden-palm.replit.app";

export default function IncomingCarDetail() {
  const params = useParams<{ id: string }>();
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const BackIcon = language === "ar" ? ArrowLeft : ArrowRight;

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    make: "", model: "", year: "", color: "", details: "", status: "coming", estimatedArrival: "",
    price: "", condition: "used", mileage: "", bodyType: "", transmission: "", fuelType: "",
    engineSize: "", seats: "", interiorColor: "", interiorFeatures: [] as string[],
    exteriorFeatures: [] as string[], regionalSpecs: "", countryOfOrigin: "", license: "",
    insurance: "", customs: "", location: "", contactPhone: "",
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editAdditionalFiles, setEditAdditionalFiles] = useState<File[]>([]);
  const [editAdditionalPreviews, setEditAdditionalPreviews] = useState<string[]>([]);
  const editAdditionalInputRef = useRef<HTMLInputElement>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const { data: authInfo } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const handleEditOpen = (car: IncomingCar) => {
    setEditForm({
      make: car.make || "", model: car.model || "", year: String(car.year || ""),
      color: car.color || "", details: car.details || "", status: car.status || "coming",
      estimatedArrival: car.estimatedArrival || "", price: car.price ? String(car.price) : "",
      condition: car.condition || "used", mileage: car.mileage ? String(car.mileage) : "",
      bodyType: car.bodyType || "", transmission: car.transmission || "", fuelType: car.fuelType || "",
      engineSize: car.engineSize || "", seats: car.seats ? String(car.seats) : "",
      interiorColor: car.interiorColor || "",
      interiorFeatures: (car.interiorFeatures as string[]) || [],
      exteriorFeatures: (car.exteriorFeatures as string[]) || [],
      regionalSpecs: car.regionalSpecs || "", countryOfOrigin: car.countryOfOrigin || "",
      license: car.license || "", insurance: car.insurance || "", customs: car.customs || "",
      location: car.location || "", contactPhone: car.contactPhone || "",
    });
    setEditImageFile(null);
    setEditImagePreview(car.imageUrl || "");
    setEditExistingImages((car.images as string[]) || []);
    setEditAdditionalFiles([]);
    setEditAdditionalPreviews([]);
    setEditOpen(true);
  };

  const handleEditSubmit = async (car: IncomingCar) => {
    if (!editForm.make || !editForm.model || !editForm.year) {
      toast({ title: language === "ar" ? "الرجاء ملء الحقول المطلوبة" : "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsEditSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, v as string);
      });
      fd.append("existingImages", JSON.stringify(editExistingImages));
      if (editImageFile) fd.append("image", editImageFile);
      editAdditionalFiles.forEach(f => fd.append("images", f));

      const res = await fetch(`/api/admin/incoming-cars/${car.id}`, { method: "PUT", body: fd, credentials: "include" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || `HTTP ${res.status}`); }
      await queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars", params.id] });
      await queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars"] });
      toast({ title: language === "ar" ? "تم تعديل السيارة بنجاح" : "Car updated successfully" });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: err?.message || (language === "ar" ? "فشل التعديل" : "Failed to update"), variant: "destructive" });
    } finally {
      setIsEditSubmitting(false);
    }
  };

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
        <div className="flex items-center justify-between mb-6">
          <Link href="/incoming-cars">
            <Button variant="ghost" className="-ms-2" data-testid="button-back-incoming">
              <BackIcon className="w-4 h-4 me-2" />
              {language === "ar" ? "سيارات قيد التحميل" : "Incoming Cars"}
            </Button>
          </Link>
          {authInfo?.isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => handleEditOpen(car)}
              data-testid="button-edit-car-detail"
            >
              <Pencil className="w-4 h-4" />
              {language === "ar" ? "تعديل" : "Edit"}
            </Button>
          )}
        </div>

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

              {/* ── Features ── */}
              {((car.interiorFeatures as string[] | null)?.length || (car.exteriorFeatures as string[] | null)?.length) ? (
                <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                  <h2 className="font-bold text-foreground text-base">
                    {language === "ar" ? "المواصفات" : "Specifications"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {((car.interiorFeatures as string[] | null) || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">
                          {t("filter.interiorSpecs")}
                        </p>
                        <ul className="space-y-2">
                          {((car.interiorFeatures as string[]) || []).map(feat => (
                            <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground" data-testid={`feature-int-${feat}`}>
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              {t(`filter.int${feat.charAt(0).toUpperCase() + feat.slice(1)}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {((car.exteriorFeatures as string[] | null) || []).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 pb-2 border-b border-border">
                          {t("filter.exteriorSpecs")}
                        </p>
                        <ul className="space-y-2">
                          {((car.exteriorFeatures as string[]) || []).map(feat => (
                            <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground" data-testid={`feature-ext-${feat}`}>
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              {t(`filter.ext${feat.charAt(0).toUpperCase() + feat.slice(1)}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
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
                  {car.currency === "JOD"
                    ? <span>{car.price.toLocaleString()} {language === "ar" ? "د.أ" : "JOD"}</span>
                    : <><DollarSign className="w-5 h-5" />{car.price.toLocaleString()}</>
                  }
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => !open && setEditOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "تعديل السيارة" : "Edit Car"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Main image */}
            <div className="space-y-2">
              <Label>{t("admin.form.mainImage")}</Label>
              {editImagePreview ? (
                <div className="relative">
                  <img src={editImagePreview} alt="" className="w-full h-44 object-cover rounded-lg" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 text-white"
                    onClick={() => { setEditImageFile(null); setEditImagePreview(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                  {editImageFile && <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">{language === "ar" ? "صورة جديدة" : "New image"}</span>}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">{t("admin.form.selectImage")}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { setEditImageFile(file); const r = new FileReader(); r.onloadend = () => setEditImagePreview(r.result as string); r.readAsDataURL(file); }
                  }} />
                </label>
              )}
            </div>

            {/* Additional images */}
            <div className="space-y-2">
              <Label>{t("admin.form.additionalImages")}</Label>
              <div className="flex flex-wrap gap-2">
                {editExistingImages.map((url, idx) => (
                  <div key={`ex-${idx}`} className="relative w-16 h-16">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-md" />
                    <button type="button" onClick={() => setEditExistingImages(a => a.filter((_, i) => i !== idx))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {editAdditionalPreviews.map((p, idx) => (
                  <div key={`new-${idx}`} className="relative w-16 h-16">
                    <img src={p} alt="" className="w-full h-full object-cover rounded-md border-2 border-primary" />
                    <button type="button" onClick={() => { setEditAdditionalFiles(a => a.filter((_, i) => i !== idx)); setEditAdditionalPreviews(a => a.filter((_, i) => i !== idx)); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => editAdditionalInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-border rounded-md flex items-center justify-center hover:border-primary/50 transition-colors bg-transparent">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </button>
                <input ref={editAdditionalInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setEditAdditionalFiles(prev => [...prev, ...files]);
                  files.forEach(f => { const r = new FileReader(); r.onloadend = () => setEditAdditionalPreviews(prev => [...prev, r.result as string]); r.readAsDataURL(f); });
                }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("marketplace.brand")} *</Label>
                <Input value={editForm.make} onChange={e => setEditForm(f => ({ ...f, make: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("marketplace.model")} *</Label>
                <Input value={editForm.model} onChange={e => setEditForm(f => ({ ...f, model: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("marketplace.yearLabel")} *</Label>
                <Input type="number" value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))} placeholder="2025" /></div>
              <div className="space-y-2"><Label>{t("marketplace.priceLabel")}</Label>
                <Input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("filter.exteriorColor")}</Label>
                <Select value={editForm.color || "none"} onValueChange={v => setEditForm(f => ({ ...f, color: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    {["white","red","green","blue","lightBlue","gray","black","yellow","teal","silver","gold","brown","orange","beige","purple"].map(c => (
                      <SelectItem key={c} value={c}>{t(`filter.color${c.charAt(0).toUpperCase() + c.slice(1)}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("marketplace.condition")}</Label>
                <Select value={editForm.condition} onValueChange={v => setEditForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("marketplace.conditionNew")}</SelectItem>
                    <SelectItem value="used">{t("marketplace.conditionUsed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("marketplace.mileage")}</Label>
                <Input type="number" value={editForm.mileage} onChange={e => setEditForm(f => ({ ...f, mileage: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("marketplace.bodyType")}</Label>
                <Select value={editForm.bodyType || "none"} onValueChange={v => setEditForm(f => ({ ...f, bodyType: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="suv">{t("filter.bodySUV")}</SelectItem>
                    <SelectItem value="van">{t("filter.bodyVan")}</SelectItem>
                    <SelectItem value="pickup">{t("filter.bodyPickup")}</SelectItem>
                    <SelectItem value="truck">{t("filter.bodyTruck")}</SelectItem>
                    <SelectItem value="sedan">{t("filter.bodySedan")}</SelectItem>
                    <SelectItem value="convertible">{t("filter.bodyConvertible")}</SelectItem>
                    <SelectItem value="coupe">{t("filter.bodyCoupe")}</SelectItem>
                    <SelectItem value="hatchback">{t("filter.bodyHatchback")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("marketplace.transmission")}</Label>
                <Select value={editForm.transmission || "none"} onValueChange={v => setEditForm(f => ({ ...f, transmission: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="automatic">{t("marketplace.automatic")}</SelectItem>
                    <SelectItem value="manual">{t("marketplace.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("marketplace.fuelType")}</Label>
                <Select value={editForm.fuelType || "none"} onValueChange={v => setEditForm(f => ({ ...f, fuelType: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="petrol">{t("filter.fuelPetrol")}</SelectItem>
                    <SelectItem value="diesel">{t("filter.fuelDiesel")}</SelectItem>
                    <SelectItem value="electric">{t("filter.fuelElectric")}</SelectItem>
                    <SelectItem value="mild_hybrid">{t("filter.fuelMildHybrid")}</SelectItem>
                    <SelectItem value="hybrid">{t("filter.fuelHybrid")}</SelectItem>
                    <SelectItem value="plugin_hybrid">{t("filter.fuelPluginHybrid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("marketplace.engineSize")}</Label>
                <Input value={editForm.engineSize} onChange={e => setEditForm(f => ({ ...f, engineSize: e.target.value }))} placeholder="2.0L" /></div>
              <div className="space-y-2"><Label>{t("filter.seats")}</Label>
                <Input type="number" value={editForm.seats} onChange={e => setEditForm(f => ({ ...f, seats: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("filter.interiorColor")}</Label>
                <Select value={editForm.interiorColor || "none"} onValueChange={v => setEditForm(f => ({ ...f, interiorColor: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    {["white","red","green","blue","lightBlue","gray","black","yellow","teal","silver","gold","brown","orange","beige","purple"].map(c => (
                      <SelectItem key={c} value={c}>{t(`filter.color${c.charAt(0).toUpperCase() + c.slice(1)}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("filter.regionalSpecs")}</Label>
                <Select value={editForm.regionalSpecs || "none"} onValueChange={v => setEditForm(f => ({ ...f, regionalSpecs: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="american">{t("filter.specAmerican")}</SelectItem>
                    <SelectItem value="european">{t("filter.specEuropean")}</SelectItem>
                    <SelectItem value="gulf">{t("filter.specGulf")}</SelectItem>
                    <SelectItem value="chinese">{t("filter.specChinese")}</SelectItem>
                    <SelectItem value="korean">{t("filter.specKorean")}</SelectItem>
                    <SelectItem value="japanese">{t("filter.specJapanese")}</SelectItem>
                    <SelectItem value="other">{t("filter.specOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("filter.countryOfOrigin")}</Label>
                <Select value={editForm.countryOfOrigin || "none"} onValueChange={v => setEditForm(f => ({ ...f, countryOfOrigin: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="germany">{t("filter.originGermany")}</SelectItem>
                    <SelectItem value="india">{t("filter.originIndia")}</SelectItem>
                    <SelectItem value="japan">{t("filter.originJapan")}</SelectItem>
                    <SelectItem value="usa">{t("filter.originUSA")}</SelectItem>
                    <SelectItem value="iran">{t("filter.originIran")}</SelectItem>
                    <SelectItem value="spain">{t("filter.originSpain")}</SelectItem>
                    <SelectItem value="uae">{t("filter.originUAE")}</SelectItem>
                    <SelectItem value="sweden">{t("filter.originSweden")}</SelectItem>
                    <SelectItem value="china">{t("filter.originChina")}</SelectItem>
                    <SelectItem value="italy">{t("filter.originItaly")}</SelectItem>
                    <SelectItem value="uk">{t("filter.originUK")}</SelectItem>
                    <SelectItem value="russia">{t("filter.originRussia")}</SelectItem>
                    <SelectItem value="france">{t("filter.originFrance")}</SelectItem>
                    <SelectItem value="korea">{t("filter.originKorea")}</SelectItem>
                    <SelectItem value="malaysia">{t("filter.originMalaysia")}</SelectItem>
                    <SelectItem value="netherlands">{t("filter.originNetherlands")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("incoming.form.status")}</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coming">{t("incoming.status.coming")}</SelectItem>
                  <SelectItem value="arrived">{t("incoming.status.arrived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("incoming.estimatedArrival")}</Label>
              <Input value={editForm.estimatedArrival} onChange={e => setEditForm(f => ({ ...f, estimatedArrival: e.target.value }))}
                placeholder={language === "ar" ? "مثال: خلال أسبوعين" : "e.g. 2 weeks"} />
            </div>
            <div className="space-y-2">
              <Label>{t("marketplace.location")}</Label>
              <Input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t("marketplace.contactPhone")}</Label>
              <Input value={editForm.contactPhone} onChange={e => setEditForm(f => ({ ...f, contactPhone: e.target.value }))} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{t("incoming.details")}</Label>
              <Textarea value={editForm.details} onChange={e => setEditForm(f => ({ ...f, details: e.target.value }))} className="min-h-[80px]" />
            </div>

            <div className="flex gap-3 pt-1">
              <Button className="flex-1" onClick={() => car && handleEditSubmit(car)} disabled={isEditSubmitting} data-testid="button-save-edit-detail">
                {isEditSubmitting ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ التعديلات" : "Save Changes")}
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>{t("admin.form.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
