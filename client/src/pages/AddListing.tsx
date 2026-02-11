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

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    color: "",
    condition: "used",
    mileage: "",
    bodyType: "",
    transmission: "",
    fuelType: "",
    engineSize: "",
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

    let imageUrl = "";
    try {
      const result = await uploadMutation.mutateAsync(imageFile);
      imageUrl = result.imageUrl;
    } catch {
      return;
    }

    const uploadedAdditional: string[] = [];
    for (const file of additionalImages) {
      try {
        const result = await uploadMutation.mutateAsync(file);
        uploadedAdditional.push(result.imageUrl);
      } catch {
        return;
      }
    }

    createMutation.mutate({
      make: form.make || null,
      model: form.model || null,
      year: form.year ? parseInt(form.year) : null,
      price: form.price ? parseInt(form.price) : null,
      color: form.color || null,
      condition: form.condition || "used",
      imageUrl,
      images: uploadedAdditional.length > 0 ? uploadedAdditional : null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      bodyType: form.bodyType || null,
      transmission: form.transmission || null,
      fuelType: form.fuelType || null,
      engineSize: form.engineSize || null,
      location: form.location || null,
      description: form.description || null,
      contactPhone: form.contactPhone || null,
    });
  };

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;
  const isSubmitting = uploadMutation.isPending || createMutation.isPending;

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
                  <Label>{t("marketplace.color")}</Label>
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} data-testid="input-color" />
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
                      <SelectItem value="sedan">{t("marketplace.bodySedan")}</SelectItem>
                      <SelectItem value="suv">{t("marketplace.bodySUV")}</SelectItem>
                      <SelectItem value="hatchback">{t("marketplace.bodyHatchback")}</SelectItem>
                      <SelectItem value="coupe">{t("marketplace.bodyCoupe")}</SelectItem>
                      <SelectItem value="pickup">{t("marketplace.bodyPickup")}</SelectItem>
                      <SelectItem value="van">{t("marketplace.bodyVan")}</SelectItem>
                      <SelectItem value="wagon">{t("marketplace.bodyWagon")}</SelectItem>
                      <SelectItem value="convertible">{t("marketplace.bodyConvertible")}</SelectItem>
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
                      <SelectItem value="petrol">{t("marketplace.petrol")}</SelectItem>
                      <SelectItem value="diesel">{t("marketplace.diesel")}</SelectItem>
                      <SelectItem value="hybrid">{t("marketplace.hybrid")}</SelectItem>
                      <SelectItem value="electric">{t("marketplace.electric")}</SelectItem>
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
                  <label className="w-20 h-20 border-2 border-dashed border-border rounded-md flex items-center justify-center cursor-pointer hover:border-primary/50">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImages} />
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
