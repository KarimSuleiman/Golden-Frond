import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, MapPin, Calendar, Gauge, Heart, X, Phone } from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";
import type { Listing } from "@shared/schema";

export default function CarsForSale() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMake, setFilterMake] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterPriceRange, setFilterPriceRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const uniqueMakes = useMemo(() => {
    const makes = Array.from(new Set(listings.map((l) => l.make).filter(Boolean))) as string[];
    return makes.sort();
  }, [listings]);

  const uniqueYears = useMemo(() => {
    const years = Array.from(new Set(listings.map((l) => l.year).filter(Boolean))) as number[];
    return years.sort((a, b) => b - a);
  }, [listings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (listing.make || "").toLowerCase().includes(query) ||
          (listing.model || "").toLowerCase().includes(query) ||
          (listing.description || "").toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filterMake && filterMake !== "all" && listing.make !== filterMake) return false;
      if (filterYear && filterYear !== "all" && listing.year !== parseInt(filterYear)) return false;
      if (filterCondition && filterCondition !== "all" && listing.condition !== filterCondition) return false;
      if (filterPriceRange && filterPriceRange !== "all") {
        if (!listing.price) return false;
        const [min, max] = filterPriceRange.split("-").map(Number);
        if (max) {
          if (listing.price < min || listing.price > max) return false;
        } else {
          if (listing.price < min) return false;
        }
      }
      return true;
    });
  }, [listings, searchQuery, filterMake, filterYear, filterCondition, filterPriceRange]);

  const hasActiveFilters = searchQuery || filterMake || filterYear || filterCondition || filterPriceRange;

  const clearFilters = () => {
    setSearchQuery("");
    setFilterMake("");
    setFilterYear("");
    setFilterCondition("");
    setFilterPriceRange("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-cars-for-sale-title">
              {t("marketplace.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("marketplace.subtitle")} ({filteredListings.length})
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="w-4 h-4" />
              <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("marketplace.filter")}</span>
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="w-4 h-4" />
                <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("admin.filter.clear")}</span>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select value={filterMake} onValueChange={setFilterMake}>
                <SelectTrigger data-testid="select-filter-make">
                  <SelectValue placeholder={t("marketplace.allBrands")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("marketplace.allBrands")}</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger data-testid="select-filter-year">
                  <SelectValue placeholder={t("admin.filter.allYears")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("admin.filter.allYears")}</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger data-testid="select-filter-condition">
                  <SelectValue placeholder={t("marketplace.allConditions")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("marketplace.allConditions")}</SelectItem>
                  <SelectItem value="new">{t("marketplace.conditionNew")}</SelectItem>
                  <SelectItem value="used">{t("marketplace.conditionUsed")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriceRange} onValueChange={setFilterPriceRange}>
                <SelectTrigger data-testid="select-filter-price">
                  <SelectValue placeholder={t("marketplace.allPrices")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("marketplace.allPrices")}</SelectItem>
                  <SelectItem value="0-10000">{t("marketplace.priceUnder10k")}</SelectItem>
                  <SelectItem value="10000-25000">{t("marketplace.price10to25k")}</SelectItem>
                  <SelectItem value="25000-50000">{t("marketplace.price25to50k")}</SelectItem>
                  <SelectItem value="50000-0">{t("marketplace.priceOver50k")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-md bg-secondary" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const { t, language } = useLanguage();

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden cursor-pointer hover-elevate transition-all group" data-testid={`listing-card-${listing.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.imageUrl}
            alt={`${listing.make} ${listing.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {listing.make} {listing.model}
            </h3>
          </div>
          <p className="text-primary font-bold text-xl mb-3" data-testid={`text-price-${listing.id}`}>
            {listing.price ? `${listing.price.toLocaleString()} ${t("marketplace.currency")}` : t("marketplace.priceOnRequest")}
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {listing.year}
            </span>
            {listing.mileage && (
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                {listing.mileage.toLocaleString()} {t("marketplace.km")}
              </span>
            )}
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.location}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
