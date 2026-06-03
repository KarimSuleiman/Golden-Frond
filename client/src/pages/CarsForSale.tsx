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

/* ── Body-type icons – solid-fill silhouettes ── */
const CUT = { fill: "hsl(var(--card))" } as const;

const BODY_TYPES_QUICK = [
  {
    value: "coupe", arLabel: "كوبيه", enLabel: "Coupe",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* very low, long hood, swept fastback rear */}
        <path fill="currentColor" d="M4 60 Q8 52 16 48 L28 45 L44 38 Q54 22 68 14 L96 10 L140 10 Q162 10 172 30 L178 46 Q182 54 188 58 L192 60 Z"/>
        <path style={CUT} d="M70 16 L80 12 H136 Q156 12 166 28 L164 46 H72 Z"/>
        <circle fill="currentColor" cx="44" cy="70" r="15"/>
        <circle style={CUT} cx="44" cy="70" r="6"/>
        <circle fill="currentColor" cx="156" cy="70" r="15"/>
        <circle style={CUT} cx="156" cy="70" r="6"/>
      </svg>
    ),
  },
  {
    value: "sedan", arLabel: "سيدان", enLabel: "Sedan",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* 3-box: short hood, cabin, distinct trunk deck step */}
        <path fill="currentColor" d="M4 60 Q8 54 14 50 L28 47 L38 38 Q46 24 60 18 L86 14 L132 14 Q144 14 150 24 L158 40 L163 46 Q167 50 172 50 Q178 52 184 56 L190 60 Z"/>
        <path style={CUT} d="M50 36 Q44 28 42 38 H84 V20 Z"/>
        <path style={CUT} d="M88 16 H130 Q142 16 148 26 L146 38 H88 Z"/>
        <circle fill="currentColor" cx="44" cy="70" r="14"/>
        <circle style={CUT} cx="44" cy="70" r="5"/>
        <circle fill="currentColor" cx="153" cy="70" r="14"/>
        <circle style={CUT} cx="153" cy="70" r="5"/>
      </svg>
    ),
  },
  {
    value: "suv", arLabel: "SUV", enLabel: "SUV",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* tall upright body, short nose, high clearance */}
        <path fill="currentColor" d="M4 62 Q8 56 14 52 L22 50 L24 8 H174 L176 50 L184 54 Q190 58 193 62 Z"/>
        <path style={CUT} d="M26 10 H72 V46 H26 Z"/>
        <path style={CUT} d="M76 10 H120 V46 H76 Z"/>
        <path style={CUT} d="M124 10 H172 V46 H124 Z"/>
        <circle fill="currentColor" cx="44" cy="72" r="16"/>
        <circle style={CUT} cx="44" cy="72" r="6"/>
        <circle fill="currentColor" cx="156" cy="72" r="16"/>
        <circle style={CUT} cx="156" cy="72" r="6"/>
      </svg>
    ),
  },
  {
    value: "hatchback", arLabel: "هاتش", enLabel: "Hatch",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* like sedan front, steep rear hatch — no trunk deck */}
        <path fill="currentColor" d="M4 60 Q8 54 14 50 L28 47 L38 38 Q46 24 60 18 L86 14 L134 14 Q144 14 150 24 L162 60 Z"/>
        <path style={CUT} d="M50 36 Q44 28 42 38 H84 V20 Z"/>
        <path style={CUT} d="M88 16 H132 Q142 16 148 26 L158 54 H88 Z"/>
        <circle fill="currentColor" cx="44" cy="70" r="14"/>
        <circle style={CUT} cx="44" cy="70" r="5"/>
        <circle fill="currentColor" cx="148" cy="70" r="14"/>
        <circle style={CUT} cx="148" cy="70" r="5"/>
      </svg>
    ),
  },
  {
    value: "van", arLabel: "واجن", enLabel: "Wagon",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* flat roof extending all the way to vertical rear — estate/wagon */}
        <path fill="currentColor" d="M4 60 Q8 54 14 50 L28 47 L38 38 Q46 24 60 18 L86 14 L156 14 Q162 14 164 18 L168 40 Q170 50 174 54 L186 58 L190 60 Z"/>
        <path style={CUT} d="M50 36 Q44 28 42 38 H84 V20 Z"/>
        <path style={CUT} d="M88 16 H154 Q160 16 162 20 L160 36 H88 Z"/>
        <circle fill="currentColor" cx="44" cy="70" r="14"/>
        <circle style={CUT} cx="44" cy="70" r="5"/>
        <circle fill="currentColor" cx="155" cy="70" r="14"/>
        <circle style={CUT} cx="155" cy="70" r="5"/>
      </svg>
    ),
  },
  {
    value: "pickup", arLabel: "بيكأب", enLabel: "Pickup",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* cab on left + open flatbed with rails on right */}
        <path fill="currentColor" d="M4 60 Q8 54 14 50 L24 48 L32 36 Q40 20 54 14 H92 Q98 14 100 22 L102 42 Q104 50 106 54 L108 60 Z"/>
        <path fill="currentColor" d="M108 46 H184 Q188 46 190 50 L192 60 H108 Z"/>
        <line stroke="currentColor" strokeWidth="4" x1="108" y1="46" x2="192" y2="46"/>
        <path style={CUT} d="M34 36 Q40 22 54 16 H88 L94 36 H34 Z"/>
        <circle fill="currentColor" cx="40" cy="70" r="14"/>
        <circle style={CUT} cx="40" cy="70" r="5"/>
        <circle fill="currentColor" cx="162" cy="70" r="14"/>
        <circle style={CUT} cx="162" cy="70" r="5"/>
      </svg>
    ),
  },
  {
    value: "minivan", arLabel: "ميني فان", enLabel: "Minivan",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* CUV/crossover — taller than sedan, softer than SUV, rounded roof */}
        <path fill="currentColor" d="M4 62 Q8 56 14 52 L22 50 Q26 12 34 8 H162 Q168 8 172 16 L176 50 Q180 56 186 60 L192 62 Z"/>
        <path style={CUT} d="M36 10 H86 V46 H36 Z"/>
        <path style={CUT} d="M90 10 H136 V46 H90 Z"/>
        <path style={CUT} d="M140 10 H168 V46 H140 Z"/>
        <circle fill="currentColor" cx="42" cy="72" r="15"/>
        <circle style={CUT} cx="42" cy="72" r="6"/>
        <circle fill="currentColor" cx="158" cy="72" r="15"/>
        <circle style={CUT} cx="158" cy="72" r="6"/>
      </svg>
    ),
  },
  {
    value: "truck", arLabel: "تجاري", enLabel: "Commercial",
    svg: (
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* high cab + large cargo box, dual rear axle */}
        <path fill="currentColor" d="M4 62 L4 8 H52 L56 18 L56 62 Z"/>
        <path fill="currentColor" d="M56 16 H194 V62 H56 Z"/>
        <path style={CUT} d="M6 10 H46 V42 H6 Z"/>
        <line stroke="hsl(var(--card))" strokeWidth="3" x1="26" y1="10" x2="26" y2="42"/>
        <line stroke="hsl(var(--card))" strokeWidth="3" x1="58" y1="16" x2="192" y2="16"/>
        <line stroke="hsl(var(--card))" strokeWidth="3" x1="124" y1="16" x2="124" y2="62"/>
        <circle fill="currentColor" cx="22" cy="70" r="12"/>
        <circle style={CUT} cx="22" cy="70" r="5"/>
        <circle fill="currentColor" cx="136" cy="70" r="12"/>
        <circle style={CUT} cx="136" cy="70" r="5"/>
        <circle fill="currentColor" cx="160" cy="70" r="12"/>
        <circle style={CUT} cx="160" cy="70" r="5"/>
      </svg>
    ),
  },
  {
    value: "", arLabel: "أخرى", enLabel: "Other",
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* steering wheel */}
        <circle fill="currentColor" cx="50" cy="50" r="40"/>
        <circle style={CUT} cx="50" cy="50" r="32"/>
        <circle fill="currentColor" cx="50" cy="50" r="10"/>
        <rect fill="currentColor" x="46" y="18" width="8" height="22"/>
        <rect fill="currentColor" x="46" y="60" width="8" height="22"/>
        <rect fill="currentColor" x="18" y="46" width="22" height="8"/>
        <rect fill="currentColor" x="60" y="46" width="22" height="8"/>
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
