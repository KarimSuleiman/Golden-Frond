import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
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
import { Plus, Trash2, Upload, X, Truck, Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import type { IncomingCar } from "@shared/schema";
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

export default function IncomingCars() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCar, setSelectedCar] = useState<IncomingCar | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const { data: cars, isLoading } = useQuery<IncomingCar[]>({
    queryKey: ["/api/incoming-cars"],
  });

  // Add form state
  const [form, setForm] = useState({
    make: "", model: "", year: "", color: "",
    details: "", status: "coming", estimatedArrival: "",
    price: "", condition: "used", mileage: "", bodyType: "",
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

      const res = await fetch("/api/admin/incoming-cars", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      await queryClient.invalidateQueries({ queryKey: ["/api/incoming-cars"] });
      toast({ title: language === "ar" ? "تم إضافة السيارة" : "Car added successfully" });
      setShowAddModal(false);
      setForm({
        make: "", model: "", year: "", color: "", details: "", status: "coming", estimatedArrival: "",
        price: "", condition: "used", mileage: "", bodyType: "", transmission: "", fuelType: "",
        engineSize: "", seats: "", interiorColor: "", interiorFeatures: [], exteriorFeatures: [],
        regionalSpecs: "", countryOfOrigin: "", license: "", insurance: "", customs: "",
        location: "", contactPhone: "",
      });
      setImageFile(null); setImagePreview("");
      setAdditionalFiles([]); setAdditionalPreviews([]);
    } catch {
      toast({ title: language === "ar" ? "فشل الإضافة" : "Failed to add car", variant: "destructive" });
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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : !cars?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="w-14 h-14 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t("incoming.noCars")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map((car, i) => (
              <motion.div key={car.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden rounded-2xl border border-border hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => { setSelectedCar(car); setCurrentImageIndex(0); }}>
                  <div className="relative h-52 overflow-hidden bg-muted">
                    <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className={`absolute top-3 ${language === "ar" ? "right-3" : "left-3"} text-xs font-semibold ${car.status === "arrived" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                      {car.status === "arrived" ? t("incoming.status.arrived") : t("incoming.status.coming")}
                    </Badge>
                    {authInfo?.isAdmin && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteId(car.id); }}
                        className="absolute top-3 end-3 w-8 h-8 bg-destructive/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-delete-incoming-${car.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold text-lg text-foreground">{car.make} {car.model}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{car.year}</span>
                      {car.color && <span>{language === "ar" ? car.color : car.color}</span>}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Car detail dialog */}
      {selectedCar && (
        <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl" dir={dir}>
            <div className="relative h-64 bg-muted">
              {(() => {
                const imgs = allImages(selectedCar);
                return (
                  <>
                    <img src={imgs[currentImageIndex]} alt="" className="w-full h-full object-cover" />
                    {imgs.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImageIndex(i => (i - 1 + imgs.length) % imgs.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCurrentImageIndex(i => (i + 1) % imgs.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {imgs.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`} />)}
                        </div>
                      </>
                    )}
                    <Badge className={`absolute top-3 start-3 text-xs ${selectedCar.status === "arrived" ? "bg-green-500 text-white" : "bg-primary text-primary-foreground"}`}>
                      {selectedCar.status === "arrived" ? t("incoming.status.arrived") : t("incoming.status.coming")}
                    </Badge>
                  </>
                );
              })()}
            </div>
            <div className="p-5 space-y-3">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedCar.make} {selectedCar.model} {selectedCar.year}</DialogTitle>
              </DialogHeader>
              {selectedCar.color && <p className="text-sm text-muted-foreground">{selectedCar.color}</p>}
              {selectedCar.estimatedArrival && (
                <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  {t("incoming.estimatedArrival")}: {selectedCar.estimatedArrival}
                </p>
              )}
              {selectedCar.details && <p className="text-sm text-foreground/80 leading-relaxed">{selectedCar.details}</p>}
            </div>
          </DialogContent>
        </Dialog>
      )}

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
                <Input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} data-testid="input-incoming-make" />
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
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} data-testid="input-incoming-price" />
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
