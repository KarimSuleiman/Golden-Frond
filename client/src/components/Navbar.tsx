import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Home, Menu, X, Settings, Globe, Info, Phone, Mail, MapPin, ChevronDown } from "lucide-react";
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

  const { data: isAdminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    ...(user ? [{ href: "/dashboard", label: t("dashboard.title"), icon: LayoutDashboard }] : []),
    ...(user && !isAdminCheck?.isAdmin ? [
      { href: "/#about", label: t("nav.aboutUs"), icon: Info, isAnchor: true },
    ] : []),
    ...(isAdminCheck?.isAdmin ? [{ href: "/admin", label: t("admin.title"), icon: Settings }] : []),
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
      value: "0798860078", 
      href: "tel:0798860078",
      color: "text-green-600"
    },
    { 
      icon: SiWhatsapp, 
      label: t("landing.whatsapp"), 
      value: "0798860078", 
      href: "https://wa.me/962798860078",
      color: "text-green-500"
    },
    { 
      icon: Mail, 
      label: t("landing.email"), 
      value: "amairehkareem@gmail.com", 
      href: "mailto:amairehkareem@gmail.com",
      color: "text-red-500"
    },
    { 
      icon: SiFacebook, 
      label: t("landing.facebook"), 
      value: "golden.frond.gallery", 
      href: "https://www.facebook.com/golden.frond.gallery",
      color: "text-blue-600"
    },
  ];

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-xl shadow-sm" dir={dir}>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <img 
            src={logoImage} 
            alt={t("common.altLogo")} 
            className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            link.isAnchor ? (
              <a 
                key={link.href} 
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href ? "text-primary font-semibold" : "text-foreground/70"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            ) : (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary font-semibold" : "text-foreground/70"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
              </Link>
            )
          ))}
          
          {/* Contact Dropdown - Only for non-admin users */}
          {user && !isAdminCheck?.isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-foreground/70 hover:text-primary"
                  data-testid="button-contact-dropdown"
                >
                  <Phone className="w-4 h-4" />
                  <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("nav.contactUs")}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={language === "ar" ? "start" : "end"} className="w-64">
                {contactOptions.map((option, index) => (
                  <DropdownMenuItem key={index} asChild>
                    <a 
                      href={option.href}
                      target={option.href.startsWith("http") ? "_blank" : undefined}
                      rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                      data-testid={`contact-option-${index}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} bg-current/10`}>
                        <option.icon className={`w-5 h-5 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{option.value}</p>
                      </div>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Language Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleLanguage}
            className="text-foreground/70 hover:text-primary"
            data-testid="button-language-toggle"
          >
            <Globe className="w-4 h-4" />
            <span className={language === "ar" ? "mr-1" : "ml-1"}>{t("common.langToggle")}</span>
          </Button>
          
          <div className={`${language === "ar" ? "pr-4 border-r" : "pl-4 border-l"} border-border`}>
            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => setShowLogoutDialog(true)}
                className="text-foreground/70 hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("nav.logout")}</span>
              </Button>
            ) : (
              <a href="/login">
                <Button className="bg-primary text-primary-foreground font-bold shadow-md" data-testid="button-login">
                  {t("nav.login")}
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
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
              {navLinks.map((link) => (
                link.isAnchor ? (
                  <a 
                    key={link.href} 
                    href={link.href}
                    onClick={(e) => { handleAnchorClick(e, link.href); setIsMobileMenuOpen(false); }}
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
                )
              ))}
              
              {/* Contact Options Mobile - Only for non-admin users */}
              {user && !isAdminCheck?.isAdmin && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground px-3">{t("nav.contactUs")}</p>
                  {contactOptions.map((option, index) => (
                    <a 
                      key={index}
                      href={option.href}
                      target={option.href.startsWith("http") ? "_blank" : undefined}
                      rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.color} bg-current/10`}>
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{option.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              
              {/* Language Toggle Mobile */}
              <div 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
              >
                <Globe className="w-5 h-5 text-primary" />
                <span>{t("common.langToggleFull")}</span>
              </div>
              
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => { setShowLogoutDialog(true); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className={language === "ar" ? "mr-2" : "ml-2"}>{t("nav.logout")}</span>
                  </Button>
                ) : (
                  <a href="/login" className="block w-full">
                    <Button className="w-full bg-primary text-primary-foreground font-bold" data-testid="button-login-mobile">
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
        <AlertDialogContent className={language === "ar" ? "text-right" : "text-left"} dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("nav.logout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("nav.logout.confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={language === "ar" ? "flex-row-reverse gap-2" : "gap-2"}>
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
