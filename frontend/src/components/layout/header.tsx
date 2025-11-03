"use client";

import { Link, usePathname } from "@/lib/i18n-routing";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Header() {
  const t = useTranslations("Navigation");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("products"), href: "/products" },
    { name: t("news"), href: "/news" },
    { name: t("about"), href: "/about" },
  ];

  const isActive = (href: string) => pathname === href;
  const isHome = pathname === "/";
  const isTransparent = isHome && !isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent border-transparent"
          : "bg-white/95 backdrop-blur-sm shadow-sm"
      )}
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-20 items-center justify-between gap-8">
          {/* Logo */}
          <div className="shrink-0">
            <Link
              href="/"
              className="flex items-center group"
              aria-label="LHNX Home"
            >
              <span
                className={cn(
                  "text-2xl font-bold tracking-tight transition-colors duration-200",
                  isTransparent
                    ? "text-white group-hover:text-blue-400"
                    : "text-foreground group-hover:text-blue-500"
                )}
              >
                LHNX
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8 lg:flex-1 lg:justify-center">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-lg font-medium transition-colors duration-200 py-2",
                  isActive(item.href)
                    ? "text-blue-500"
                    : isTransparent
                    ? "text-white/80 hover:text-blue-400"
                    : "text-foreground/70 hover:text-blue-500"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0 justify-end">
            <div className="hidden lg:block">
              <LanguageSwitcher
                variant={isTransparent ? "transparent" : "default"}
              />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className={cn(
                "lg:hidden inline-flex items-center justify-center rounded-md p-2 transition-colors duration-200",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-foreground hover:bg-accent"
              )}
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl lg:hidden">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <Link
                  href="/"
                  className="flex items-center group"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="LHNX Home"
                >
                  <span className="text-xl font-bold text-foreground group-hover:text-blue-500 transition-colors">
                    LHNX
                  </span>
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:bg-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <nav className="space-y-1" aria-label="Mobile navigation">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-blue-500/10 text-blue-500"
                          : "text-foreground/80 hover:bg-blue-500/10 hover:text-blue-500"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-border px-6 py-6 space-y-4">
                <LanguageSwitcher variant="default" />
                <Button className="w-full font-medium" size="lg" asChild>
                  <Link href="/login">{t("login")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
