import { Car, Users, Check } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  fare?: number;
  breakdown?: {
    baseFare: number;
    distanceCharge: number;
    timeCharge: number;
    total: number;
  };
  selected: boolean;
  onSelect: () => void;
}

const vehicleIcons: Record<string, string> = {
  sedan: "🚗",
  suv: "🚙",
  van: "🚐",
  luxury: "✨",
  "xl-van": "🚌",
};

export function VehicleCard({ vehicle, fare, breakdown, selected, onSelect }: VehicleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-lg border p-3 text-left transition-all ${
        selected
          ? "border-[hsl(43,85%,55%)] bg-[hsl(43,85%,55%)]/8 ring-1 ring-[hsl(43,85%,55%)]"
          : "border-border bg-card hover:border-[hsl(43,85%,55%)]/40 hover:bg-card/80"
      }`}
      data-testid={`vehicle-card-${vehicle.slug}`}
    >
      {selected && (
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(43,85%,55%)]">
          <Check className="h-3 w-3 text-[hsl(213,55%,12%)]" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/8 text-lg">
          {vehicleIcons[vehicle.slug] || "🚗"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold truncate">{vehicle.name}</h4>
            {fare !== undefined && (
              <span className="ml-2 whitespace-nowrap text-sm font-bold text-[hsl(43,85%,40%)] dark:text-[hsl(43,85%,60%)]">
                ${fare.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              Up to {vehicle.maxPassengers}
            </span>
            {!fare && (
              <span className="text-xs text-muted-foreground">
                from ${vehicle.baseFare.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {breakdown && selected && (
        <div className="mt-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Base fare</span>
            <span>${breakdown.baseFare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Distance</span>
            <span>${breakdown.distanceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Time</span>
            <span>${breakdown.timeCharge.toFixed(2)}</span>
          </div>
        </div>
      )}

      {vehicle.description && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">{vehicle.description}</p>
      )}
    </button>
  );
}
