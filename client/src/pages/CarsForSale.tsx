import { useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useJsonLd } from "@/hooks/use-json-ld";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, MapPin, Calendar, Gauge, X, Phone, ArrowUpDown, ArrowUp, ArrowDown, Tag, Clock } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/logo_optimized.png";
import { FilterPanel, FilterState, emptyFilters, hasActiveFiltersCheck, applyFilters } from "@/components/FilterPanel";
import { CAR_MAKES } from "@/lib/car-makes";
import { BODY_TYPES_QUICK, CAR_MAKES_QUICK } from "@/lib/car-filters";
import type { Listing } from "@shared/schema";

export default function CarsForSale() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters });

  const SITE_ORIGIN = "https://golden-palm.replit.app";

  usePageMeta({
    title: "سيارات للبيع - السعفة الذهبية | سوق السيارات في الأردن",
    description: "تصفح مئات السيارات المعروضة للبيع في السعفة الذهبية. سيارات مستوردة بأسعار تنافسية مع خيارات تصفية متقدمة للبحث عن سيارتك المثالية.",
  });

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  useJsonLd(listings.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "سيارات للبيع - السعفة الذهبية",
    "description": "تصفح السيارات المعروضة للبيع في معرض السعفة الذهبية في الأردن",
    "url": `${SITE_ORIGIN}/cars-for-sale`,
    "numberOfItems": listings.length,
    "itemListElement": listings.slice(0, 50).map((listing, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${SITE_ORIGIN}/listing/${listing.id}`,
      "name": [listing.make, listing.model, listing.year].filter(Boolean).join(" "),
      "item": {
        "@type": "Vehicle",
        "name": [listing.make, listing.model, listing.year].filter(Boolean).join(" "),
        "brand": listing.make ? { "@type": "Brand", "name": listing.make } : undefined,
        "model": listing.model ?? undefined,
        "modelDate": listing.year ? String(listing.year) : undefined,
        "color": listing.color ?? undefined,
        "image": listing.imageUrl.startsWith("http") ? listing.imageUrl : `${SITE_ORIGIN}${listing.imageUrl}`,
        "url": `${SITE_ORIGIN}/listing/${listing.id}`,
        "offers": listing.price ? {
          "@type": "Offer",
          "priceCurrency": "JOD",
          "price": listing.price,
          "availability": "https://schema.org/InStock",
        } : undefined,
      },
    })),
  } : null);

  const filteredListings = useMemo(() => {
    const filtered = applyFilters(listings, filters, searchQuery);
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case "oldest":
        sorted.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        break;
      case "priceLow":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "priceHigh":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "yearNew":
        sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "yearOld":
        sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case "mileageLow":
        sorted.sort((a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity));
        break;
      case "mileageHigh":
        sorted.sort((a, b) => (b.mileage ?? 0) - (a.mileage ?? 0));
        break;
    }
    return sorted;
  }, [listings, filters, searchQuery, sortBy]);

  const hasActiveFilters = searchQuery || hasActiveFiltersCheck(filters);

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({ ...emptyFilters });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (const [, v] of Object.entries(filters)) {
      if (Array.isArray(v)) { if (v.length > 0) count++; }
      else if (v !== "") count++;
    }
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Modern page header */}
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
              <span className="w-6 h-px bg-primary inline-block" />
              {language === "ar" ? "المعرض" : "Showroom"}
              <span className="w-6 h-px bg-primary inline-block" />
            </span>
            <h1
              className="text-3xl md:text-5xl font-black leading-tight mt-[0px] mb-[0px] pt-[4px] pb-[4px]"
              data-testid="text-cars-for-sale-title"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--foreground)) 55%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              {t("marketplace.title")}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base flex items-center gap-2">
              {t("marketplace.subtitle")}
              <span className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold text-xs px-2.5 py-0.5 rounded-full">
                {filteredListings.length}
              </span>
            </p>
          </div>
          {user?.isAdmin === "true" && (
            <Link href="/add-listing">
              <Button data-testid="button-add-listing">
                <Plus className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.addListing")}</span>
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                placeholder={t("marketplace.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={language === "ar" ? "pr-10" : "pl-10"}
                data-testid="input-search-listings"
              />
            </div>
            <SortPopover sortBy={sortBy} setSortBy={setSortBy} language={language} />
            <Button
              variant="outline"
              onClick={() => setShowFilterPanel(true)}
              className="relative"
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.filter")}</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4" />
                <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.filter.clear")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Quick Body Type + Make Filter Bar */}
        <div className="mb-8 space-y-5">
          {/* Body Type */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {language === "ar" ? "نوع الهيكل" : "Body Type"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {BODY_TYPES_QUICK.map((bt) => {
                const active = bt.value !== "" && filters.bodyType === bt.value;
                return (
                  <button
                    key={bt.value || "other"}
                    onClick={() => setFilters(f => ({ ...f, bodyType: active ? "" : bt.value }))}
                    className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                    data-testid={`button-body-type-${bt.value}`}
                  >
                    <span className="w-16 h-9">{bt.svg}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide leading-none">
                      {language === "ar" ? bt.arLabel : bt.enLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Car Make */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {language === "ar" ? "الماركة" : "Make"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {CAR_MAKES_QUICK.map((make) => {
                const active = filters.make === make.value;
                return (
                  <button
                    key={make.value}
                    onClick={() => setFilters(f => ({ ...f, make: active ? "" : make.value }))}
                    className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                    data-testid={`button-make-${make.slug}`}
                  >
                    <img
                      src={`https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${make.slug}.png`}
                      alt={make.value}
                      className="w-12 h-12 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <span className={`text-[11px] font-semibold uppercase tracking-wide leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {language === "ar" ? make.arLabel : make.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 md:h-80 w-full rounded-md bg-secondary" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed">
            <Search className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-no-listings">
              {t("marketplace.noListings")}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {t("marketplace.noListingsDesc")}
            </p>
            {user?.isAdmin === "true" && (
              <Link href="/add-listing">
                <Button className="mt-6" data-testid="button-add-first-listing">
                  <Plus className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.addFirstListing")}</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </main>
      <footer className="py-6 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt={t("common.altLogo")} className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground">{t("landing.brandName")}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="WhatsApp" data-testid="footer-cfs-whatsapp">
                <SiWhatsapp className="w-4 h-4" />
              </a>
              <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook" data-testid="footer-cfs-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="tel:0796796108" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Phone" data-testid="footer-cfs-phone">
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {t("landing.copyright")}
            </p>
          </div>
        </div>
      </footer>
      <FilterPanel
        open={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onFiltersChange={setFilters}
        listings={listings}
        filteredCount={filteredListings.length}
      />
    </div>
  );
}

function SortPopover({ sortBy, setSortBy, language }: { sortBy: string; setSortBy: (v: string) => void; language: string }) {
  const [open, setOpen] = useState(false);
  const ar = language === "ar";

  const categories = [
    {
      key: "posted",
      icon: Clock,
      label: ar ? "تاريخ النشر" : "Posted",
      color: "from-violet-500/20 to-violet-500/5",
      iconColor: "text-violet-500",
      high: { value: "newest", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "oldest", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "year",
      icon: Calendar,
      label: ar ? "سنة الصنع" : "Year",
      color: "from-blue-500/20 to-blue-500/5",
      iconColor: "text-blue-500",
      high: { value: "yearNew", label: ar ? "الأحدث" : "Newest" },
      low:  { value: "yearOld", label: ar ? "الأقدم" : "Oldest" },
    },
    {
      key: "price",
      icon: Tag,
      label: ar ? "السعر" : "Price",
      color: "from-emerald-500/20 to-emerald-500/5",
      iconColor: "text-emerald-500",
      high: { value: "priceHigh", label: ar ? "الأعلى" : "Highest" },
      low:  { value: "priceLow",  label: ar ? "الأقل"  : "Lowest" },
    },
    {
      key: "mileage",
      icon: Gauge,
      label: ar ? "الكيلومترات" : "Mileage",
      color: "from-orange-500/20 to-orange-500/5",
      iconColor: "text-orange-500",
      high: { value: "mileageHigh", label: ar ? "الأعلى" : "Highest" },
      low:  { value: "mileageLow",  label: ar ? "الأقل"  : "Lowest" },
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-base text-foreground">{ar ? "ترتيب حسب" : "Sort By"}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground"
              >
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
                  <div
                    key={cat.key}
                    className={`rounded-xl border-2 overflow-hidden transition-all ${isCatActive ? "border-primary" : "border-border"}`}
                  >
                    <div className={`bg-gradient-to-br ${cat.color} px-3 py-3 flex items-center gap-2`}>
                      <div className="w-7 h-7 rounded-lg bg-background/60 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                      </div>
                      <span className="text-sm font-bold text-foreground">{cat.label}</span>
                    </div>
                    <div className="flex border-t border-border">
                      <button
                        onClick={() => { setSortBy(cat.high.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors border-r border-border ${isHighActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        {cat.high.label}
                      </button>
                      <button
                        onClick={() => { setSortBy(cat.low.value); setOpen(false); }}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${isLowActive ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-foreground"}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        {cat.low.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {isActive && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => { setSortBy("newest"); setOpen(false); }}
                  className="w-full py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
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

const ListingCard = memo(function ListingCard({ listing }: { listing: Listing }) {
  const { t, language } = useLanguage();
  const title = [listing.make, listing.model].filter(Boolean).join(" ") || t("marketplace.vehicle");

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group" data-testid={`listing-card-${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <img
            src={listing.imageUrl || ""}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-car.svg"; }}
          />
          {listing.images && listing.images.length > 0 && (
            <div className={`absolute bottom-2 ${language === "ar" ? "left-2" : "right-2"} bg-black/60 text-white text-xs px-2 py-1 rounded-md`}>
              {listing.images.length + 1}
            </div>
          )}
          <div className={`absolute top-2 ${language === "ar" ? "right-2" : "left-2"}`}>
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${
              listing.condition === "new"
                ? "bg-green-500/90 text-white"
                : "bg-blue-500/90 text-white"
            }`}>
              {listing.condition === "new" ? t("marketplace.conditionNew") : t("marketplace.conditionUsed")}
            </span>
          </div>
        </div>
        <div className="p-2.5 md:p-4">
          <h3 className="font-bold text-foreground text-sm md:text-lg leading-tight mb-1 truncate">
            {title}
          </h3>
          <p className="text-primary font-bold text-sm md:text-xl mb-1.5 md:mb-3" data-testid={`text-price-${listing.id}`}>
            {listing.price ? (listing.currency === "JOD" ? `${listing.price.toLocaleString()} ${language === "ar" ? "د.أ" : "JOD"}` : `$${listing.price.toLocaleString()}`) : t("marketplace.priceOnRequest")}
          </p>
          <div className="flex items-center gap-1.5 md:gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
            {listing.year && (
              <span className="flex items-center gap-0.5 md:gap-1">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {listing.year}
              </span>
            )}
            {listing.mileage && (
              <span className="flex items-center gap-0.5 md:gap-1">
                <Gauge className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {listing.mileage.toLocaleString()}
              </span>
            )}
            {listing.location && (
              <span className="hidden md:flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.location}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
});

/* silence unused-import warning for CAR_MAKES (used in FilterPanel externally) */
void CAR_MAKES;
