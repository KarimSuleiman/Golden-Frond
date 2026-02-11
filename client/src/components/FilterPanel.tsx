import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import type { Listing } from "@shared/schema";

export interface FilterState {
  condition: string;
  make: string;
  model: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  bodyType: string;
  seats: string;
  fuelType: string;
  transmission: string;
  exteriorColor: string;
  interiorColor: string;
  interiorFeatures: string[];
  exteriorFeatures: string[];
  regionalSpecs: string;
  countryOfOrigin: string;
  license: string;
  insurance: string;
  customs: string;
}

export const emptyFilters: FilterState = {
  condition: "",
  make: "",
  model: "",
  minYear: "",
  maxYear: "",
  minPrice: "",
  maxPrice: "",
  bodyType: "",
  seats: "",
  fuelType: "",
  transmission: "",
  exteriorColor: "",
  interiorColor: "",
  interiorFeatures: [],
  exteriorFeatures: [],
  regionalSpecs: "",
  countryOfOrigin: "",
  license: "",
  insurance: "",
  customs: "",
};

export function hasActiveFiltersCheck(filters: FilterState): boolean {
  return Object.entries(filters).some(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== "";
  });
}

export function applyFilters(listings: Listing[], filters: FilterState, searchQuery: string): Listing[] {
  return listings.filter((listing) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (listing.make || "").toLowerCase().includes(q) ||
        (listing.model || "").toLowerCase().includes(q) ||
        (listing.description || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.make && listing.make !== filters.make) return false;
    if (filters.model && listing.model !== filters.model) return false;
    if (filters.minYear) {
      if (!listing.year || listing.year < parseInt(filters.minYear)) return false;
    }
    if (filters.maxYear) {
      if (!listing.year || listing.year > parseInt(filters.maxYear)) return false;
    }
    if (filters.minPrice) {
      if (!listing.price || listing.price < parseInt(filters.minPrice)) return false;
    }
    if (filters.maxPrice) {
      if (!listing.price || listing.price > parseInt(filters.maxPrice)) return false;
    }
    if (filters.bodyType && listing.bodyType !== filters.bodyType) return false;
    if (filters.seats) {
      if (filters.seats === "10") {
        if (!listing.seats || listing.seats < 10) return false;
      } else if (listing.seats !== parseInt(filters.seats)) return false;
    }
    if (filters.fuelType && listing.fuelType !== filters.fuelType) return false;
    if (filters.transmission && listing.transmission !== filters.transmission) return false;
    if (filters.exteriorColor && listing.color !== filters.exteriorColor) return false;
    if (filters.interiorColor && listing.interiorColor !== filters.interiorColor) return false;
    if (filters.interiorFeatures.length > 0) {
      if (!listing.interiorFeatures) return false;
      for (const f of filters.interiorFeatures) {
        if (!listing.interiorFeatures.includes(f)) return false;
      }
    }
    if (filters.exteriorFeatures.length > 0) {
      if (!listing.exteriorFeatures) return false;
      for (const f of filters.exteriorFeatures) {
        if (!listing.exteriorFeatures.includes(f)) return false;
      }
    }
    if (filters.regionalSpecs && listing.regionalSpecs !== filters.regionalSpecs) return false;
    if (filters.countryOfOrigin && listing.countryOfOrigin !== filters.countryOfOrigin) return false;
    if (filters.license && listing.license !== filters.license) return false;
    if (filters.insurance && listing.insurance !== filters.insurance) return false;
    if (filters.customs && listing.customs !== filters.customs) return false;
    return true;
  });
}

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  listings: Listing[];
  filteredCount: number;
}

const COLORS = [
  { key: "white", hex: "#FFFFFF", border: true },
  { key: "red", hex: "#DC2626" },
  { key: "green", hex: "#16A34A" },
  { key: "blue", hex: "#2563EB" },
  { key: "lightBlue", hex: "#38BDF8" },
  { key: "gray", hex: "#6B7280" },
  { key: "black", hex: "#171717" },
  { key: "yellow", hex: "#EAB308" },
  { key: "teal", hex: "#0D9488" },
  { key: "silver", hex: "#C0C0C0", border: true },
  { key: "gold", hex: "#D4A843" },
  { key: "brown", hex: "#92400E" },
  { key: "orange", hex: "#EA580C" },
  { key: "beige", hex: "#D2B48C", border: true },
  { key: "purple", hex: "#7C3AED" },
];

