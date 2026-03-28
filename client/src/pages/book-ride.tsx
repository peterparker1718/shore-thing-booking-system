import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapDisplay } from "@/components/map-display";
import { VehicleCard } from "@/components/vehicle-card";
import { AIConcierge } from "@/components/ai-concierge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  Navigation,
  FileText,
} from "lucide-react";
import type { Vehicle, QuoteResponse } from "@shared/schema";

export default function BookRide() {
  const { toast } = useToast();

  // Form state
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [time, setTime] = useState("09:00");
  const [passengers, setPassengers] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [moreOptions, setMoreOptions] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Fetch vehicles
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Quote mutation
  const quoteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/quote", {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        passengers,
        pickupDate: date,
        pickupTime: time,
      });
      return (await res.json()) as QuoteResponse;
    },
  });

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: async () => {
      const vehicle = vehicles.find((v) => v.slug === selectedVehicle);
      const quote = quoteMutation.data?.vehicles.find((q) => q.vehicle.slug === selectedVehicle);
      if (!vehicle || !quote) throw new Error("Select a vehicle first");

      const res = await apiRequest("POST", "/api/bookings", {
        vehicleId: vehicle.id,
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        pickupDate: date,
        pickupTime: time,
        passengers,
        distanceMiles: quoteMutation.data?.distanceMiles,
        durationMinutes: quoteMutation.data?.durationMinutes,
        estimatedFare: quote.fare,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "guest@shorething.com",
        customerPhone,
        specialInstructions,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setBookingComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Ride Booked", description: `Confirmation #STT-${data.id}` });
    },
    onError: (err: Error) => {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleGetQuote = () => {
    if (!pickup || !dropoff) {
      toast({ title: "Missing Locations", description: "Enter both pickup and dropoff addresses.", variant: "destructive" });
      return;
    }
    quoteMutation.mutate();
  };

  const handleBook = () => {
    if (!selectedVehicle) {
      toast({ title: "Select a Vehicle", description: "Choose a vehicle to continue.", variant: "destructive" });
      return;
    }
    if (!customerName || !customerEmail) {
      setMoreOptions(true);
      toast({ title: "Contact Info Required", description: "Enter your name and email to book.", variant: "destructive" });
      return;
    }
    bookMutation.mutate();
  };

  const resetForm = () => {
    setPickup("");
    setDropoff("");
    setSelectedVehicle(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSpecialInstructions("");
    setBookingComplete(false);
    setBookingId(null);
    quoteMutation.reset();
  };

  // Booking confirmation view
  if (bookingComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold" data-testid="text-confirmation-title">Ride Confirmed</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirmation #{" "}
            <span className="font-mono font-semibold text-foreground">STT-{bookingId}</span>
          </p>

          <div className="mt-6 space-y-3 text-left text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              <div>
                <p className="font-medium">{pickup}</p>
                <p className="text-xs text-muted-foreground">Pickup</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">{dropoff}</p>
                <p className="text-xs text-muted-foreground">Dropoff</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{date} at {time}</span>
            </div>
          </div>

          <Button onClick={resetForm} className="mt-6 w-full" data-testid="button-book-another">
            Book Another Ride
          </Button>
        </div>
      </div>
    );
  }

  const selectedQuote = quoteMutation.data?.vehicles.find((q) => q.vehicle.slug === selectedVehicle);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-4 md:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Left: Map */}
        <div className="w-full lg:w-[55%]">
          <MapDisplay
            pickupAddress={pickup}
            dropoffAddress={dropoff}
            className="h-[220px] md:h-[320px] lg:h-[calc(100vh-7rem)] lg:sticky lg:top-[4.5rem]"
          />
        </div>

        {/* Right: Form */}
        <div className="w-full space-y-4 lg:w-[45%]">
          {/* Pickup / Dropoff */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="space-y-3">
              <div>
                <Label htmlFor="pickup" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Pickup Location
                </Label>
                <Input
                  id="pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Enter pickup address"
                  className="h-10"
                  data-testid="input-pickup"
                />
              </div>

              <div>
                <Label htmlFor="dropoff" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Dropoff Location
                </Label>
                <Input
                  id="dropoff"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  placeholder="Enter dropoff address"
                  className="h-10"
                  data-testid="input-dropoff"
                />
              </div>

              {/* Date / Time / Passengers row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="date" className="mb-1 text-xs text-muted-foreground">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-9 text-sm"
                    data-testid="input-date"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="mb-1 text-xs text-muted-foreground">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-9 text-sm"
                    data-testid="input-time"
                  />
                </div>
                <div>
                  <Label htmlFor="passengers" className="mb-1 text-xs text-muted-foreground">Guests</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min={1}
                    max={14}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="h-9 text-sm"
                    data-testid="input-passengers"
                  />
                </div>
              </div>

              <Button
                onClick={handleGetQuote}
                disabled={!pickup || !dropoff || quoteMutation.isPending}
                className="w-full bg-[hsl(43,85%,55%)] text-[hsl(213,55%,12%)] hover:bg-[hsl(43,85%,48%)] font-semibold"
                data-testid="button-get-quote"
              >
                {quoteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="mr-2 h-4 w-4" />
                )}
                Get Fare Estimate
              </Button>
            </div>
          </div>

          {/* Quote Results */}
          {quoteMutation.data && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Select Vehicle</h3>
                <span className="text-xs text-muted-foreground">
                  {quoteMutation.data.distanceMiles} mi · ~{quoteMutation.data.durationMinutes} min
                </span>
              </div>

              <div className="space-y-2">
                {quoteMutation.data.vehicles.map((q) => (
                  <VehicleCard
                    key={q.vehicle.slug}
                    vehicle={q.vehicle}
                    fare={q.fare}
                    breakdown={q.breakdown}
                    selected={selectedVehicle === q.vehicle.slug}
                    onSelect={() => setSelectedVehicle(q.vehicle.slug)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* More Options (contact info) */}
          {quoteMutation.data && selectedVehicle && (
            <div className="rounded-lg border bg-card shadow-sm">
              <button
                type="button"
                onClick={() => setMoreOptions(!moreOptions)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium"
                data-testid="button-more-options"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Contact & Details
                </span>
                {moreOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {moreOptions && (
                <div className="space-y-3 border-t px-4 pb-4 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="name" className="mb-1 text-xs text-muted-foreground">Name</Label>
                      <Input
                        id="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Full name"
                        className="h-9 text-sm"
                        data-testid="input-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-1 text-xs text-muted-foreground">Phone</Label>
                      <Input
                        id="phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone number"
                        className="h-9 text-sm"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-1 text-xs text-muted-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Email address"
                      className="h-9 text-sm"
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instructions" className="mb-1 text-xs text-muted-foreground">Special Instructions</Label>
                    <textarea
                      id="instructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Flight number, gate, extra luggage, child seat..."
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-[hsl(43,85%,55%)]"
                      rows={2}
                      data-testid="input-instructions"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Book Button */}
          {quoteMutation.data && selectedVehicle && (
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Fare</span>
                <span className="text-lg font-bold">
                  ${selectedQuote?.fare.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={handleBook}
                disabled={bookMutation.isPending}
                className="w-full bg-[hsl(213,55%,20%)] text-white hover:bg-[hsl(213,55%,25%)] font-semibold h-11"
                data-testid="button-book-ride"
              >
                {bookMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirm Booking
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                No charge now · Pay after ride
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Concierge */}
      <AIConcierge
        context={{
          pickupAddress: pickup,
          dropoffAddress: dropoff,
          vehicleType: selectedVehicle || undefined,
          pickupDate: date,
          pickupTime: time,
        }}
      />
    </div>
  );
}
