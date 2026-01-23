import { Car } from "@shared/schema";
import { motion } from "framer-motion";
import { CarFront, Calendar, Palette, Fingerprint, Ship, Package, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const statusColors: Record<string, string> = {
    "Purchased": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "In Transit": "bg-blue-100 text-blue-700 border-blue-200",
  };

  const statusLabels: Record<string, string> = {
    "Purchased": "تم الشراء",
    "Reserved": "محجوز",
    "In Transit": "قيد الشحن",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent opacity-80" />
        
        {/* Status Badge floating top right */}
        <Badge 
          className={`absolute top-4 right-4 border shadow-sm ${statusColors[car.status] || "bg-gray-100 text-gray-700"}`}
        >
          {statusLabels[car.status] || car.status}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="mb-4">
          <h3 className="text-2xl font-display font-bold text-foreground mb-1">
            {car.make} <span className="text-primary">{car.model}</span>
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            موديل {car.year}
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
            <Palette className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider">اللون</span>
              <span className="text-sm font-medium">{car.color}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary border border-border">
            <Fingerprint className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider">رقم الشاصي</span>
              <span className="text-sm font-medium font-mono truncate max-w-[100px]" title={car.vin}>{car.vin}</span>
            </div>
          </div>
        </div>

        {/* Shipping/Tracking Info - Only show for In Transit cars */}
        {car.status === "In Transit" && (car.containerNumber || car.bookingNumber) && (
          <>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-3" />
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                <Ship className="w-4 h-4" />
                <span>معلومات الشحن</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                {car.containerNumber && (
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">رقم الكونتينر:</span>
                    <span className="font-mono font-medium text-foreground">{car.containerNumber}</span>
                  </div>
                )}
                {car.bookingNumber && (
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">رقم الحجز:</span>
                    <span className="font-mono font-medium text-foreground">{car.bookingNumber}</span>
                  </div>
                )}
              </div>

              {car.trackingUrl && (
                <a
                  href={car.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors w-full justify-center"
                  data-testid={`link-track-car-${car.id}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  تتبع الشحنة
                </a>
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-2" />

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>ID: #{car.id.toString().padStart(4, '0')}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(car.createdAt!).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
