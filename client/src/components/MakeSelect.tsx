import { CAR_MAKES } from "@/lib/car-makes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";

interface MakeSelectProps {
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  testId?: string;
  className?: string;
}

export function MakeSelect({ value, onChange, required, testId, className }: MakeSelectProps) {
  const { language } = useLanguage();
  const isCustom = !!value && !CAR_MAKES.includes(value);
  const selectVal = isCustom ? "__other__" : (value || "");

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Select
        value={selectVal}
        onValueChange={v => {
          if (v === "__other__") {
            onChange("");
          } else {
            onChange(v);
          }
        }}
      >
        <SelectTrigger data-testid={testId}>
          <SelectValue placeholder={language === "ar" ? "اختر الماركة" : "Select brand"} />
        </SelectTrigger>
        <SelectContent>
          {CAR_MAKES.map(m => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
          <SelectItem value="__other__">{language === "ar" ? "أخرى" : "Other"}</SelectItem>
        </SelectContent>
      </Select>
      {(selectVal === "__other__" || isCustom) && (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={language === "ar" ? "اكتب الماركة..." : "Type brand..."}
          required={required}
        />
      )}
    </div>
  );
}
