import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Home, Menu, X, Settings } from "lucide-react";
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

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { data: isAdminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    ...(user ? [{ href: "/dashboard", label: "سياراتي", icon: LayoutDashboard }] : []),
    ...(isAdminCheck?.isAdmin ? [{ href: "/admin", label: "لوحة التحكم", icon: Settings }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <img 
            src={logoImage} 
            alt="السعفة الذهبية" 
            className="h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
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
          ))}
          
          <div className="pl-4 border-l border-border">
            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => setShowLogoutDialog(true)}
                className="text-foreground/70 hover:text-destructive"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                خروج
              </Button>
            ) : (
              <a href="/login">
                <Button className="bg-primary text-primary-foreground font-bold shadow-md" data-testid="button-login">
                  تسجيل دخول
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                <Link key={link.href} href={link.href}>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <span>{link.label}</span>
                  </div>
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => { setShowLogoutDialog(true); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    خروج
                  </Button>
                ) : (
                  <a href="/login" className="block w-full">
                    <Button className="w-full bg-primary text-primary-foreground font-bold" data-testid="button-login-mobile">
                      تسجيل دخول
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من أنك تريد تسجيل الخروج؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={() => logout()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-logout"
            >
              نعم، خروج
            </AlertDialogAction>
            <AlertDialogCancel data-testid="button-cancel-logout">
              لا، إلغاء
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}
