import { Link, useLocation } from "wouter";
import { Sun, Moon, Car, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface HeaderProps {
  theme: string;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Book a Ride" },
    { href: "/rides", label: "My Rides" },
    { href: "/account", label: "Account" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-[hsl(213,55%,14%)] text-[hsl(45,30%,95%)]" data-testid="header">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 no-underline" data-testid="link-home">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[hsl(43,85%,55%)]">
            <Car className="h-4.5 w-4.5 text-[hsl(213,55%,12%)]" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-[hsl(45,30%,97%)]">Shore Thing</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[hsl(43,85%,55%)]">Transportation</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" data-testid="nav-desktop">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white/12 text-[hsl(43,85%,55%)]"
                      : "text-[hsl(45,20%,80%)] hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-8 w-8 text-[hsl(45,20%,80%)] hover:bg-white/10 hover:text-white"
            data-testid="button-theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-8 w-8 text-[hsl(45,20%,80%)] hover:bg-white/10 md:hidden"
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-white/10 px-4 py-2 md:hidden" data-testid="nav-mobile">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <span
                  className={`block rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${
                    isActive
                      ? "bg-white/12 text-[hsl(43,85%,55%)]"
                      : "text-[hsl(45,20%,80%)] hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