const INTERIOR_FEATURES = [
  "auxUsb", "airbags", "powerSeats", "steeringControl", "seatMemory",
  "powerWindows", "centralLock", "heatedSeats", "cdPlayer", "leatherSeats",
  "sportSeats", "heatedSteering", "rearElectric", "cooledSeats", "ac", "alarm",
];

const EXTERIOR_FEATURES = [
  "daytimeLights", "spareTire", "alloyWheels", "frontSensors", "rearSensors",
  "keylessEntry", "sunroof", "panorama", "powerMirrors", "foldingMirrors",
  "xenonLights", "ledLights", "sportEdition", "rearHook",
];

const BODY_TYPES = [
  { value: "suv", key: "bodySUV" },
  { value: "van", key: "bodyVan" },
  { value: "pickup", key: "bodyPickup" },
  { value: "truck", key: "bodyTruck" },
  { value: "sedan", key: "bodySedan" },
  { value: "convertible", key: "bodyConvertible" },
  { value: "coupe", key: "bodyCoupe" },
  { value: "hatchback", key: "bodyHatchback" },
];

const FUEL_TYPES = [
  { value: "petrol", key: "fuelPetrol" },
  { value: "diesel", key: "fuelDiesel" },
  { value: "electric", key: "fuelElectric" },
  { value: "mild_hybrid", key: "fuelMildHybrid" },
  { value: "hybrid", key: "fuelHybrid" },
  { value: "plugin_hybrid", key: "fuelPluginHybrid" },
];

const REGIONAL_SPECS = [
  { value: "american", key: "specAmerican" },
  { value: "european", key: "specEuropean" },
  { value: "gulf", key: "specGulf" },
  { value: "chinese", key: "specChinese" },
  { value: "korean", key: "specKorean" },
  { value: "japanese", key: "specJapanese" },
  { value: "other", key: "specOther" },
];

const COUNTRIES = [
  { value: "germany", key: "originGermany" },
  { value: "india", key: "originIndia" },
  { value: "japan", key: "originJapan" },
  { value: "usa", key: "originUSA" },
  { value: "iran", key: "originIran" },
  { value: "spain", key: "originSpain" },
  { value: "uae", key: "originUAE" },
  { value: "sweden", key: "originSweden" },
  { value: "china", key: "originChina" },
  { value: "italy", key: "originItaly" },
  { value: "uk", key: "originUK" },
  { value: "russia", key: "originRussia" },
  { value: "france", key: "originFrance" },
  { value: "korea", key: "originKorea" },
  { value: "malaysia", key: "originMalaysia" },
  { value: "netherlands", key: "originNetherlands" },
];

