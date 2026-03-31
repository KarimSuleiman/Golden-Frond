import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Heart, Phone, MapPin, Calendar, Gauge, Share2, Copy, Mail, Trash2, Edit, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { apiRequest } from "@/lib/queryClient";

interface ListingWithMeta extends Listing {
  isFavorited: boolean;
  seller: { firstName: string | null; lastName: string | null } | null;
}

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const nextImage = (allImgs: string[]) => setCurrentImageIndex(i => (i + 1) % allImgs.length);
  const prevImage = (allImgs: string[]) => setCurrentImageIndex(i => (i - 1 + allImgs.length) % allImgs.length);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Listing>>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editNewImageFiles, setEditNewImageFiles] = useState<File[]>([]);
  const [editNewImagePreviews, setEditNewImagePreviews] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const { data: listing, isLoading } = useQuery<ListingWithMeta>({
    queryKey: ["/api/listings", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${params.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  // Preload all images so switching is instant
  useEffect(() => {
    if (!listing) return;
    const imgs = [listing.imageUrl, ...(listing.images || [])].filter(Boolean);
    imgs.forEach(src => { const i = new Image(); i.src = src; });
  }, [listing]);

  const { data: allListings } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const favMutation = useMutation({
    mutationFn: async () => {
      if (listing?.isFavorited) {
        await fetch(`/api/favorites/${params.id}`, { method: "DELETE", credentials: "include" });
      } else {
        await fetch(`/api/favorites/${params.id}`, { method: "POST", credentials: "include" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/listings/${params.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({ title: t("marketplace.listingDeleted") });
      setLocation("/cars-for-sale");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Listing>) => {
      const res = await fetch(`/api/listings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("فشل تحديث الإعلان");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      setShowEditModal(false);
      toast({ title: "تم تحديث الإعلان" });
    },
    onError: () => {
      toast({ title: t("common.error"), description: "فشل تحديث الإعلان", variant: "destructive" });
    },
  });

  const openEdit = () => {
    if (!listing) return;
    setEditForm({ ...listing });
    setEditImageFile(null);
    setEditImagePreview("");
    setEditExistingImages(listing.images ?? []);
    setEditNewImageFiles([]);
    setEditNewImagePreviews([]);
    setShowEditModal(true);
  };

  const handleAddEditImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setEditNewImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleSaveEdit = async () => {
    if (!listing) return;
    let imageUrl = editForm.imageUrl || listing.imageUrl;
    if (editImageFile) {
      const formData = new FormData();
      formData.append("image", editImageFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { toast({ title: t("common.error"), description: "فشل رفع الصورة", variant: "destructive" }); return; }
      const data = await res.json();
      imageUrl = data.imageUrl;
    }
    const uploadedNew: string[] = [];
    for (const file of editNewImageFiles) {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) { toast({ title: t("common.error"), description: "فشل رفع إحدى الصور الإضافية", variant: "destructive" }); return; }
      const data = await res.json();
      uploadedNew.push(data.imageUrl);
    }
    const allImages = [...editExistingImages, ...uploadedNew];
    // Strip non-DB fields (isFavorited, seller) before sending
    const { isFavorited: _f, seller: _s, ...cleanForm } = editForm as any;
    updateMutation.mutate({ ...cleanForm, imageUrl, images: allImages.length > 0 ? allImages : null });
  };

  const canDelete = authInfo?.isAdmin || (user && listing && listing.sellerId === user.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-md mb-4 bg-secondary" />
          <Skeleton className="h-8 w-1/2 mb-2 bg-secondary" />
          <Skeleton className="h-6 w-1/3 bg-secondary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("marketplace.notFound")}</h1>
          <Link href="/cars-for-sale">
            <Button variant="outline" className="mt-4" data-testid="button-back-to-listings">
              {t("marketplace.backToListings")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [listing.imageUrl, ...(listing.images || [])];
  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft;

  const listingTitle = [listing.make, listing.model, listing.year].filter(Boolean).join(" ");
  const shareUrl = window.location.href;
  const shareText = listingTitle || t("marketplace.title");

  const specs = [
    ...(listing.condition ? [{ label: t("marketplace.condition"), value: listing.condition === "new" ? t("marketplace.conditionNew") : t("marketplace.conditionUsed") }] : []),
    ...(listing.make ? [{ label: t("marketplace.brand"), value: listing.make }] : []),
    ...(listing.model ? [{ label: t("marketplace.model"), value: listing.model }] : []),
    ...(listing.year ? [{ label: t("marketplace.yearLabel"), value: listing.year.toString() }] : []),
    ...(listing.color ? [{ label: t("marketplace.color"), value: listing.color }] : []),
    ...(listing.bodyType ? [{ label: t("marketplace.bodyType"), value: getBodyTypeLabel(listing.bodyType, t) }] : []),
    ...(listing.transmission ? [{ label: t("marketplace.transmission"), value: listing.transmission === "automatic" ? t("marketplace.automatic") : t("marketplace.manual") }] : []),
    ...(listing.fuelType ? [{ label: t("marketplace.fuelType"), value: listing.fuelType }] : []),
    ...(listing.engineSize ? [{ label: t("marketplace.engineSize"), value: listing.engineSize }] : []),
    ...(listing.mileage ? [{ label: t("marketplace.mileage"), value: `${listing.mileage.toLocaleString()} ${t("marketplace.km")}` }] : []),
    ...(listing.location ? [{ label: t("marketplace.location"), value: listing.location }] : []),
  ];

  const suggestedListings = (allListings || [])
    .filter((l) => l.id !== listing.id && l.status === "active")
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link href="/cars-for-sale">
          <Button variant="ghost" className="mb-4" data-testid="button-back-listings">
            <BackArrow className="w-4 h-4" />
            <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.backToListings")}</span>
          </Button>
        </Link>

        <div className="relative rounded-md overflow-hidden mb-6 bg-black group">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={currentImageIndex}
              src={allImages[currentImageIndex]}
              alt={listingTitle}
              className="w-full h-[300px] md:h-[450px] object-contain"
              data-testid="img-listing-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
          </AnimatePresence>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => prevImage(allImages)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100"
                data-testid="button-prev-listing"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => nextImage(allImages)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all md:opacity-0 md:group-hover:opacity-100"
                data-testid="button-next-listing"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentImageIndex ? "bg-white scale-125" : "bg-white/50"
                    }`}
                    data-testid={`button-image-dot-${idx}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className={`absolute bottom-4 ${language === "ar" ? "left-4" : "right-4"} bg-black/60 text-white text-xs px-2 py-1 rounded-md`}>
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <p className="text-primary font-bold text-2xl mb-1" data-testid="text-listing-price">
                {listing.price ? `${listing.price.toLocaleString()} ${t("marketplace.currency")}` : t("marketplace.priceOnRequest")}
              </p>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-listing-title">
                {listingTitle}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {listing.mileage && (
                  <span className="flex items-center gap-1">
                    <Gauge className="w-4 h-4" />
                    {listing.mileage.toLocaleString()} {t("marketplace.km")}
                  </span>
                )}
                {listing.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {listing.year}
                  </span>
                )}
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </span>
                )}
              </div>
            </div>

            {specs.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {specs.map((spec, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0" data-testid={`spec-row-${idx}`}>
                      <span className="text-muted-foreground">{spec.label}</span>
                      <span className="font-medium text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {listing.description && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground mb-2">{t("marketplace.description")}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed" data-testid="text-listing-description">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {suggestedListings.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-foreground mb-4" data-testid="text-suggestions-title">
                  {t("marketplace.suggestedListings")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {suggestedListings.map((item) => (
                    <Link key={item.id} href={`/listing/${item.id}`}>
                      <Card className="overflow-hidden cursor-pointer hover-elevate transition-all" data-testid={`card-suggested-${item.id}`}>
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={[item.make, item.model].filter(Boolean).join(" ")}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-foreground text-sm truncate">
                            {[item.make, item.model, item.year].filter(Boolean).join(" ")}
                          </p>
                          {item.price && (
                            <p className="text-primary font-bold text-sm mt-1">
                              {item.price.toLocaleString()} {t("marketplace.currency")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {listing.contactPhone && (
              <a href={`tel:${listing.contactPhone}`} className="block">
                <Button className="w-full bg-primary text-primary-foreground" data-testid="button-call">
                  <Phone className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"} dir="ltr">{listing.contactPhone}</span>
                </Button>
              </a>
            )}

            {listing.contactPhone && (
              <a href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full" data-testid="button-whatsapp">
                  <SiWhatsapp className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.chat")}</span>
                </Button>
              </a>
            )}

            {user && (
              <Button
                variant="outline"
                className={`w-full ${listing.isFavorited ? "text-red-500 border-red-500/30" : ""}`}
                onClick={() => favMutation.mutate()}
                disabled={favMutation.isPending}
                data-testid="button-toggle-favorite"
              >
                <Heart className={`w-4 h-4 ${listing.isFavorited ? "fill-current" : ""}`} />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>
                  {listing.isFavorited ? t("marketplace.saved") : t("marketplace.saveListing")}
                </span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="button-share">
                  <Share2 className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.share")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({ title: t("marketplace.linkCopied") });
                  }}
                  className="cursor-pointer"
                  data-testid="share-copy-link"
                >
                  <Copy className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.copyLink")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                    data-testid="share-whatsapp"
                  >
                    <SiWhatsapp className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.shareWhatsApp")}</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                    data-testid="share-facebook"
                  >
                    <SiFacebook className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.shareFacebook")}</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                    className="cursor-pointer"
                    data-testid="share-email"
                  >
                    <Mail className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.shareEmail")}</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {listing.seller && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{t("marketplace.seller")}</p>
                  <p className="font-medium text-foreground" data-testid="text-seller-name">
                    {listing.seller.firstName} {listing.seller.lastName}
                  </p>
                </CardContent>
              </Card>
            )}

            {authInfo?.isAdmin && (
              <Button
                variant="outline"
                className="w-full"
                onClick={openEdit}
                data-testid="button-edit-listing"
              >
                <Edit className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>تعديل الإعلان</span>
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteMutation.isPending}
                data-testid="button-delete-listing"
              >
                <Trash2 className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>
                  {t("marketplace.deleteListing")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={language === "ar" ? "text-right" : "text-left"} dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("marketplace.deleteListing")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("marketplace.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={language === "ar" ? "flex-row-reverse gap-2" : "gap-2"}>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {t("admin.delete")}
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t("nav.logout.no")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Listing Modal — admin only */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={dir}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>تعديل الإعلان</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setShowEditModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الصورة الرئيسية</Label>
                <div className="flex items-center gap-3">
                  <img src={editImagePreview || (editForm.imageUrl ?? listing?.imageUrl ?? "")} alt="" className="w-20 h-20 object-cover rounded-lg" />
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    تغيير الصورة
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setEditImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                  </label>
                </div>
              </div>

              {/* Additional photos */}
              <div className="space-y-2">
                <Label>صور إضافية</Label>
                <div className="flex flex-wrap gap-2">
                  {editExistingImages.map((img, idx) => (
                    <div key={`existing-${idx}`} className="relative">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setEditExistingImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {editNewImagePreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="relative">
                      <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditNewImageFiles(prev => prev.filter((_, i) => i !== idx));
                          setEditNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddEditImages} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>الماركة</Label>
                  <Input value={editForm.make || ""} onChange={(e) => setEditForm(f => ({ ...f, make: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>الموديل</Label>
                  <Input value={editForm.model || ""} onChange={(e) => setEditForm(f => ({ ...f, model: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>السنة</Label>
                  <Input type="number" value={editForm.year || ""} onChange={(e) => setEditForm(f => ({ ...f, year: parseInt(e.target.value) || undefined }))} />
                </div>
                <div className="space-y-1">
                  <Label>السعر (د.أ)</Label>
                  <Input type="number" value={editForm.price || ""} onChange={(e) => setEditForm(f => ({ ...f, price: parseInt(e.target.value) || undefined }))} />
                </div>
                <div className="space-y-1">
                  <Label>اللون</Label>
                  <Input value={editForm.color || ""} onChange={(e) => setEditForm(f => ({ ...f, color: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>الكيلومترات</Label>
                  <Input type="number" value={editForm.mileage || ""} onChange={(e) => setEditForm(f => ({ ...f, mileage: parseInt(e.target.value) || undefined }))} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>الوصف</Label>
                <Textarea rows={3} value={editForm.description || ""} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>رقم التواصل</Label>
                <Input value={editForm.contactPhone || ""} onChange={(e) => setEditForm(f => ({ ...f, contactPhone: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label>الحالة</Label>
                <Select value={editForm.status || "active"} onValueChange={(v) => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="hidden">مخفي</SelectItem>
                    <SelectItem value="sold">مباع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
                <Button variant="outline" onClick={() => setShowEditModal(false)}>إلغاء</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="mt-12 py-6 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt={t("common.altLogo")} className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground">{t("landing.brandName")}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="WhatsApp" data-testid="footer-detail-whatsapp">
                <SiWhatsapp className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook" data-testid="footer-detail-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="tel:0796796108" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Phone" data-testid="footer-detail-phone">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("landing.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getBodyTypeLabel(bodyType: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    sedan: "marketplace.bodySedan",
    suv: "marketplace.bodySUV",
    hatchback: "marketplace.bodyHatchback",
    coupe: "marketplace.bodyCoupe",
    pickup: "marketplace.bodyPickup",
    van: "marketplace.bodyVan",
    wagon: "marketplace.bodyWagon",
    convertible: "marketplace.bodyConvertible",
  };
  return map[bodyType] ? t(map[bodyType]) : bodyType;
}
