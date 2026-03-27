import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, ArrowRight, ArrowLeft } from "lucide-react";

export default function AddListing() {
  const [, setLocation] = useLocation();
  const { t, language, dir } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    color: "",
    interiorColor: "",
    condition: "used",
    mileage: "",
    bodyType: "",
    transmission: "",
    fuelType: "",
    engineSize: "",
    seats: "",
    interiorFeatures: [] as string[],
    exteriorFeatures: [] as string[],
    regionalSpecs: "",
    countryOfOrigin: "",
    license: "",
    insurance: "",
    customs: "",
    location: "",
    description: "",
    contactPhone: "",
  });

  if (!authLoading && !user) {
    window.location.href = "/login";
    return null;
  }

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      return res.json();
    },
  });

  const uploadImageDirect = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "فشل رفع الصورة");
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("خطأ في إنشاء الإعلان");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      toast({ title: t("marketplace.listingCreated") });
      setLocation("/cars-for-sale");
    },
    onError: (error: Error) => {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    },
  });

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
    setAdditionalImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setAdditionalPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeAdditional = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast({ title: t("common.error"), description: t("marketplace.imageRequired"), variant: "destructive" });
      return;
    }

    setIsUploading(true);

    let imageUrl = "";
    try {
      imageUrl = await uploadImageDirect(imageFile);
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message || "فشل رفع الصورة الرئيسية", variant: "destructive" });
      setIsUploading(false);
      return;
    }

    const uploadedAdditional: string[] = [];
    for (const file of additionalImages) {
      try {
        const url = await uploadImageDirect(file);
        uploadedAdditional.push(url);
      } catch (err: any) {
        toast({ title: t("common.error"), description: `فشل رفع إحدى الصور الإضافية: ${err.message || ""}`, variant: "destructive" });
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    createMutation.mutate({
      make: form.make || null,
      model: form.model || null,
      year: form.year ? parseInt(form.year) : null,
      price: form.price ? parseInt(form.price) : null,
      color: form.color || null,
      interiorColor: form.interiorColor || null,
      condition: form.condition || "used",
      imageUrl,
      images: uploadedAdditional.length > 0 ? uploadedAdditional : null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      bodyType: form.bodyType || null,
      transmission: form.transmission || null,
      fuelType: form.fuelType || null,
      engineSize: form.engineSize || null,
      seats: form.seats ? parseInt(form.seats) : null,
      interiorFeatures: form.interiorFeatures.length > 0 ? form.interiorFeatures : null,
      exteriorFeatures: form.exteriorFeatures.length > 0 ? form.exteriorFeatures : null,
      regionalSpecs: form.regionalSpecs || null,
      countryOfOrigin: form.countryOfOrigin || null,
      license: form.license || null,
      insurance: form.insurance || null,
      customs: form.customs || null,
      location: form.location || null,
      description: form.description || null,
      contactPhone: form.contactPhone || null,
    });
  };

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;
  const isSubmitting = isUploading || createMutation.isPending;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => setLocation("/cars-for-sale")} data-testid="button-back">
          <BackArrow className="w-4 h-4" />
          <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.backToListings")}</span>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t("marketplace.addListing")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("admin.form.mainImage")}</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 text-white" onClick={() => { setImageFile(null); setImagePreview(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">{t("admin.form.selectImage")}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} data-testid="input-main-image" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.brand")}</Label>
                  <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} data-testid="input-make" />
                </div>
                <div className="space-y-2">
                  <Label>{t("marketplace.model")}</Label>
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} data-testid="input-model" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.yearLabel")}</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2025" data-testid="input-year" />
                </div>
                <div className="space-y-2">
                  <Label>{t("marketplace.priceLabel")}</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="input-price" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("filter.exteriorColor")}</Label>
                  <Select value={form.color || "none"} onValueChange={(v) => setForm({ ...form, color: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-color">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
                  <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                    <SelectTrigger data-testid="select-condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t("marketplace.conditionNew")}</SelectItem>
                      <SelectItem value="used">{t("marketplace.conditionUsed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.mileage")}</Label>
                  <Input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} data-testid="input-mileage" />
                </div>
                <div className="space-y-2">
                  <Label>{t("marketplace.bodyType")}</Label>
                  <Select value={form.bodyType} onValueChange={(v) => setForm({ ...form, bodyType: v })}>
                    <SelectTrigger data-testid="select-body-type">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.transmission")}</Label>
                  <Select value={form.transmission} onValueChange={(v) => setForm({ ...form, transmission: v })}>
                    <SelectTrigger data-testid="select-transmission">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">{t("marketplace.automatic")}</SelectItem>
                      <SelectItem value="manual">{t("marketplace.manual")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("marketplace.fuelType")}</Label>
                  <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                    <SelectTrigger data-testid="select-fuel">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">{t("filter.fuelPetrol")}</SelectItem>
                      <SelectItem value="diesel">{t("filter.fuelDiesel")}</SelectItem>
                      <SelectItem value="electric">{t("filter.fuelElectric")}</SelectItem>
                      <SelectItem value="mild_hybrid">{t("filter.fuelMildHybrid")}</SelectItem>
                      <SelectItem value="hybrid">{t("filter.fuelHybrid")}</SelectItem>
                      <SelectItem value="plugin_hybrid">{t("filter.fuelPluginHybrid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.engineSize")}</Label>
                  <Input value={form.engineSize} onChange={(e) => setForm({ ...form, engineSize: e.target.value })} placeholder="2.0L" data-testid="input-engine" />
                </div>
                <div className="space-y-2">
                  <Label>{t("filter.seats")}</Label>
                  <Input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} data-testid="input-seats" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("filter.interiorColor")}</Label>
                  <Select value={form.interiorColor || "none"} onValueChange={(v) => setForm({ ...form, interiorColor: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-interior-color">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
                  <Select value={form.regionalSpecs || "none"} onValueChange={(v) => setForm({ ...form, regionalSpecs: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-regional-specs">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("filter.countryOfOrigin")}</Label>
                  <Select value={form.countryOfOrigin || "none"} onValueChange={(v) => setForm({ ...form, countryOfOrigin: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-country-origin">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
                  <Select value={form.license || "none"} onValueChange={(v) => setForm({ ...form, license: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-license">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("marketplace.selectOption")}</SelectItem>
                      <SelectItem value="licensed">{t("filter.licensed")}</SelectItem>
                      <SelectItem value="unlicensed">{t("filter.unlicensed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("filter.insurance")}</Label>
                  <Select value={form.insurance || "none"} onValueChange={(v) => setForm({ ...form, insurance: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-insurance">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
                  <Select value={form.customs || "none"} onValueChange={(v) => setForm({ ...form, customs: v === "none" ? "" : v })}>
                    <SelectTrigger data-testid="select-customs">
                      <SelectValue placeholder={t("marketplace.selectOption")} />
                    </SelectTrigger>
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
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        const arr = form.interiorFeatures;
                        setForm({
                          ...form,
                          interiorFeatures: arr.includes(f)
                            ? arr.filter(i => i !== f)
                            : [...arr, f],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        form.interiorFeatures.includes(f)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-secondary-foreground border-border"
                      }`}
                      data-testid={`chip-int-${f}`}
                    >
                      {t(`filter.int${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("filter.exteriorSpecs")}</Label>
                <div className="flex flex-wrap gap-2">
                  {["daytimeLights","spareTire","alloyWheels","frontSensors","rearSensors","keylessEntry","sunroof","panorama","powerMirrors","foldingMirrors","xenonLights","ledLights","sportEdition","rearHook"].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        const arr = form.exteriorFeatures;
                        setForm({
                          ...form,
                          exteriorFeatures: arr.includes(f)
                            ? arr.filter(i => i !== f)
                            : [...arr, f],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        form.exteriorFeatures.includes(f)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary text-secondary-foreground border-border"
                      }`}
                      data-testid={`chip-ext-${f}`}
                    >
                      {t(`filter.ext${f.charAt(0).toUpperCase() + f.slice(1)}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("marketplace.location")}</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} data-testid="input-location" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("marketplace.contactPhone")}</Label>
                <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} dir="ltr" placeholder="07XXXXXXXX" data-testid="input-phone" />
              </div>

              <div className="space-y-2">
                <Label>{t("marketplace.description")}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[100px]" data-testid="input-description" />
              </div>

              <div className="space-y-2">
                <Label>{t("admin.form.additionalImages")}</Label>
                <div className="flex gap-2 flex-wrap">
                  {additionalPreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-20 h-20">
                      <img src={preview} alt="" className="w-full h-full object-cover rounded-md" />
                      <button type="button" onClick={() => removeAdditional(idx)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label
                    className="w-20 h-20 border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50"
                    data-testid="label-additional-images"
                    onClick={(e) => {
                      const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0, overflow: 'hidden' }}
                      onChange={handleAdditionalImages}
                      data-testid="input-additional-images"
                    />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="button-submit-listing">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("common.loading")}</span>
                  </>
                ) : (
                  t("marketplace.publishListing")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
