import { useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, MapPin, Calendar, Gauge, X, Phone, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";
import { FilterPanel, FilterState, emptyFilters, hasActiveFiltersCheck, applyFilters } from "@/components/FilterPanel";
import type { Listing } from "@shared/schema";

const BODY_TYPES_QUICK = [
  {
    value: "sedan", arLabel: "سيدان", enLabel: "Sedan",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L8 27 H92 L97 34" />
        <path d="M27 27 C29 27 33 16 36 14 H64 C67 14 71 24 73 27" />
        <line x1="50" y1="14" x2="50" y2="27" />
        <line x1="36" y1="14" x2="36" y2="27" />
        <line x1="64" y1="14" x2="64" y2="27" />
      </svg>
    ),
  },
  {
    value: "suv", arLabel: "SUV", enLabel: "SUV",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L7 27 H93 L97 34" />
        <path d="M20 27 L21 13 H79 L80 27" />
        <line x1="46" y1="13" x2="46" y2="27" />
        <line x1="21" y1="13" x2="79" y2="13" />
      </svg>
    ),
  },
  {
    value: "coupe", arLabel: "كوبيه", enLabel: "Coupe",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L8 27 H92 L97 34" />
        <path d="M25 27 C28 27 36 14 42 13 H68 C73 13 78 24 81 27" />
        <line x1="55" y1="13" x2="55" y2="27" />
      </svg>
    ),
  },
  {
    value: "hatchback", arLabel: "هاتشباك", enLabel: "Hatchback",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L8 27 H92 L97 34" />
        <path d="M24 27 C26 27 32 14 38 13 H70 L78 27" />
        <line x1="52" y1="13" x2="52" y2="27" />
        <line x1="38" y1="13" x2="38" y2="27" />
      </svg>
    ),
  },
  {
    value: "pickup", arLabel: "بيكأب", enLabel: "Pickup",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L7 27 H53 L53 34" />
        <path d="M53 27 H97 L97 34 H53" />
        <path d="M20 27 L22 14 H48 L53 27" />
        <line x1="35" y1="14" x2="35" y2="27" />
        <line x1="55" y1="30" x2="95" y2="30" />
      </svg>
    ),
  },
  {
    value: "van", arLabel: "فان", enLabel: "Van",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="22" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L15 34 M83 34 L97 34" />
        <path d="M3 34 L3 15 H85 L97 27 L97 34" />
        <line x1="3" y1="15" x2="85" y2="15" />
        <line x1="30" y1="15" x2="30" y2="34" />
        <line x1="60" y1="15" x2="60" y2="34" />
        <path d="M85 15 L97 27" />
      </svg>
    ),
  },
  {
    value: "truck", arLabel: "شاحنة", enLabel: "Truck",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="16" cy="41" r="6" /><circle cx="28" cy="41" r="6" /><circle cx="78" cy="41" r="6" />
        <path d="M3 34 L10 34 M34 34 L72 34 M84 34 L97 34" />
        <path d="M3 34 L3 13 H42 L42 34" />
        <path d="M42 20 H97 L97 34 H42" />
        <line x1="3" y1="13" x2="42" y2="13" />
        <line x1="22" y1="13" x2="22" y2="34" />
        <line x1="44" y1="20" x2="95" y2="20" />
      </svg>
    ),
  },
  {
    value: "convertible", arLabel: "مكشوفة", enLabel: "Convertible",
    svg: (
      <svg viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="41" r="7" /><circle cx="76" cy="41" r="7" />
        <path d="M3 34 L17 34 M83 34 L97 34" />
        <path d="M3 34 L8 27 H92 L97 34" />
        <path d="M30 27 L38 19 H62 L70 27" />
        <path d="M38 19 H62" strokeDasharray="3 2" />
        <line x1="50" y1="19" x2="50" y2="27" />
      </svg>
    ),
  },
];

const CAR_MAKES_QUICK = [
  { value: "Toyota", slug: "toyota", arLabel: "تويوتا" },
  { value: "BMW", slug: "bmw", arLabel: "BMW" },
  { value: "Mercedes-Benz", slug: "mercedes-benz", arLabel: "مرسيدس" },
  { value: "Hyundai", slug: "hyundai", arLabel: "هيونداي" },
  { value: "Kia", slug: "kia", arLabel: "كيا" },
  { value: "Nissan", slug: "nissan", arLabel: "نيسان" },
  { value: "Ford", slug: "ford", arLabel: "فورد" },
  { value: "Chevrolet", slug: "chevrolet", arLabel: "شيفروليه" },
  { value: "Volkswagen", slug: "volkswagen", arLabel: "فولكس" },
  { value: "Mitsubishi", slug: "mitsubishi", arLabel: "ميتسوبيشي" },
  { value: "Honda", slug: "honda", arLabel: "هوندا" },
  { value: "Audi", slug: "audi", arLabel: "أودي" },
];

export default function CarsForSale() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

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
              className="text-3xl md:text-5xl font-black leading-tight"
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
          {user && (
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto min-w-[160px]" data-testid="select-sort">
                <ArrowUpDown className="w-4 h-4 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("marketplace.sortNewest")}</SelectItem>
                <SelectItem value="oldest">{t("marketplace.sortOldest")}</SelectItem>
                <SelectItem value="priceLow">{t("marketplace.sortPriceLow")}</SelectItem>
                <SelectItem value="priceHigh">{t("marketplace.sortPriceHigh")}</SelectItem>
                <SelectItem value="yearNew">{t("marketplace.sortYearNew")}</SelectItem>
                <SelectItem value="yearOld">{t("marketplace.sortYearOld")}</SelectItem>
                <SelectItem value="mileageLow">{t("marketplace.sortMileageLow")}</SelectItem>
                <SelectItem value="mileageHigh">{t("marketplace.sortMileageHigh")}</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Quick Body Type + Make Filter Bar — visible to all users */}
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
                const active = filters.bodyType === bt.value;
                return (
                  <button
                    key={bt.value}
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
            {user && (
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
            {listing.price ? `${listing.price.toLocaleString()} ${t("marketplace.currency")}` : t("marketplace.priceOnRequest")}
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
