import { Car } from "@shared/schema";
import { motion } from "framer-motion";
import { CarFront, Calendar, Palette, Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const statusColors: Record<string, string> = {
    "Purchased": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Reserved": "bg-primary/10 text-primary border-primary/20",
    "In Transit": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden bg-black/50">
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        
        {/* Status Badge floating top right */}
        <Badge 
          className={`absolute top-4 right-4 backdrop-blur-md border ${statusColors[car.status] || "bg-white/10 text-white"}`}
        >
          {car.status}
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
            {car.year} Edition
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <Palette className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider">Color</span>
              <span className="text-sm font-medium">{car.color}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
            <Fingerprint className="w-4 h-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider">VIN (Chassis)</span>
              <span className="text-sm font-medium font-mono truncate max-w-[100px]" title={car.vin}>{car.vin}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />

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