export function FilterPanel({ open, onClose, filters, onFiltersChange, listings, filteredCount }: FilterPanelProps) {
  const { t, language, dir } = useLanguage();
  const [showMoreExtColors, setShowMoreExtColors] = useState(false);
  const [showMoreIntColors, setShowMoreIntColors] = useState(false);
  const [showMoreIntFeatures, setShowMoreIntFeatures] = useState(false);
  const [showMoreExtFeatures, setShowMoreExtFeatures] = useState(false);
  const [showMoreCountries, setShowMoreCountries] = useState(false);

  const uniqueMakes = useMemo(() => {
    return Array.from(new Set(listings.map(l => l.make).filter(Boolean))).sort() as string[];
  }, [listings]);

  const uniqueModels = useMemo(() => {
    const filtered = filters.make
      ? listings.filter(l => l.make === filters.make)
      : listings;
    return Array.from(new Set(filtered.map(l => l.model).filter(Boolean))).sort() as string[];
  }, [listings, filters.make]);

  const update = (key: keyof FilterState, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key: "interiorFeatures" | "exteriorFeatures", item: string) => {
    const arr = filters[key];
    if (arr.includes(item)) {
      update(key, arr.filter(i => i !== item));
    } else {
      update(key, [...arr, item]);
    }
  };

  const clearAll = () => {
    onFiltersChange({ ...emptyFilters });
  };

  if (!open) return null;

  const visibleExtColors = showMoreExtColors ? COLORS : COLORS.slice(0, 9);
  const visibleIntColors = showMoreIntColors ? COLORS : COLORS.slice(0, 9);
  const visibleIntFeatures = showMoreIntFeatures ? INTERIOR_FEATURES : INTERIOR_FEATURES.slice(0, 6);
  const visibleExtFeatures = showMoreExtFeatures ? EXTERIOR_FEATURES : EXTERIOR_FEATURES.slice(0, 6);
  const visibleCountries = showMoreCountries ? COUNTRIES : COUNTRIES.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" dir={dir} data-testid="filter-panel">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground" data-testid="button-close-filter">
          <ChevronLeft className={`w-6 h-6 ${language === "ar" ? "rotate-180" : ""}`} />
        </button>
        <h2 className="text-lg font-bold text-foreground">{t("filter.title")}</h2>
        <button onClick={clearAll} className="text-primary text-sm font-medium" data-testid="button-clear-all-filters">
          {t("filter.clearAll")}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        <FilterSection title={t("filter.condition")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              { value: "new", label: t("marketplace.conditionNew") },
              { value: "used", label: t("marketplace.conditionUsed") },
            ]}
            selected={filters.condition}
            onSelect={(v) => update("condition", v)}
            testIdPrefix="filter-condition"
          />
        </FilterSection>

        <FilterSection title={t("filter.make")}>
          <Select value={filters.make || "all"} onValueChange={(v) => update("make", v === "all" ? "" : v)}>
            <SelectTrigger data-testid="select-filter-make">
              <SelectValue placeholder={t("filter.select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.all")}</SelectItem>
              {uniqueMakes.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t("filter.model")}>
          <Select value={filters.model || "all"} onValueChange={(v) => update("model", v === "all" ? "" : v)}>
            <SelectTrigger data-testid="select-filter-model">
              <SelectValue placeholder={t("filter.select")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.all")}</SelectItem>
              {uniqueModels.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t("filter.yearRange")}>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{t("filter.minYear")}</label>
              <Input
                type="number"
                placeholder="1970"
                value={filters.minYear}
                onChange={(e) => update("minYear", e.target.value)}
                dir="ltr"
                data-testid="input-filter-min-year"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{t("filter.maxYear")}</label>
              <Input
                type="number"
                placeholder="2026"
                value={filters.maxYear}
                onChange={(e) => update("maxYear", e.target.value)}
                dir="ltr"
                data-testid="input-filter-max-year"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t("filter.price")}>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{t("filter.minPrice")}</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
                dir="ltr"
                data-testid="input-filter-min-price"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{t("filter.maxPrice")}</label>
              <Input
                type="number"
                placeholder={t("filter.all")}
                value={filters.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
                dir="ltr"
                data-testid="input-filter-max-price"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t("filter.dinar")}</p>
        </FilterSection>

        <FilterSection title={t("filter.bodyType")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              ...BODY_TYPES.map(b => ({ value: b.value, label: t(`filter.${b.key}`) })),
            ]}
            selected={filters.bodyType}
            onSelect={(v) => update("bodyType", v)}
            testIdPrefix="filter-body"
          />
        </FilterSection>

        <FilterSection title={t("filter.seats")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              ...[2, 3, 4, 5, 6, 7, 8, 9].map(n => ({ value: String(n), label: String(n) })),
              { value: "10", label: t("filter.moreThan9") },
            ]}
            selected={filters.seats}
            onSelect={(v) => update("seats", v)}
            testIdPrefix="filter-seats"
          />
        </FilterSection>

        <FilterSection title={t("filter.fuelType")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              ...FUEL_TYPES.map(f => ({ value: f.value, label: t(`filter.${f.key}`) })),
            ]}
            selected={filters.fuelType}
            onSelect={(v) => update("fuelType", v)}
            testIdPrefix="filter-fuel"
          />
        </FilterSection>

        <FilterSection title={t("filter.transmission")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              { value: "automatic", label: t("filter.automatic") },
              { value: "manual", label: t("filter.manual") },
            ]}
            selected={filters.transmission}
            onSelect={(v) => update("transmission", v)}
            testIdPrefix="filter-trans"
          />
        </FilterSection>

        <FilterSection title={t("filter.exteriorColor")}>
          <ColorPicker
            colors={visibleExtColors}
            selected={filters.exteriorColor}
            onSelect={(v) => update("exteriorColor", v)}
            t={t}
            testIdPrefix="filter-ext-color"
          />
          {COLORS.length > 9 && (
            <button
              onClick={() => setShowMoreExtColors(!showMoreExtColors)}
              className="text-primary text-sm flex items-center gap-1 mt-2"
              data-testid="button-more-ext-colors"
            >
              {showMoreExtColors ? (
                <><ChevronUp className="w-3 h-3" /> {t("filter.lessColors")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {t("filter.moreColors")}</>
              )}
            </button>
          )}
        </FilterSection>

        <FilterSection title={t("filter.interiorColor")}>
          <ColorPicker
            colors={visibleIntColors}
            selected={filters.interiorColor}
            onSelect={(v) => update("interiorColor", v)}
            t={t}
            testIdPrefix="filter-int-color"
          />
          {COLORS.length > 9 && (
            <button
              onClick={() => setShowMoreIntColors(!showMoreIntColors)}
              className="text-primary text-sm flex items-center gap-1 mt-2"
              data-testid="button-more-int-colors"
            >
              {showMoreIntColors ? (
                <><ChevronUp className="w-3 h-3" /> {t("filter.lessColors")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {t("filter.moreColors")}</>
              )}
            </button>
          )}
        </FilterSection>

        <FilterSection title={t("filter.interiorSpecs")}>
          <ChipGroup
            options={[
              { value: "__all__", label: t("filter.all") },
              ...visibleIntFeatures.map(f => ({
                value: f,
                label: t(`filter.int${f.charAt(0).toUpperCase() + f.slice(1)}`),
              })),
            ]}
            selected={filters.interiorFeatures.length === 0 ? "__all__" : ""}
            onSelect={(v) => {
              if (v === "__all__") {
                update("interiorFeatures", []);
              }
            }}
            multiSelected={filters.interiorFeatures}
            onMultiToggle={(v) => {
              if (v !== "__all__") toggleArrayItem("interiorFeatures", v);
            }}
            testIdPrefix="filter-int-feat"
          />
          {INTERIOR_FEATURES.length > 6 && (
            <button
              onClick={() => setShowMoreIntFeatures(!showMoreIntFeatures)}
              className="text-primary text-sm flex items-center gap-1 mt-2"
              data-testid="button-more-int-features"
            >
              {showMoreIntFeatures ? (
                <><ChevronUp className="w-3 h-3" /> {t("filter.showLess")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {t("filter.showMore")}</>
              )}
            </button>
          )}
        </FilterSection>

        <FilterSection title={t("filter.exteriorSpecs")}>
          <ChipGroup
            options={[
              { value: "__all__", label: t("filter.all") },
              ...visibleExtFeatures.map(f => ({
                value: f,
                label: t(`filter.ext${f.charAt(0).toUpperCase() + f.slice(1)}`),
              })),
            ]}
            selected={filters.exteriorFeatures.length === 0 ? "__all__" : ""}
            onSelect={(v) => {
              if (v === "__all__") {
                update("exteriorFeatures", []);
              }
            }}
            multiSelected={filters.exteriorFeatures}
            onMultiToggle={(v) => {
              if (v !== "__all__") toggleArrayItem("exteriorFeatures", v);
            }}
            testIdPrefix="filter-ext-feat"
          />
          {EXTERIOR_FEATURES.length > 6 && (
            <button
              onClick={() => setShowMoreExtFeatures(!showMoreExtFeatures)}
              className="text-primary text-sm flex items-center gap-1 mt-2"
              data-testid="button-more-ext-features"
            >
              {showMoreExtFeatures ? (
                <><ChevronUp className="w-3 h-3" /> {t("filter.showLess")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {t("filter.showMore")}</>
              )}
            </button>
          )}
        </FilterSection>

        <FilterSection title={t("filter.regionalSpecs")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              ...REGIONAL_SPECS.map(s => ({ value: s.value, label: t(`filter.${s.key}`) })),
            ]}
            selected={filters.regionalSpecs}
            onSelect={(v) => update("regionalSpecs", v)}
            testIdPrefix="filter-regional"
          />
        </FilterSection>

        <FilterSection title={t("filter.countryOfOrigin")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              ...visibleCountries.map(c => ({ value: c.value, label: t(`filter.${c.key}`) })),
            ]}
            selected={filters.countryOfOrigin}
            onSelect={(v) => update("countryOfOrigin", v)}
            testIdPrefix="filter-country"
          />
          {COUNTRIES.length > 8 && (
            <button
              onClick={() => setShowMoreCountries(!showMoreCountries)}
              className="text-primary text-sm flex items-center gap-1 mt-2"
              data-testid="button-more-countries"
            >
              {showMoreCountries ? (
                <><ChevronUp className="w-3 h-3" /> {t("filter.showLess")}</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {t("filter.showMore")}</>
              )}
            </button>
          )}
        </FilterSection>

        <FilterSection title={t("filter.license")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              { value: "licensed", label: t("filter.licensed") },
              { value: "unlicensed", label: t("filter.unlicensed") },
            ]}
            selected={filters.license}
            onSelect={(v) => update("license", v)}
            testIdPrefix="filter-license"
          />
        </FilterSection>

        <FilterSection title={t("filter.insurance")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              { value: "mandatory", label: t("filter.insuranceMandatory") },
              { value: "comprehensive", label: t("filter.insuranceComprehensive") },
              { value: "uninsured", label: t("filter.insuranceNone") },
            ]}
            selected={filters.insurance}
            onSelect={(v) => update("insurance", v)}
            testIdPrefix="filter-insurance"
          />
        </FilterSection>

        <FilterSection title={t("filter.customs")}>
          <ChipGroup
            options={[
              { value: "", label: t("filter.all") },
              { value: "cleared", label: t("filter.customsCleared") },
              { value: "not_cleared", label: t("filter.customsNotCleared") },
            ]}
            selected={filters.customs}
            onSelect={(v) => update("customs", v)}
            testIdPrefix="filter-customs"
          />
        </FilterSection>

      </div>

      <div className="p-4 border-t border-border bg-background">
        <Button
          className="w-full"
          onClick={onClose}
          data-testid="button-apply-filters"
        >
          {t("filter.apply")} ({filteredCount})
        </Button>
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-bold text-foreground text-center mb-3">{title}</h3>
      {children}
    </Card>
  );
}

