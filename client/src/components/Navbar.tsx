import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Heart,
  Home,
  Menu,
  X,
  Settings,
  Globe,
  Info,
  Phone,
  Mail,
  Truck,
  MapPin,
  ChevronDown,
  Car,
} from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import logoImage from "@assets/image_1769171762465.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, dir } = useLanguage();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { data: authInfo } = useQuery<{ isAdmin: boolean; role: string; isMainAdmin: boolean; isTrader: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const isAdminCheck = authInfo;

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/cars-for-sale", label: t("nav.carsForSale"), icon: Car },
    { href: "/incoming-cars", label: t("nav.incomingCars"), icon: Truck },
    ...(authInfo?.isTrader
      ? [
          {
            href: "/my-cars",
            label: t("dashboard.title"),
            icon: Car,
          },
        ]
      : []),
    ...(user
      ? [
          {
            href: "/dashboard",
            label: t("dashboard.favorites"),
            icon: Heart,
          },
        ]
      : []),
    ...(!isAdminCheck?.isAdmin
      ? [
          {
            href: "/#about",
            label: t("nav.aboutUs"),
            icon: Info,
            isAnchor: true,
            iconOnly: true,
          },
        ]
      : []),
    ...(isAdminCheck?.isAdmin
      ? [{ href: "/admin", label: t("admin.title"), icon: Settings }]
      : []),
  ];

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const id = href.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  const contactOptions = [
    {
      icon: Phone,
      label: t("landing.phone"),
      value: "0796796108",
      href: "tel:0796796108",
      color: "text-green-600",
    },
    {
      icon: SiWhatsapp,
      label: t("landing.whatsapp"),
      value: "0796796108",
      href: "https://wa.me/962798860078",
      color: "text-green-500",
    },
    {
      icon: Mail,
      label: t("landing.email"),
      value: "amairehkareem@gmail.com",
      href: "mailto:amairehkareem@gmail.com",
      color: "text-red-500",
    },
    {
      icon: SiFacebook,
      label: t("landing.facebook"),
      value: "golden.frond.gallery",
      href: "https://www.facebook.com/golden.frond.gallery",
      color: "text-blue-600",
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-xl shadow-sm"
      dir={dir}
    >
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
        {/* Left side: Logo + utility icons (About, Contact, Language) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center group cursor-pointer"
          >
            <img
              src={logoImage}
              alt={t("common.altLogo")}
              className="h-10 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Utility icons beside logo - desktop only */}
          <div className="hidden md:flex items-center gap-3">
            {/* About Us icon */}
            {!isAdminCheck?.isAdmin && (
              <a
                href="/#about"
                onClick={(e) => handleAnchorClick(e, "/#about")}
                title={t("nav.aboutUs")}
                className="text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                data-testid="link-about-icon"
              >
                <Info className="w-5 h-5" />
              </a>
            )}

            {/* Contact Dropdown icon */}
            {!isAdminCheck?.isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-foreground/70 hover:text-primary transition-colors cursor-pointer"
                    title={t("nav.contactUs")}
                    data-testid="button-contact-dropdown"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={language === "ar" ? "end" : "start"}
                  className="w-64"
                >
                  {contactOptions.map((option, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <a
                        href={option.href}
                        target={
                          option.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          option.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        data-testid={`contact-option-${index}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} bg-current/10`}
                        >
                          <option.icon className={`w-5 h-5 ${option.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {option.label}
                          </p>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {option.value}
                          </p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Language Toggle icon */}
            <button
              onClick={toggleLanguage}
              title={t("common.langToggleFull")}
              className="text-foreground/70 hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
              data-testid="button-language-toggle"
            >
              <Globe className="w-5 h-5" />
              <span className="text-lg leading-none">{language === "ar" ? "🇬🇧" : "🇯🇴"}</span>
            </button>
          </div>
        </div>

        {/* Right side: Main nav links + login/logout */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks.filter((link) => !link.iconOnly).map((link) =>
            link.isAnchor ? (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href
                    ? "text-primary font-semibold"
                    : "text-foreground/70"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href
                      ? "text-primary font-semibold"
                      : "text-foreground/70"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            ),
          )}

          <div
            className={`${language === "ar" ? "pr-4 border-r" : "pl-4 border-l"} border-border`}
          >
            {user ? (
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(true)}
                className="text-foreground/70 hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>
                  {t("nav.logout")}
                </span>
              </Button>
            ) : (
              <a href="/login">
                <Button
                  className="bg-primary text-primary-foreground font-bold shadow-md"
                  data-testid="button-login"
                >
                  {t("nav.login")}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Mobile: Language button + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-foreground/80 hover:text-primary hover:bg-secondary transition-colors text-sm font-medium"
            data-testid="button-language-toggle-mobile"
          >
            <Globe className="w-4 h-4" />
            <span className="text-base leading-none">{language === "ar" ? "🇬🇧" : "🇯🇴"}</span>
          </button>
          <button
            className="text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card"
          >
            <div className="p-4 space-y-4">
              {navLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      handleAnchorClick(e, link.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <span>{link.label}</span>
                  </a>
                ) : (
                  <Link key={link.href} href={link.href}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="w-5 h-5 text-primary" />
                      <span>{link.label}</span>
                    </div>
                  </Link>
                ),
              )}

              {/* Contact Options Mobile - For all non-admin users including guests */}
              {!isAdminCheck?.isAdmin && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-3">
                    {t("nav.contactUs")}
                  </p>
                  {contactOptions.map((option, index) => (
                    <a
                      key={index}
                      href={option.href}
                      target={
                        option.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        option.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${option.color} bg-current/10`}
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {option.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {/* Language Toggle Mobile */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-xl leading-none">{language === "ar" ? "🇬🇧" : "🇯🇴"}</span>
                <span>{t("common.langToggleFull")}</span>
              </div>

              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowLogoutDialog(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>
                      {t("nav.logout")}
                    </span>
                  </Button>
                ) : (
                  <a href="/login" className="block w-full">
                    <Button
                      className="w-full bg-primary text-primary-foreground font-bold"
                      data-testid="button-login-mobile"
                    >
                      {t("nav.login")}
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent
          className={language === "ar" ? "text-right" : "text-left"}
          dir={dir}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nav.logout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nav.logout.confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter
            className={language === "ar" ? "flex-row-reverse gap-2" : "gap-2"}
          >
            <AlertDialogAction
              onClick={() => logout()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-logout"
            >
              {t("nav.logout.yes")}
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-logout">
              {t("nav.logout.no")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
