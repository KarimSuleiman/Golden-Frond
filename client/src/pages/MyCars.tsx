import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car as CarIcon, Package, Ship, ExternalLink, Search, ArrowUpDown, ArrowUp, ArrowDown, Clock, Tag, Filter, X } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Link, Redirect } from "wouter";
import logoImage from "@assets/logo_optimized.png";
import type { Car } from "@shared/schema";
import { BODY_TYPES_QUICK, CAR_MAKES_QUICK } from "@/lib/car-filters";

export default function MyCars() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { t, language, dir } = useLanguage();
  usePageMeta({ title: "سياراتي - السعفة الذهبية", description: "تتبع سياراتك المشتراة وتفاصيل شحنها في منصة السعفة الذهبية." });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string; isTrader: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const { data: cars, isLoading, error } = useQuery<Car[]>({
    queryKey: ["/api/trader/cars"],
    enabled: !!user && authInfo?.isTrader === true,
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
  }, [cars, searchQuery, selectedBodyType, selectedMake, sortBy]);

  const hasActiveFilters = searchQuery || selectedBodyType || selectedMake;

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (selectedBodyType) n++;
    if (selectedMake) n++;
    if (searchQuery) n++;
    return n;
  }, [selectedBodyType, selectedMake, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBodyType("");
    setSelectedMake("");
    setSortBy("newest");
  };

  if (!isAuthLoading && !user) return <Redirect to="/login" />;
  if (authInfo && !authInfo.isTrader) return <Redirect to="/" />;
  if (isAuthLoading || isLoading || !authInfo) return <MyCarsSkeleton />;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Purchased": return t("car.status.purchased");
      case "Reserved": return t("car.status.reserved");
      case "In Transit": return t("car.status.inTransit");
      case "In Loading": return t("car.status.inLoading");
      default: return status;
    }
  };

  const statusColors: Record<string, string> = {
    "Purchased": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
    "In Loading": "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-2" data-testid="text-my-cars-title">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.welcome")} {user?.firstName || t("dashboard.welcomeSuffix")}
            {cars && cars.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold ms-2">
                {cars.length}
              </span>
            )}
          </p>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed shadow-sm">
            <h3 className="text-2xl font-bold text-foreground mb-2">{t("dashboard.errorLoading")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{t("dashboard.errorDesc")}</p>
          </div>
        ) : cars && cars.length > 0 ? (
          <>
            {/* Search + Sort + Filter bar */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                  <Input
                    placeholder={language === "ar" ? "ابحث عن سيارة..." : "Search for a car..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={language === "ar" ? "pr-10" : "pl-10"}
                    data-testid="input-mycars-search"
                  />
                </div>
                <MyCarsSortPopover sortBy={sortBy} setSortBy={setSortBy} language={language} />
                <Button
                  variant="outline"
                  onClick={() => setShowFilterPanel(true)}
                  className="relative"
                  data-testid="button-mycars-toggle-filters"
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
                  <Button variant="ghost" onClick={clearAllFilters} data-testid="button-mycars-clear-filters">
                    <X className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-1" : "ml-1"}>{language === "ar" ? "مسح" : "Clear"}</span>
                  </Button>
                )}
              </div>
            </div>

            <MyCarsFilterPanel
              open={showFilterPanel}
              onClose={() => setShowFilterPanel(false)}
              language={language}
              selectedBodyType={selectedBodyType}
              setSelectedBodyType={setSelectedBodyType}
              selectedMake={selectedMake}
              setSelectedMake={setSelectedMake}
              onClear={clearAllFilters}
            />

            {/* Body Type */}
            <div className="mb-8 space-y-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {language === "ar" ? "نوع الهيكل" : "Body Type"}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {BODY_TYPES_QUICK.map((bt) => {
                    const active = bt.value !== "" && selectedBodyType === bt.value;
                    return (
                      <button
                        key={bt.value || "other"}
                        onClick={() => setSelectedBodyType(active ? "" : bt.value)}
                        className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                        data-testid={`button-mycars-body-type-${bt.value}`}
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

              {/* Make */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {language === "ar" ? "الماركة" : "Make"}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {CAR_MAKES_QUICK.map((make) => {
                    const active = selectedMake === make.value;
                    return (
                      <button
                        key={make.value}
                        onClick={() => setSelectedMake(active ? "" : make.value)}
                        className={`flex flex-col items-center gap-2 min-w-[82px] px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                          active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"
                        }`}
                        data-testid={`button-mycars-make-${make.slug}`}
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

            {/* Cars grid */}
            {filteredCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <CarIcon className="w-14 h-14 text-muted-foreground/40 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  {language === "ar" ? "لا توجد سيارات تطابق الفلتر" : "No cars match the filter"}
                </p>
                <Button variant="ghost" className="mt-3" onClick={clearAllFilters}>
                  {language === "ar" ? "مسح الفلاتر" : "Clear filters"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCars.map((car) => (
                  <Link key={car.id} href={`/car/${car.id}`}>
                    <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group" data-testid={`card-car-${car.id}`}>
                      <div className="relative aspect-video overflow-hidden bg-secondary">
                        <img
                          src={car.imageUrl || ""}
                          alt={[car.make, car.model].filter(Boolean).join(" ") || t("dashboard.vehicle")}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-car.svg"; }}
                        />
                        <Badge
                          className={`absolute top-3 ${language === "ar" ? "right-3" : "left-3"} border shadow-sm ${statusColors[car.status] || "bg-gray-100 text-gray-700"}`}
                          data-testid={`badge-status-${car.id}`}
                        >
                          {getStatusLabel(car.status)}
                        </Badge>
                        {car.images && car.images.length > 0 && (
                          <div className={`absolute bottom-2 ${language === "ar" ? "left-2" : "right-2"} bg-black/60 text-white text-xs px-2 py-1 rounded-md`}>
                            {car.images.length + 1}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-bold text-foreground text-lg">
                          {car.make} {car.model} <span className="text-muted-foreground font-normal">{car.year}</span>
                        </h3>
                        {car.price && (
                          <p className="text-primary font-bold text-xl" data-testid={`text-car-price-${car.id}`}>
                            {car.currency === "JOD" ? `${car.price.toLocaleString()} د.أ` : `$${car.price.toLocaleString()}`}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          {car.containerNumber && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" />
                              {car.containerNumber}
                            </span>
                          )}
                          {car.bookingNumber && (
                            <span className="flex items-center gap-1">
                              <Ship className="w-3.5 h-3.5" />
                              {car.bookingNumber}
                            </span>
                          )}
                          {car.trackingUrl && (
                            <span className="flex items-center gap-1 text-primary">
                              <ExternalLink className="w-3.5 h-3.5" />
                              {t("carDetail.openLink")}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-card rounded-md border border-border border-dashed shadow-sm">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
              <CarIcon className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-no-cars">
              {t("dashboard.noCarsTitle")}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {t("dashboard.noCars")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("dashboard.contactSupport")}
            </p>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={logoImage} alt={t("common.altLogo")} className="h-12 w-auto" />
              </div>
              <p className="text-lg font-display font-bold text-foreground">{t("footer.trackingTagline")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.trackingDesc")}</p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all" data-testid="footer-whatsapp">
                  <SiWhatsapp className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all" data-testid="footer-facebook">
                  <SiFacebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">{t("footer.quickLinks")}</h3>
              <ul className="space-y-3">
                <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">{t("footer.home")}</a></li>
                <li><a href="/cars-for-sale" className="text-muted-foreground hover:text-foreground transition-colors">{t("nav.carsForSale")}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-4">{t("footer.contactUs")}</h3>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-center gap-2">
                    <SiWhatsapp className="w-4 h-4 text-muted-foreground" />
                    <a href="https://wa.me/962796796108" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors text-sm" dir="ltr">+962-796796108</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t("landing.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MyCarsSortPopover({ sortBy, setSortBy, language }: { sortBy: string; setSortBy: (v: string) => void; language: string }) {
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
      key: "year", icon: ArrowUpDown,
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
        data-testid="button-mycars-sort"
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

function MyCarsFilterPanel({
  open, onClose, language,
  selectedBodyType, setSelectedBodyType,
  selectedMake, setSelectedMake,
  onClear,
}: {
  open: boolean; onClose: () => void; language: string;
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">{ar ? "الفلاتر" : "Filters"}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{ar ? "نوع الهيكل" : "Body Type"}</p>
            <div className="flex flex-wrap gap-2">
              {BODY_TYPES_QUICK.map((bt) => {
                const active = bt.value !== "" && selectedBodyType === bt.value;
                return (
                  <button key={bt.value || "other"} onClick={() => setSelectedBodyType(active ? "" : bt.value)}
                    className={`flex flex-col items-center gap-1.5 min-w-[72px] px-2 py-2.5 rounded-xl border transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
                    <span className="w-14 h-8">{bt.svg}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">{ar ? bt.arLabel : bt.enLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{ar ? "الماركة" : "Make"}</p>
            <div className="flex flex-wrap gap-2">
              {CAR_MAKES_QUICK.map((make) => {
                const active = selectedMake === make.value;
                return (
                  <button key={make.value} onClick={() => setSelectedMake(active ? "" : make.value)}
                    className={`flex flex-col items-center gap-1.5 min-w-[72px] px-2 py-2.5 rounded-xl border transition-all ${active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50"}`}>
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

        <div className="shrink-0 px-5 py-4 border-t border-border flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClear}>{ar ? "مسح الكل" : "Clear All"}</Button>
          <Button className="flex-1" onClick={onClose}>{ar ? "تطبيق" : "Apply"}</Button>
        </div>
      </div>
    </div>
  );
}

function MyCarsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-20 border-b border-border bg-card" />
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-64 mb-4 bg-secondary" />
        <Skeleton className="h-6 w-96 mb-12 bg-secondary" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-md bg-secondary" />
          ))}
        </div>
      </div>
    </div>
  );
}