interface ChipOption {
  value: string;
  label: string;
}

function ChipGroup({
  options,
  selected,
  onSelect,
  multiSelected,
  onMultiToggle,
  testIdPrefix,
}: {
  options: ChipOption[];
  selected: string;
  onSelect: (v: string) => void;
  multiSelected?: string[];
  onMultiToggle?: (v: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isMulti = multiSelected && onMultiToggle;
        const isActive = isMulti
          ? (opt.value === "__all__" ? multiSelected.length === 0 : multiSelected.includes(opt.value))
          : selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              if (isMulti && opt.value !== "__all__") {
                onMultiToggle(opt.value);
              } else {
                onSelect(opt.value);
              }
            }}
            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border"
            }`}
            data-testid={`${testIdPrefix}-${opt.value || "all"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({
  colors,
  selected,
  onSelect,
  t,
  testIdPrefix,
}: {
  colors: { key: string; hex: string; border?: boolean }[];
  selected: string;
  onSelect: (v: string) => void;
  t: (key: string) => string;
  testIdPrefix: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onSelect("")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
          !selected
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary text-secondary-foreground border-border"
        }`}
        data-testid={`${testIdPrefix}-all`}
      >
        {t("filter.all")}
      </button>
      {colors.map((c) => (
        <button
          key={c.key}
          onClick={() => onSelect(c.key)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm border transition-colors ${
            selected === c.key
              ? "bg-primary/10 border-primary"
              : "bg-secondary border-border"
          }`}
          data-testid={`${testIdPrefix}-${c.key}`}
        >
          <span
            className={`w-4 h-4 rounded-full inline-block ${c.border ? "border border-border" : ""}`}
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-foreground text-xs">{t(`filter.color${c.key.charAt(0).toUpperCase() + c.key.slice(1)}`)}</span>
        </button>
      ))}
    </div>
  );
}
