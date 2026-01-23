import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Home, Crown, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    ...(user ? [{ href: "/dashboard", label: "My Garage", icon: LayoutDashboard }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo Area */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary to-yellow-600 rounded-full shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <Crown className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              AL-SAAFA
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Al Thahabeya
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  location === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
            </Link>
          ))}
          
          <div className="pl-4 border-l border-white/10">
            {user ? (
              <Button 
                variant="ghost" 
                onClick={() => logout()}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            ) : (
              <a href="/api/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
                  Client Login
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
            className="md:hidden border-t border-white/10 bg-card"
          >
            <div className="p-4 space-y-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    <span>{link.label}</span>
                  </div>
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <a href="/api/login" className="block w-full">
                    <Button className="w-full bg-primary text-primary-foreground font-bold">
                      Client Login
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
