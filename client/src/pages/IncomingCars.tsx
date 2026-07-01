import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { MakeSelect } from "@/components/MakeSelect";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useJsonLd } from "@/hooks/use-json-ld";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Upload, X, Truck, Package, Calendar, Pencil, Search, ArrowUpDown, ArrowUp, ArrowDown, Clock, Tag, Gauge, Filter } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import type { IncomingCar } from "@shared/schema";
import { BODY_TYPES_QUICK, CAR_MAKES_QUICK } from "@/lib/car-filters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



const SITE_ORIGIN = "https://golden-palm.replit.app";

export default function IncomingCars() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  usePageMeta({
    title: "سيارات قيد التحميل - السعفة الذهبية | وصول قريب",
    description: "تعرف على آخر السيارات القادمة من المزادات الأمريكية والأوروبية. شاهد السيارات التي ستصل قريباً إلى معرض السعفة الذهبية في الأردن.",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const { data: cars, isLoading } = useQuery<IncomingCar[]>({
    queryKey: ["/api/incoming-cars"],
  });

  const filteredCars = useMemo(() => {
    let result = cars ?? [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(c =>
        c.make?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        String(c.year ?? "").includes(q) ||
        c.color?.toLowerCase().includes(q)
      );
    }
    if (selectedStatus) {
      result = result.filter(c => c.status === selectedStatus);
    }
    if (selectedBodyType) {
      result = result.filter(c => c.bodyType?.toLowerCase() === selectedBodyType.toLowerCase());
    }
    if (selectedMake) {
      result = result.filter(c => c.make?.toLowerCase() === selectedMake.toLowerCase());
    }
    const sorted = [...result];
    switch (sortBy) {
      case "newest": sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)); break;
      case "oldest": sorted.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); break;
      case "yearNew": sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0)); break;
      case "yearOld": sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0)); break;
      case "priceHigh": sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0)); break;
      case "priceLow": sorted.sort((a, b) => (Number(a.price) || Infinity) - (Number(b.price) || Infinity)); break;
    }
    return sorted;
  }, [cars, searchQuery, selectedStatus, selectedBodyType, selectedMake, sortBy]);

  const hasActiveFilters = searchQuery || selectedStatus || selectedBodyType || selectedMake;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedStatus) n++;
    if (selectedBodyType) n++;
    if (selectedMake) n++;
    if (searchQuery) n++;
    return n;
  }, [selectedStatus, selectedBodyType, selectedMake, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedBodyType("");
    setSelectedMake("");
    setSortBy("newest");
  };

  useJsonLd(cars?.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "سيارات قيد التحميل - السعفة الذهبية",
    "description": "سيارات قادمة من المزادات الأمريكية والأوروبية إلى معرض السعفة الذهبية في الأردن",
    "url": `${SITE_ORIGIN}/incoming-cars`,
    "numberOfItems": cars.length,
    "itemListElement": cars.map((car, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${SITE_ORIGIN}/incoming-cars/${car.id}`,
      "name": `${car.make} ${car.model} ${car.year}`,
      "item": {
        "@type": "Vehicle",
        "name": `${car.make} ${car.model} ${car.year}`,
        "brand": { "@type": "Brand", "name": car.make },
        "model": car.model,
        "modelDate": String(car.year),
        "color": car.color ?? undefined,
        "image": car.imageUrl.startsWith("http") ? car.imageUrl : `${SITE_ORIGIN}${car.imageUrl}`,
        "url": `${SITE_ORIGIN}/incoming-cars/${car.id}`,
      },
    })),
  } : null);

  // Add form state
  const [form, setForm] = useState({
    make: "", model: "", year: "", color: "",
    details: "", status: "coming", estimatedArrival: "",
    price: "", currency: "USD", condition: "used", mileage: "", bodyType: "",
    transmission: "", fuelType: "", engineSize: "", seats: "",
    interiorColor: "", interiorFeatures: [] as string[],
    exteriorFeatures: [] as string[],
    regionalSpecs: "", countryOfOrigin: "", license: "",
    insurance: "", customs: "", location: "", contactPhone: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const additionalInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit state
  const [editCar, setEditCar] = useState<IncomingCar | null>(null);
  const [editForm, setEditForm] = useState({
    make: "", model: "", year: "", color: "", details: "", status: "coming", estimatedArrival: "",
    price: "", currency: "USD", condition: "used", mileage: "", bodyType: "", transmission: "", fuelType: "",
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

  const handleEditOpen = (car: IncomingCar) => {
    setEditCar(car);
    setEditForm({
      make: car.make || "", model: car.model || "", year: String(car.year || ""),
      color: car.color || "", details: car.details || "", status: car.status || "coming",
      estimatedArrival: car.estimatedArrival || "", price: car.price ? String(car.price) : "",
      currency: car.currency || "USD", condition: car.condition || "used", mileage: car.mileage ? String(car.mileage) : "",
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
  };

  const handleEditAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditAdditionalFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setEditAdditionalPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleEditSubmit = async () => {
    if (!editCar || !editForm.make || !editForm.model || !editForm.year) {
      toast({ title: language === "ar" ? "الرجاء ملء الحقول المطلوبة" : "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("make", editForm.make);
      fd.append("model", editForm.model);
      fd.append("year", editForm.year);
      fd.append("color", editForm.color);
      fd.append("details", editForm.details);
      fd.append("status", editForm.status);
      fd.append("estimatedArrival", editForm.estimatedArrival);
      fd.append("price", editForm.price);
      fd.append("currency", editForm.currency || "USD");
      fd.append("condition", editForm.condition);
      fd.append("mileage", editForm.mileage);
      fd.append("bodyType", editForm.bodyType);
      fd.append("transmission", editForm.transmission);
      fd.append("fuelType", editForm.fuelType);
      fd.append("engineSize", editForm.engineSize);
      fd.append("seats", editForm.seats);
      fd.append("interiorColor", editForm.interiorColor);
      fd.append("interiorFeatures", JSON.stringify(editForm.interiorFeatures));
      fd.append("exteriorFeatures", JSON.stringify(editForm.exteriorFeatures));
      fd.append("regionalSpecs", editForm.regionalSpecs);
      fd.append("countryOfOrigin", editForm.countryOfOrigin);
      fd.append("license", editForm.license);
      fd.append("insurance", editForm.insurance);
      fd.append("customs", editForm.customs);
      fd.append("location", editForm.location);
      fd.append("contactPhone", editForm.contactPhone);
      fd.append("existingImages", JSON.stringify(editExistingImages));
      if (editImageFile) fd.append("image", editImageFile);
      editAdditionalFiles.forEach(f => fd.append("images", f));

      const res = await fetch(`/api/admin/incoming-cars/${editCar.id}`, { method: "PUT", body: fd, credentials: "include" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars"] });
      toast({ title: language === "ar" ? "تم تعديل السيارة" : "Car updated successfully" });
      setEditCar(null);
    } catch (err: any) {
      const msg = err?.message || "";
      toast({ title: msg || (language === "ar" ? "فشل التعديل" : "Failed to update"), variant: "destructive" });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setAdditionalPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!imageFile || !form.make || !form.model || !form.year) {
      toast({ title: language === "ar" ? "الرجاء ملء الحقول المطلوبة" : "Please fill required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("make", form.make);
      fd.append("model", form.model);
      fd.append("year", form.year);
      fd.append("color", form.color);
      fd.append("details", form.details);
      fd.append("status", form.status);
      fd.append("estimatedArrival", form.estimatedArrival);
      fd.append("price", form.price);
      fd.append("currency", form.currency || "USD");
      fd.append("condition", form.condition);
      fd.append("mileage", form.mileage);
      fd.append("bodyType", form.bodyType);
      fd.append("transmission", form.transmission);
      fd.append("fuelType", form.fuelType);
      fd.append("engineSize", form.engineSize);
      fd.append("seats", form.seats);
      fd.append("interiorColor", form.interiorColor);
      fd.append("interiorFeatures", JSON.stringify(form.interiorFeatures));
      fd.append("exteriorFeatures", JSON.stringify(form.exteriorFeatures));
      fd.append("regionalSpecs", form.regionalSpecs);
      fd.append("countryOfOrigin", form.countryOfOrigin);
      fd.append("license", form.license);
      fd.append("insurance", form.insurance);
      fd.append("customs", form.customs);
      fd.append("location", form.location);
      fd.append("contactPhone", form.contactPhone);
      fd.append("image", imageFile);
      additionalFiles.forEach(f => fd.append("images", f));

      const res = await fetch("/api/admin/incoming-cars", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars"] });
      toast({ title: language === "ar" ? "تم إضافة السيارة" : "Car added successfully" });
      setShowAddModal(false);
      setForm({
        make: "", model: "", year: "", color: "", details: "", status: "coming", estimatedArrival: "",
        price: "", currency: "USD", condition: "used", mileage: "", bodyType: "", transmission: "", fuelType: "",
        engineSize: "", seats: "", interiorColor: "", interiorFeatures: [], exteriorFeatures: [],
        regionalSpecs: "", countryOfOrigin: "", license: "", insurance: "", customs: "",
        location: "", contactPhone: "",
      });
      setImageFile(null); setImagePreview("");
      setAdditionalFiles([]); setAdditionalPreviews([]);
    } catch (err: any) {
      const msg = err?.message || "";
      toast({
        title: msg ? msg : (language === "ar" ? "فشل الإضافة" : "Failed to add car"),
        description: msg ? (language === "ar" ? "فشل إضافة السيارة" : "Failed to add car") : "",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/incoming-cars/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars"] });
      toast({ title: language === "ar" ? "تم الحذف" : "Deleted successfully" });
      setDeleteId(null);
    },
  });

  const allImages = (car: IncomingCar) => [car.imageUrl, ...(car.images || [])].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />

      {/* Hero header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("incoming.title")}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{t("incoming.subtitle")}</p>
            </div>
            {authInfo?.isAdmin && (
              <Button onClick={() => setShowAddModal(true)} data-testid="button-add-incoming">
                <Plus className="w-4 h-4 me-2" />
                {t("incoming.addCar")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                placeholder={language === "ar" ? "ابحث عن سيارة..." : "Search for a car..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={language === "ar" ? "pr-10" : "pl-10"}
                data-testid="input-incoming-search"
              />
            </div>
            <IncomingSortPopover sortBy={sortBy} setSortBy={setSortBy} language={language} />
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(true)}
              className="relative"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              <span className={language === "ar" ? "mr-2" : "ml-2"}>{language === "ar" ? "فلترة" : "Filter"}</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearAllFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4" />
                <span className={language === "ar" ? "mr-1" : "ml-1"}>{language === "ar" ? "مسح" : "Clear"}</span>
              </Button>
            )}
          </div>
        </div>

        <IncomingFilterPanel
          open={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          language={language}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedBodyType={selectedBodyType}
          setSelectedBodyType={setSelectedBodyType}
          selectedMake={selectedMake}
          setSelectedMake={setSelectedMake}
          onClear={clearAllFilters}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : !filteredCars.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-14 h-14 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t("incoming.noCars")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCars.map((car, i) => (
              <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/incoming-cars/${car.id}`} className="block group">
                  <Card className="overflow-hidden rounded-2xl border border-border hover:shadow-lg transition-all cursor-pointer">
                    <div className="relative h-52 overflow-hidden bg-muted">
                      <img src={car.imageUrl} alt={`${car.make} ${car.model} ${car.year}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className={`absolute top-3 ${language === "ar" ? "right-3" : "left-3"} text-xs font-semibold ${car.status === "arrived" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                        {car.status === "arrived" ? t("incoming.status.arrived") : t("incoming.status.coming")}
                      </Badge>
                      {authInfo?.isAdmin && (
                        <div className="absolute top-3 end-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => { e.preventDefault(); e.stopPropagation(); handleEditOpen(car); }}
                            className="w-8 h-8 bg-primary/90 text-white rounded-full flex items-center justify-center"
                            data-testid={`button-edit-incoming-${car.id}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => { e.preventDefault(); e.stopPropagation(); setDeleteId(car.id); }}
                            className="w-8 h-8 bg-destructive/90 text-white rounded-full flex items-center justify-center"
                            data-testid={`button-delete-incoming-${car.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-bold text-lg text-foreground">{car.make} {car.model}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{car.year}</span>
                        {car.color && <span>{car.color}</span>}
                      </div>
                      {car.estimatedArrival && (
                        <p className="text-xs text-primary font-medium flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          {t("incoming.estimatedArrival")}: {car.estimatedArrival}
                        </p>
                      )}
                      {car.details && <p className="text-xs text-muted-foreground line-clamp-2">{car.details}</p>}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>


      {/* Add modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle>{t("incoming.form.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Main image */}
            <div className="space-y-2">
              <Label>{t("admin.form.mainImage")}</Label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="" className="w-full h-44 object-cover rounded-lg" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 text-white" onClick={() => { setImageFile(null); setImagePreview(""); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">{t("admin.form.selectImage")}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Additional images */}
            <div className="space-y-2">
              <Label>{t("admin.form.additionalImages")}</Label>
              <div className="flex flex-wrap gap-2">
                {additionalPreviews.map((p, idx) => (
                  <div key={idx} className="relative w-16 h-16">
                    <img src={p} alt="" className="w-full h-full object-cover rounded-md" />
                    <button type="button" onClick={() => { setAdditionalFiles(a => a.filter((_, i) => i !== idx)); setAdditionalPreviews(a => a.filter((_, i) => i !== idx)); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => additionalInputRef.current?.click()}
                  className="w-16 h-16 border-2 border-dashed border-border rounded-md flex items-center justify-center hover:border-primary/50 transition-colors bg-transparent">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </button>
                <input ref={additionalInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImages} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("marketplace.brand")} *</Label>
                <MakeSelect value={form.make} onChange={v => setForm(f => ({...f, make: v}))} testId="input-incoming-make" required />
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.model")} *</Label>
                <Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} data-testid="input-incoming-model" />
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.yearLabel")} *</Label>
                <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2025" data-testid="input-incoming-year" />
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.priceLabel")}</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex border border-input rounded-md overflow-hidden text-xs">
                    <button type="button" onClick={() => setForm(f => ({...f, currency: "USD"}))} className={`px-2 py-1 font-bold transition-colors ${form.currency === "USD" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}>$</button>
                    <button type="button" onClick={() => setForm(f => ({...f, currency: "JOD"}))} className={`px-2 py-1 font-bold transition-colors ${form.currency === "JOD" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}>د.أ</button>
                  </div>
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} data-testid="input-incoming-price" className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("filter.exteriorColor")}</Label>
                <Select value={form.color || "none"} onValueChange={v => setForm(f => ({ ...f, color: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    {["white","red","green","blue","lightBlue","gray","black","yellow","teal","silver","gold","brown","orange","beige","purple"].map(c => (
                      <SelectItem key={c} value={c}>{t(`filter.color${c.charAt(0).toUpperCase() + c.slice(1)}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.condition")}</Label>
                <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("marketplace.conditionNew")}</SelectItem>
                    <SelectItem value="used">{t("marketplace.conditionUsed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.mileage")}</Label>
                <Input type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} data-testid="input-incoming-mileage" />
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.bodyType")}</Label>
                <Select value={form.bodyType || "none"} onValueChange={v => setForm(f => ({ ...f, bodyType: v === "none" ? "" : v }))}>
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
              <div className="space-y-2">
                <Label>{t("marketplace.transmission")}</Label>
                <Select value={form.transmission || "none"} onValueChange={v => setForm(f => ({ ...f, transmission: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="automatic">{t("marketplace.automatic")}</SelectItem>
                    <SelectItem value="manual">{t("marketplace.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("marketplace.fuelType")}</Label>
                <Select value={form.fuelType || "none"} onValueChange={v => setForm(f => ({ ...f, fuelType: v === "none" ? "" : v }))}>
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
              <div className="space-y-2">
                <Label>{t("marketplace.engineSize")}</Label>
                <Input value={form.engineSize} onChange={e => setForm(f => ({ ...f, engineSize: e.target.value }))} placeholder="2.0L" data-testid="input-incoming-engine" />
              </div>
              <div className="space-y-2">
                <Label>{t("filter.seats")}</Label>
                <Input type="number" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} data-testid="input-incoming-seats" />
              </div>
              <div className="space-y-2">
                <Label>{t("filter.interiorColor")}</Label>
                <Select value={form.interiorColor || "none"} onValueChange={v => setForm(f => ({ ...f, interiorColor: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    {["white","red","green","blue","lightBlue","gray","black","yellow","teal","silver","gold","brown","orange","beige","purple"].map(c => (
                      <SelectItem key={c} value={c}>{t(`filter.color${c.charAt(0).toUpperCase() + c.slice(1)}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("filter.regionalSpecs")}</Label>
                <Select value={form.regionalSpecs || "none"} onValueChange={v => setForm(f => ({ ...f, regionalSpecs: v === "none" ? "" : v }))}>
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
              <div className="space-y-2">
                <Label>{t("filter.countryOfOrigin")}</Label>
                <Select value={form.countryOfOrigin || "none"} onValueChange={v => setForm(f => ({ ...f, countryOfOrigin: v === "none" ? "" : v }))}>
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
              <div className="space-y-2">
                <Label>{t("filter.license")}</Label>
                <Select value={form.license || "none"} onValueChange={v => setForm(f => ({ ...f, license: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="licensed">{t("filter.licensed")}</SelectItem>
                    <SelectItem value="unlicensed">{t("filter.unlicensed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("filter.insurance")}</Label>
                <Select value={form.insurance || "none"} onValueChange={v => setForm(f => ({ ...f, insurance: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="mandatory">{t("filter.insuranceMandatory")}</SelectItem>
                    <SelectItem value="comprehensive">{t("filter.insuranceComprehensive")}</SelectItem>
                    <SelectItem value="uninsured">{t("filter.insuranceNone")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("filter.customs")}</Label>
                <Select value={form.customs || "none"} onValueChange={v => setForm(f => ({ ...f, customs: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="cleared">{t("filter.customsCleared")}</SelectItem>
                    <SelectItem value="not_cleared">{t("filter.customsNotCleared")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("filter.interiorSpecs")}</Label>
              <div className="flex flex-wrap gap-2">
                {["auxUsb","airbags","powerSeats","steeringControl","seatMemory","powerWindows","centralLock","heatedSeats","cdPlayer","leatherSeats","sportSeats","heatedSteering","rearElectric","cooledSeats","ac","alarm"].map(f => (
                  <button key={f} type="button"
                    onClick={() => setForm(prev => ({ ...prev, interiorFeatures: prev.interiorFeatures.includes(f) ? prev.interiorFeatures.filter(i => i !== f) : [...prev.interiorFeatures, f] }))}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${form.interiorFeatures.includes(f) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}>
                    {t(`filter.int${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>


            <div className="space-y-2">
              <Label>{t("filter.exteriorSpecs")}</Label>
              <div className="flex flex-wrap gap-2">
                {["sunroof","panoramicRoof","rearCamera","360Camera","parkingSensors","frontCamera","ledLights","adaptiveLights","remoteStart","keylessEntry","spareWheel","towHook","roofRack","runFlatTires"].map(f => (
                  <button key={f} type="button"
                    onClick={() => setForm(prev => ({ ...prev, exteriorFeatures: prev.exteriorFeatures.includes(f) ? prev.exteriorFeatures.filter(i => i !== f) : [...prev.exteriorFeatures, f] }))}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${form.exteriorFeatures.includes(f) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}>
                    {t(`filter.ext${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("incoming.form.status")}</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="coming">{t("incoming.status.coming")}</SelectItem>
                  <SelectItem value="arrived">{t("incoming.status.arrived")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("incoming.estimatedArrival")}</Label>
              <Input value={form.estimatedArrival} onChange={e => setForm(f => ({ ...f, estimatedArrival: e.target.value }))}
                placeholder={language === "ar" ? "مثال: خلال أسبوعين" : "e.g. 2 weeks"} data-testid="input-incoming-arrival" />
            </div>

            <div className="space-y-2">
              <Label>{t("marketplace.location")}</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} data-testid="input-incoming-location" />
            </div>

            <div className="space-y-2">
              <Label>{t("marketplace.contactPhone")}</Label>
              <Input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} dir="ltr" data-testid="input-incoming-phone" />
            </div>

            <div className="space-y-2">
              <Label>{t("incoming.details")}</Label>
              <Textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))} className="min-h-[80px]" data-testid="input-incoming-details" />
            </div>

            <div className="flex gap-3 pt-1">
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting} data-testid="button-submit-incoming">
                {isSubmitting ? (language === "ar" ? "جاري الإضافة..." : "Adding...") : t("incoming.addCar")}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>{t("admin.form.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={!!editCar} onOpenChange={open => !open && setEditCar(null)}>
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

            {/* Additional images — existing + new */}
            <div className="space-y-2">
              <Label>{t("admin.form.additionalImages")}</Label>
              <div className="flex flex-wrap gap-2">
                {editExistingImages.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative w-16 h-16">
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
                <input ref={editAdditionalInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditAdditionalImages} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>{t("marketplace.brand")} *</Label>
                <MakeSelect value={editForm.make} onChange={v => setEditForm(f => ({...f, make: v}))} required /></div>
              <div className="space-y-2"><Label>{t("marketplace.model")} *</Label>
                <Input value={editForm.model} onChange={e => setEditForm(f => ({ ...f, model: e.target.value }))} /></div>
              <div className="space-y-2"><Label>{t("marketplace.yearLabel")} *</Label>
                <Input type="number" value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))} placeholder="2025" /></div>
              <div className="space-y-2"><Label>{t("marketplace.priceLabel")}</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex border border-input rounded-md overflow-hidden text-xs">
                    <button type="button" onClick={() => setEditForm(f => ({...f, currency: "USD"}))} className={`px-2 py-1 font-bold transition-colors ${editForm.currency === "USD" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}>$</button>
                    <button type="button" onClick={() => setEditForm(f => ({...f, currency: "JOD"}))} className={`px-2 py-1 font-bold transition-colors ${editForm.currency === "JOD" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}>د.أ</button>
                  </div>
                  <Input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} className="flex-1" />
                </div>
              </div>
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
              <div className="space-y-2"><Label>{t("filter.license")}</Label>
                <Select value={editForm.license || "none"} onValueChange={v => setEditForm(f => ({ ...f, license: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="licensed">{t("filter.licensed")}</SelectItem>
                    <SelectItem value="unlicensed">{t("filter.unlicensed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("filter.insurance")}</Label>
                <Select value={editForm.insurance || "none"} onValueChange={v => setEditForm(f => ({ ...f, insurance: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="mandatory">{t("filter.insuranceMandatory")}</SelectItem>
                    <SelectItem value="comprehensive">{t("filter.insuranceComprehensive")}</SelectItem>
                    <SelectItem value="uninsured">{t("filter.insuranceNone")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("filter.customs")}</Label>
                <Select value={editForm.customs || "none"} onValueChange={v => setEditForm(f => ({ ...f, customs: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder={t("marketplace.selectOption")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                    <SelectItem value="cleared">{t("filter.customsCleared")}</SelectItem>
                    <SelectItem value="not_cleared">{t("filter.customsNotCleared")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("filter.interiorSpecs")}</Label>
              <div className="flex flex-wrap gap-2">
                {["auxUsb","airbags","powerSeats","steeringControl","seatMemory","powerWindows","centralLock","heatedSeats","cdPlayer","leatherSeats","sportSeats","heatedSteering","rearElectric","cooledSeats","ac","alarm"].map(feat => (
                  <button key={feat} type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, interiorFeatures: prev.interiorFeatures.includes(feat) ? prev.interiorFeatures.filter(i => i !== feat) : [...prev.interiorFeatures, feat] }))}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${editForm.interiorFeatures.includes(feat) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}>
                    {t(`filter.int${feat.charAt(0).toUpperCase() + feat.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("filter.exteriorSpecs")}</Label>
              <div className="flex flex-wrap gap-2">
                {["sunroof","panoramicRoof","rearCamera","360Camera","parkingSensors","frontCamera","ledLights","adaptiveLights","remoteStart","keylessEntry","spareWheel","towHook","roofRack","runFlatTires"].map(feat => (
                  <button key={feat} type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, exteriorFeatures: prev.exteriorFeatures.includes(feat) ? prev.exteriorFeatures.filter(i => i !== feat) : [...prev.exteriorFeatures, feat] }))}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${editForm.exteriorFeatures.includes(feat) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-border"}`}>
                    {t(`filter.ext${feat.charAt(0).toUpperCase() + feat.slice(1)}`)}
                  </button>
                ))}
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
              <Button className="flex-1" onClick={handleEditSubmit} disabled={isEditSubmitting} data-testid="button-submit-edit-incoming">
                {isEditSubmitting ? (language === "ar" ? "جاري الحفظ..." : "Saving...") : (language === "ar" ? "حفظ التعديلات" : "Save Changes")}
              </Button>
              <Button variant="outline" onClick={() => setEditCar(null)}>{t("admin.form.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("incoming.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("incoming.delete.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {language === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IncomingSortPopover({ sortBy, setSortBy, language }: { sortBy: string; setSortBy: (v: string) => void; language: string }) {
  const [open, setOpen] = useState(false);
  const ar = language === "ar";

  const categories = [
    {
      key: "posted", icon: Clock,
      label: ar ? "تاريخ الإضافة" : "Posted",
      color: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-500",
      high: { value: "newest", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "oldest", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "year", icon: Calendar,
      label: ar ? "سنة الصنع" : "Year",
      color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500",
      high: { value: "yearNew", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "yearOld", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "price", icon: Tag,
      label: ar ? "السعر" : "Price",
      color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500",
      high: { value: "priceHigh", label: ar ? "الأعلى" : "Highest" },
      low:  { value: "priceLow",  label: ar ? "الأقل"  : "Lowest" },
    },
  ];

  const isActive = sortBy !== "newest";
  const activeLabel = (() => {
    if (!isActive) return ar ? "ترتيب" : "Sort";
    for (const c of categories) {
      if (sortBy === c.high.value) return `${c.label} · ${c.high.label}`;
      if (sortBy === c.low.value)  return `${c.label} · ${c.low.label}`;
    }
    return ar ? "ترتيب" : "Sort";
  })();

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`gap-2 whitespace-nowrap transition-all ${isActive ? "border-primary text-primary bg-primary/5" : ""}`}
        data-testid="button-sort"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span>{activeLabel}</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-base text-foreground">{ar ? "ترتيب حسب" : "Sort By"}</h2>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isHighActive = sortBy === cat.high.value;
                const isLowActive  = sortBy === cat.low.value;
                const isCatActive  = isHighActive || isLowActive;
                return (
                  <div key={cat.key} className={`rounded-xl border-2 overflow-hidden transition-all ${isCatActive ? "border-primary" : "border-border"}`}>
                    <div className={`bg-gradient-to-br ${cat.color} px-3 py-3 flex items-center gap-2`}>
                      <div className="w-7 h-7 rounded-lg bg-background/60 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                    </div>
                    <div className="flex border-t border-border">
                      <button onClick={() => { setSortBy(cat.high.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors border-r border-border ${isHighActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}>
                        <ArrowDown className="w-3.5 h-3.5" />{cat.high.label}
                      </button>
                      <button onClick={() => { setSortBy(cat.low.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${isLowActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}>
                        <ArrowUp className="w-3.5 h-3.5" />{cat.low.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {isActive && (
              <div className="px-4 pb-4">
                <button onClick={() => { setSortBy("newest"); setOpen(false); }}
                  className="w-full py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  {ar ? "إعادة تعيين الترتيب" : "Reset Sort"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function IncomingFilterPanel({
  open, onClose, language,
  selectedStatus, setSelectedStatus,
  selectedBodyType, setSelectedBodyType,
  selectedMake, setSelectedMake,
  onClear,
}: {
  open: boolean; onClose: () => void; language: string;
  selectedStatus: string; setSelectedStatus: (v: string) => void;
  selectedBodyType: string; setSelectedBodyType: (v: string) => void;
  selectedMake: string; setSelectedMake: (v: string) => void;
  onClear: () => void;
}) {
  if (!open) return null;
  const ar = language === "ar";

  return (
    <div className="fixed inset-0 z-50 flex" dir={ar ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-sm bg-background shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300 ${ar ? "mr-0 ml-auto" : "ml-auto mr-0"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">{ar ? "الفلاتر" : "Filters"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* Status */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{ar ? "الحالة" : "Status"}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", label: ar ? "الكل" : "All" },
                { value: "coming", label: ar ? "قيد الشحن" : "Shipping" },
                { value: "arrived", label: ar ? "وصلت" : "Arrived" },
              ].map(s => (
                <button key={s.value} onClick={() => setSelectedStatus(s.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${selectedStatus === s.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{ar ? "نوع الهيكل" : "Body Type"}</p>
            <div className="flex flex-wrap gap-2">
              {BODY_TYPES_QUICK.map((bt) => {
                const active = bt.value !== "" && selectedBodyType === bt.value;
                return (
                  <button key={bt.value || "other"} onClick={() => setSelectedBodyType(active ? "" : bt.value)}
                    className={`flex flex-col items-center gap-1.5 min-w-[72px] px-2 py-2.5 rounded-xl border transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}
                    data-testid={`button-filter-body-type-${bt.value}`}>
                    <span className="w-14 h-8">{bt.svg}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">{ar ? bt.arLabel : bt.enLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Make */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{ar ? "الماركة" : "Make"}</p>
            <div className="flex flex-wrap gap-2">
              {CAR_MAKES_QUICK.map((make) => {
                const active = selectedMake === make.value;
                return (
                  <button key={make.value} onClick={() => setSelectedMake(active ? "" : make.value)}
                    className={`flex flex-col items-center gap-1.5 min-w-[72px] px-2 py-2.5 rounded-xl border transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}
                    data-testid={`button-filter-make-${make.slug}`}>
                    <img src={`https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${make.slug}.png`}
                      alt={make.value} className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wide leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>{ar ? make.arLabel : make.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClear}>{ar ? "مسح الكل" : "Clear All"}</Button>
          <Button className="flex-1" onClick={onClose}>{ar ? "تطبيق" : "Apply"}</Button>
        </div>
      </div>
    </div>
  );
}
