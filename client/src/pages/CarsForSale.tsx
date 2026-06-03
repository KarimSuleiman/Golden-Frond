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

/* ── Body-type icons – each has a clearly unique silhouette ── */
const S = { w: 2.2 } as const; // shared strokeWidth shorthand

const BODY_TYPES_QUICK = [
  {
    value: "sedan", arLabel: "سيدان", enLabel: "Sedan",
    // 3-box: distinct horizontal trunk deck separate from cabin
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="26" cy="45" r="8" /><circle cx="84" cy="45" r="8" />
        {/* body base rail */}
        <path d="M5 37 H18 M34 37 H76 M92 37 H105" />
        {/* full body outline */}
        <path d="M5 37 L10 30 H20 L28 18 L35 12 H62 L68 20 H76 L80 30 H105 L105 37" />
        {/* trunk lid – key feature: horizontal deck at y=20, lower than roof y=12 */}
        <line x1="68" y1="20" x2="76" y2="20" />
        {/* windows */}
        <path d="M30 18 L36 13 H52 V18 Z" />
        <path d="M54 13 H60 L66 20 H54 Z" />
      </svg>
    ),
  },
  {
    value: "suv", arLabel: "SUV", enLabel: "SUV",
    // tall upright boxy – no sloping hood, high roof, large glass area
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="26" cy="45" r="8" /><circle cx="84" cy="45" r="8" />
        <path d="M5 37 H18 M34 37 H76 M92 37 H105" />
        {/* tall boxy body – very upright sides */}
        <path d="M5 37 L8 30 H18 L20 10 H90 L92 30 H105 L105 37" />
        {/* flat roof */}
        <line x1="20" y1="10" x2="90" y2="10" />
        {/* 3 window bays */}
        <path d="M22 11 H38 V28 H22 Z" />
        <path d="M40 11 H60 V28 H40 Z" />
        <path d="M62 11 H86 V28 H62 Z" />
        {/* roof rails */}
        <line x1="22" y1="9" x2="86" y2="9" />
      </svg>
    ),
  },
  {
    value: "coupe", arLabel: "كوبيه", enLabel: "Coupe",
    // very long low sloping roofline – fastback style, sporty
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="45" r="8" /><circle cx="86" cy="45" r="8" />
        <path d="M3 37 H16 M32 37 H78 M94 37 H107" />
        {/* long swept body – low at both ends */}
        <path d="M3 37 L8 33 H18 L32 15 H68 L88 30 H107 L107 37" />
        {/* single wide window */}
        <path d="M34 15 L52 15 L70 29 H36 Z" />
        {/* long hood line */}
        <line x1="8" y1="33" x2="18" y2="33" />
      </svg>
    ),
  },
  {
    value: "hatchback", arLabel: "هاتشباك", enLabel: "Hatchback",
    // steep near-vertical rear hatch – roof goes directly to bumper
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="26" cy="45" r="8" /><circle cx="82" cy="45" r="8" />
        <path d="M5 37 H18 M34 37 H74 M90 37 H105" />
        {/* body: short hood, cabin, then STEEP rear (no trunk deck) */}
        <path d="M5 37 L10 30 H20 L26 20 L34 13 H64 L74 37 H105 L105 37" />
        {/* steep rear hatch line (the defining feature) */}
        <line x1="64" y1="13" x2="74" y2="37" strokeWidth="2.5" />
        {/* windows */}
        <path d="M28 20 L35 14 H50 V20 Z" />
        <path d="M52 14 H62 L70 30 H52 Z" />
      </svg>
    ),
  },
  {
    value: "pickup", arLabel: "بيكأب", enLabel: "Pickup",
    // cabin + fully open flat bed with rails
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="24" cy="45" r="8" /><circle cx="84" cy="45" r="8" />
        <path d="M3 37 H16 M32 37 H76 M92 37 H107" />
        {/* cab section (left half) */}
        <path d="M3 37 L7 30 H18 L24 18 L30 12 H52 L56 20 L58 30 H72 L72 37" />
        {/* open flat bed (right half) – just side rails top and bottom */}
        <path d="M72 30 H107 L107 37 H72" />
        {/* bed rail at top */}
        <line x1="72" y1="26" x2="107" y2="26" />
        {/* cab window */}
        <path d="M26 18 L32 13 H48 V18 Z" />
        {/* tailgate */}
        <line x1="107" y1="26" x2="107" y2="37" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    value: "van", arLabel: "فان", enLabel: "Van",
    // no hood, flat nose, very tall box with sliding door
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="20" cy="45" r="8" /><circle cx="84" cy="45" r="8" />
        <path d="M3 37 H12 M28 37 H76 M92 37 H107" />
        {/* flat-nosed tall box */}
        <path d="M5 37 L5 10 H96 L100 18 L100 37" />
        {/* roof line */}
        <line x1="5" y1="10" x2="96" y2="10" />
        {/* windscreen (flat / near-vertical) */}
        <path d="M5 10 L5 30 L14 30 L16 10 Z" />
        {/* cab door */}
        <line x1="26" y1="10" x2="26" y2="37" />
        {/* sliding side door */}
        <rect x="38" y="15" width="28" height="22" rx="1" />
        <line x1="52" y1="15" x2="52" y2="37" />
        {/* rear door */}
        <line x1="78" y1="10" x2="78" y2="37" />
      </svg>
    ),
  },
  {
    value: "truck", arLabel: "شاحنة", enLabel: "Truck",
    // high cab with large cargo box / semi style
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="16" cy="45" r="7" /><circle cx="30" cy="45" r="7" /><circle cx="92" cy="45" r="7" />
        <path d="M3 37 H9 M37 37 H85 M99 37 H107" />
        {/* high cab */}
        <path d="M5 37 L5 9 H42 L44 18 L44 37" />
        <line x1="5" y1="9" x2="42" y2="9" />
        {/* cab window */}
        <path d="M7 10 H30 V25 H7 Z" />
        <line x1="20" y1="10" x2="20" y2="25" />
        {/* large cargo box */}
        <path d="M44 10 H107 L107 37 H44 Z" />
        {/* cargo box panels */}
        <line x1="44" y1="10" x2="107" y2="10" />
        <line x1="72" y1="10" x2="72" y2="37" />
      </svg>
    ),
  },
  {
    value: "convertible", arLabel: "مكشوفة", enLabel: "Convertible",
    // completely open top – just door frames and windscreen, no roof
    svg: (
      <svg viewBox="0 0 110 54" fill="none" stroke="currentColor" strokeWidth={S.w} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <circle cx="26" cy="45" r="8" /><circle cx="84" cy="45" r="8" />
        <path d="M5 37 H18 M34 37 H76 M92 37 H105" />
        {/* low body / sill */}
        <path d="M5 37 L10 30 H100 L105 37" />
        {/* windscreen only – A-pillar, no roof */}
        <path d="M28 30 L32 18 H52 L54 30" />
        {/* rear windscreen stub – no roof connecting them */}
        <path d="M70 30 L74 18 H82 L84 30" />
        {/* door sill lines */}
        <line x1="28" y1="30" x2="70" y2="30" />
        <line x1="54" y1="30" x2="70" y2="30" />
        {/* open-top indication: dashed sky area */}
        <path d="M32 18 H74" strokeDasharray="4 3" strokeWidth="1.5" />
        {/* roll bars */}
        <line x1="52" y1="18" x2="52" y2="30" strokeWidth="2.5" />
        <line x1="74" y1="18" x2="74" y2="30" strokeWidth="2.5" />
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
  { value: "BYD", slug: "byd", arLabel: "BYD" },
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
