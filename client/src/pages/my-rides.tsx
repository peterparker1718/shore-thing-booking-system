import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";
import type { Booking } from "@shared/schema";
import { Link } from "wouter";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function MyRides() {
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" data-testid="text-my-rides-title">My Rides</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {bookings.length} ride{bookings.length !== 1 ? "s" : ""} booked
          </p>
        </div>
        <Link href="/">
          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[hsl(43,85%,55%)] px-3 py-1.5 text-sm font-semibold text-[hsl(213,55%,12%)] transition-colors hover:bg-[hsl(43,85%,48%)]">
            <Car className="h-3.5 w-3.5" />
            Book New
          </span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <h3 className="text-sm font-medium">No rides yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Book your first ride to see it here.
            </p>
            <Link href="/">
              <span className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Book a Ride
              </span>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden" data-testid={`card-booking-${booking.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      STT-{booking.id}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[booking.status] || statusColors.pending}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </div>
                  {booking.estimatedFare && (
                    <span className="flex items-center gap-1 text-sm font-bold">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      {booking.estimatedFare.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                    <p className="text-sm">{booking.pickupAddress}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm">{booking.dropoffAddress}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {booking.pickupDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.pickupTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {booking.passengers}
                  </span>
                  {booking.distanceMiles && (
                    <span>{booking.distanceMiles} mi</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
