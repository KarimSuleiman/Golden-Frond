import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Gem,
  Gauge,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageCircle,
  Settings,
  Car,
} from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";
import heroCarImage from "@assets/4d74338e-f97b-47bb-a692-531b76e63b0b_1775084196040.JPG";

export default function Landing() {
  const { t, language, dir } = useLanguage();
  const { user } = useAuth();
  const ArrowIcon = language === "ar" ? ArrowRight : ArrowLeft;

  const { data: isAdminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/auth/is-admin"],
    enabled: !!user,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      <Navbar />

      {/* Hero Section — full-bleed cinematic */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "calc(100vh - 4rem)" }}>
        {/* Full-bleed background image */}
        <img
          src={heroCarImage}
          alt={t("landing.heroImageAlt")}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Mobile overlay: car shows clearly at top, dark at bottom for text readability */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(to top, rgba(10,8,5,0.92) 0%, rgba(10,8,5,0.70) 40%, rgba(10,8,5,0.20) 70%, transparent 100%)" }}
        />
        {/* Desktop overlay: directional side gradient */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: language === "ar"
              ? "linear-gradient(to left, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.60) 40%, rgba(10,8,5,0.10) 75%, transparent 100%)"
              : "linear-gradient(to right, rgba(10,8,5,0.82) 0%, rgba(10,8,5,0.60) 40%, rgba(10,8,5,0.10) 75%, transparent 100%)"
          }}
        />

        {/* Content — bottom on mobile, centered on desktop */}
        <div className="relative z-10 flex items-end md:items-center min-h-[calc(100vh-4rem)] px-5 sm:px-8 md:px-12 lg:px-20 pb-10 md:py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xl space-y-4 md:space-y-8"
          >
            {/* Logo + Brand name */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-2">
              <img src={logoImage} alt={t("common.altLogo")} className="h-14 md:h-16 w-auto object-contain drop-shadow-lg" />
              <span className="text-white/90 text-sm md:text-base font-semibold tracking-wide drop-shadow-md">
                {t("landing.tagline")}
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight text-white drop-shadow-md">
                {t("landing.title1")}
                <br />
                <span className="text-primary drop-shadow-sm">{t("landing.title2")}</span>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-sm md:text-lg text-white/80 max-w-md leading-relaxed"
            >
              {t("landing.description")}
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              {isAdminCheck?.isAdmin ? (
                <>
                  <a href="/admin">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground text-sm md:text-base px-6 md:px-8 py-4 md:py-5 h-auto shadow-xl hover:scale-105 transition-all"
                      data-testid="button-admin-hero"
                    >
                      <Settings className={`w-4 h-4 md:w-5 md:h-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {t("admin.title")}
                    </Button>
                  </a>
                  <a href="/cars-for-sale">
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-sm md:text-base px-6 md:px-8 py-4 md:py-5 h-auto border-white/50 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all"
                      data-testid="button-cars-for-sale-hero"
                    >
                      <Car className={`w-4 h-4 md:w-5 md:h-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {t("nav.carsForSale")}
                    </Button>
                  </a>
                </>
              ) : (
                <a href="/cars-for-sale">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground text-sm md:text-base px-6 md:px-8 py-4 md:py-5 h-auto shadow-xl hover:scale-105 transition-all"
                    data-testid="button-cars-for-sale-hero"
                  >
                    {t("nav.carsForSale")}{" "}
                    <ArrowIcon className={`w-4 h-4 md:w-5 md:h-5 ${language === "ar" ? "mr-2" : "ml-2"}`} />
                  </Button>
                </a>
              )}
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-white/20"
            >
              <div>
                <h4 className="text-xl md:text-3xl font-bold text-white">+21</h4>
                <p className="text-xs text-white/60 uppercase tracking-widest mt-0.5 md:mt-1">
                  {t("landing.years")}
                </p>
              </div>
              <div>
                <h4 className="text-xl md:text-3xl font-bold text-white">100%</h4>
                <p className="text-xs text-white/60 uppercase tracking-widest mt-0.5 md:mt-1">
                  {t("landing.secure")}
                </p>
              </div>
              <div>
                <h4 className="text-xl md:text-3xl font-bold text-white">24/7</h4>
                <p className="text-xs text-white/60 uppercase tracking-widest mt-1">
                  {t("landing.support")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-20 bg-secondary border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.about")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: language === "ar" ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6 text-center"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  {t("landing.brandName")}
                </strong>{" "}
                {t("landing.about.text1")}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {language === "ar" ? (
                  <>
                    متخصصون في استيراد السيارات من{" "}
                    <strong className="text-foreground">أمريكا</strong>{" "}
                    و<strong className="text-foreground">أوروبا</strong>{" "}
                    و<strong className="text-foreground">الصين</strong>{" "}
                    و<strong className="text-foreground">كوريا</strong>
                    ، مع تقديم خدمات التتبع والشحن لعملائنا وضمان الجودة والشفافية في كل خطوة.
                  </>
                ) : (
                  <>
                    Specialized in importing cars from{" "}
                    <strong className="text-foreground">America</strong>,{" "}
                    <strong className="text-foreground">Europe</strong>,{" "}
                    <strong className="text-foreground">China</strong> and{" "}
                    <strong className="text-foreground">Korea</strong>,{" "}
                    providing tracking and shipping services for customers with guaranteed quality and transparency at every step.
                  </>
                )}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("landing.founded")}
                    </p>
                    <p className="font-bold text-foreground">
                      {t("landing.foundedDate")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("landing.experience")}
                    </p>
                    <p className="font-bold text-foreground">
                      {t("landing.experienceYears")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: language === "ar" ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop"
                  alt={t("landing.showroomImageAlt")}
                  className="w-full h-80 object-cover"
                />
              </div>
              <div
                className={`absolute -bottom-6 ${language === "ar" ? "-right-6" : "-left-6"} bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl`}
              >
                <p className="text-3xl font-bold">+21</p>
                <p className="text-sm">{t("landing.yearsExp")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12 md:py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.services")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={ShieldCheck}
              title={t("landing.service1.title")}
              description={t("landing.service1.desc")}
            />
            <FeatureCard
              icon={Gem}
              title={t("landing.service2.title")}
              description={t("landing.service2.desc")}
            />
            <FeatureCard
              icon={Gauge}
              title={t("landing.service3.title")}
              description={t("landing.service3.desc")}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-12 md:py-20 bg-secondary border-t border-border"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.contact")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t("landing.contact.desc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            <motion.a
              href="tel:0796796108"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              data-testid="link-phone"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">
                {t("landing.phone")}
              </h3>
              <p className="text-muted-foreground text-center" dir="ltr">
                0796796108
              </p>
            </motion.a>

            <motion.a
              href="https://wa.me/962796796108"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-green-500/30 transition-all group"
              data-testid="link-whatsapp"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <SiWhatsapp className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">
                {t("landing.whatsapp")}
              </h3>
              <p
                className="text-muted-foreground text-center text-sm"
                dir="ltr"
              >
                0796796108
              </p>
            </motion.a>

            <motion.a
              href="mailto:amairehkareem@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-red-500/30 transition-all group"
              data-testid="link-email"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">
                {t("landing.email")}
              </h3>
              <p
                className="text-muted-foreground text-center text-sm"
                dir="ltr"
              >
                amairehkareem@gmail.com
              </p>
            </motion.a>

            <motion.a
              href="https://www.facebook.com/golden.frond.gallery"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-blue-500/30 transition-all group"
              data-testid="link-facebook"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <SiFacebook className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">
                {t("landing.facebook")}
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                golden.frond.gallery
              </p>
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">
                {t("landing.location")}
              </h3>
              <p className="text-muted-foreground text-center text-sm whitespace-pre-line">
                {t("landing.address")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoImage}
                  alt={t("common.altLogo")}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-lg font-display font-bold text-foreground">
                {t("footer.trackingTagline")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("footer.trackingDesc")}
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/962796796108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all"
                  data-testid="footer-whatsapp"
                >
                  <SiWhatsapp className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/golden.frond.gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover-elevate transition-all"
                  data-testid="footer-facebook"
                >
                  <SiFacebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-foreground mb-4">
                {t("footer.quickLinks")}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-home">
                    {t("footer.home")}
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-about">
                    {t("footer.aboutUs")}
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-login">
                    {t("footer.login")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h3 className="font-bold text-foreground mb-4">
                {t("footer.contactUs")}
              </h3>
              <ul className="space-y-4">
                <li>
                  <span className="text-xs text-muted-foreground block mb-1">{t("contact.email")}</span>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href="mailto:amairehkareem@gmail.com" 
                      className="text-foreground hover:text-primary transition-colors text-sm"
                      dir="ltr"
                      data-testid="footer-contact-email"
                    >
                      amairehkareem@gmail.com
                    </a>
                  </div>
                </li>
                <li>
                  <span className="text-xs text-muted-foreground block mb-1">{t("contact.whatsapp")}</span>
                  <div className="flex items-center gap-2">
                    <SiWhatsapp className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href="https://wa.me/962796796108" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors text-sm"
                      dir="ltr"
                      data-testid="footer-contact-whatsapp"
                    >
                      +962-796796108
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t("landing.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-secondary border border-border hover:shadow-lg transition-all group text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-display text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

