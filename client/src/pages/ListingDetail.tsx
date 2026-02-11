import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Heart, Phone, MapPin, Calendar, Gauge, Share2, Copy, Mail } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useState } from "react";
import type { Listing } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { data: listing, isLoading } = useQuery<ListingWithMeta>({
    queryKey: ["/api/listings", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${params.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

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

        <div className="relative rounded-md overflow-hidden mb-6 bg-black">
          <img
            src={allImages[currentImageIndex]}
            alt={listingTitle}
            className="w-full h-[300px] md:h-[450px] object-contain"
            data-testid="img-listing-main"
          />
          {allImages.length > 1 && (
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
          </div>
        </div>
      </div>
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
