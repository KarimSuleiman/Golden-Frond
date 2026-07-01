import { useState, useRef, useEffect } from "react";
import { CAR_MAKES } from "@/lib/car-makes";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

interface MakeSelectProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  testId?: string;
  className?: string;
}

export function MakeSelect({ value, onChange, required, testId, className }: MakeSelectProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!query) onChange("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, onChange]);

  const filtered = query
    ? CAR_MAKES.filter(m => m.toLowerCase().includes(query.toLowerCase()))
    : CAR_MAKES;

  const handleSelect = (brand: string) => {
    onChange(brand);
    setQuery(brand);
    setOpen(false);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={language === "ar" ? "اختر أو اكتب الماركة..." : "Select or type brand..."}
          required={required}
          data-testid={testId}
          className="pr-8 rtl:pr-8 ltr:pr-8"
          autoComplete="off"
        />
        <ChevronDown
          className={`absolute top-1/2 -translate-y-1/2 ${language === "ar" ? "left-2" : "right-2"} w-4 h-4 text-muted-foreground pointer-events-none transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {language === "ar" ? "ماركة مخصصة" : "Custom brand"}
            </div>
          ) : (
            filtered.map(brand => (
              <button
                key={brand}
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(brand); }}
                className={`w-full text-start px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${value === brand ? "font-bold text-primary bg-primary/5" : ""}`}
              >
                {brand}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
