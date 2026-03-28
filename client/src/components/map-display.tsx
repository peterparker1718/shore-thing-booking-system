import { MapPin, Navigation } from "lucide-react";

interface MapDisplayProps {
  pickupAddress?: string;
  dropoffAddress?: string;
  className?: string;
}

export function MapDisplay({ pickupAddress, dropoffAddress, className = "" }: MapDisplayProps) {
  const hasLocations = pickupAddress || dropoffAddress;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-card ${className}`}
      data-testid="map-display"
    >
      {/* Map placeholder — Shows a stylized map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,40%,92%)] via-[hsl(213,30%,95%)] to-[hsl(200,25%,90%)] dark:from-[hsl(213,40%,10%)] dark:via-[hsl(213,30%,12%)] dark:to-[hsl(200,25%,14%)]">
        {/* Grid lines to simulate a map */}
        <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <pattern id="roads" width="120" height="120" patternUnits="userSpaceOnUse">
              <line x1="60" y1="0" x2="60" y2="120" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#roads)" opacity="0.5" />
        </svg>

        {/* Decorative map elements */}
        <div className="absolute left-[20%] top-[30%] h-3 w-3 rounded-full bg-[hsl(43,85%,55%)] opacity-40" />
        <div className="absolute left-[60%] top-[50%] h-2 w-2 rounded-full bg-[hsl(213,55%,40%)] opacity-30" />
        <div className="absolute left-[40%] top-[70%] h-4 w-4 rounded-full bg-[hsl(213,55%,40%)] opacity-20" />
      </div>

      {/* Content overlay */}
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6">
        {!hasLocations ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Navigation className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Google Maps Integration</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your Google Maps API key to enable live routing
              </p>
            </div>
            <div className="rounded-md bg-[hsl(43,85%,55%)]/10 px-3 py-1.5 text-xs font-medium text-[hsl(43,85%,35%)] dark:text-[hsl(43,85%,65%)]">
              YOUR_GOOGLE_MAPS_API_KEY
            </div>
          </>
        ) : (
          <div className="flex w-full flex-col gap-3">
            {pickupAddress && (
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium">{pickupAddress}</p>
                </div>
              </div>
            )}

            {pickupAddress && dropoffAddress && (
              <div className="ml-2.5 h-8 border-l-2 border-dashed border-muted-foreground/30" />
            )}

            {dropoffAddress && (
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(0,72%,48%)]">
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dropoff</p>
                  <p className="text-sm font-medium">{dropoffAddress}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
