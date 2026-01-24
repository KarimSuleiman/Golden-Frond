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
  Facebook,
  Clock,
  Quote,
  MessageCircle,
  Settings,
} from "lucide-react";
import { SiWhatsapp, SiFacebook } from "react-icons/si";
import logoImage from "@assets/image_1769171762465.png";

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

      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden py-20 lg:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </div>

        <div className="container relative z-10 px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Text Content */}
            <div className="text-center lg:text-start space-y-8">

              <motion.div variants={itemVariants}>
                <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-4">
                  {t("landing.tagline")}
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight text-foreground">
                  {t("landing.title1")}
                  <br />
                  <span className="text-primary">{t("landing.title2")}</span>
                </h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto lg:mx-0"
              >
                {t("landing.description")}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {isAdminCheck?.isAdmin ? (
                  <a href="/admin">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl hover:scale-105 transition-all"
                      data-testid="button-admin-hero"
                    >
                      <Settings className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {t("admin.title")}
                    </Button>
                  </a>
                ) : (
                  <a href="/login">
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl hover:scale-105 transition-all"
                      data-testid="button-login-hero"
                    >
                      {t("landing.login")}{" "}
                      <ArrowIcon
                        className={`w-5 h-5 ${language === "ar" ? "mr-2" : "ml-2"}`}
                      />
                    </Button>
                  </a>
                )}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-border"
              >
                <div>
                  <h4 className="text-2xl font-bold text-foreground">+13</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t("landing.years")}
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">100%</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t("landing.secure")}
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">24/7</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t("landing.support")}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              variants={itemVariants}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden border border-border shadow-2xl animate-float bg-card">
                <img
                  src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?q=80&w=2070&auto=format&fit=crop"
                  alt={t("landing.heroImageAlt")}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
                <div
                  className={`absolute bottom-6 ${language === "ar" ? "left-6" : "right-6"} text-white`}
                >
                  <p className="font-display font-bold text-2xl">
                    {t("landing.exclusive")}
                  </p>
                  <p className="text-sm text-gray-200">
                    {t("landing.premium")}
                  </p>
                </div>
              </div>

              {/* Decorative elements behind image */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              {t("landing.testimonials")}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {t("landing.testimonials.desc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              name={t("landing.testimonial1.name")}
              role={t("landing.testimonial1.role")}
              text={t("landing.testimonial1.text")}
              delay={0.1}
            />
            <TestimonialCard
              name={t("landing.testimonial2.name")}
              role={t("landing.testimonial2.role")}
              text={t("landing.testimonial2.text")}
              delay={0.2}
            />
            <TestimonialCard
              name={t("landing.testimonial3.name")}
              role={t("landing.testimonial3.role")}
              text={t("landing.testimonial3.text")}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary border-t border-border">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
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
              className="space-y-6"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  {t("landing.brandName")}
                </strong>{" "}
                {t("landing.about.text1")}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("landing.about.text2")}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("landing.founded")}
                    </p>
                    <p className="font-bold text-foreground">
                      {t("landing.foundedDate")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
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
                <p className="text-3xl font-bold">+13</p>
                <p className="text-sm">{t("landing.yearsExp")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
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
        className="py-20 bg-secondary border-t border-border"
      >
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
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
      <footer className="py-8 border-t border-border bg-card">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt={t("common.altLogo")}
                className="h-10 w-auto"
              />
              <span className="font-display font-bold text-foreground">
                {t("landing.brandName")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {t("landing.copyright")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="tel:0796796108"
                className="text-muted-foreground hover:text-green-500 transition-colors"
                data-testid="footer-phone"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/962796796108"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-green-500 transition-colors"
                data-testid="footer-whatsapp"
              >
                <SiWhatsapp className="w-5 h-5" />
              </a>
              <a
                href="mailto:amairehkareem@gmail.com"
                className="text-muted-foreground hover:text-red-500 transition-colors"
                data-testid="footer-email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/golden.frond.gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-500 transition-colors"
                data-testid="footer-facebook"
              >
                <SiFacebook className="w-5 h-5" />
              </a>
            </div>
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
    <div className="p-8 rounded-2xl bg-secondary border border-border hover:shadow-lg transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-display text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  text,
  delay,
}: {
  name: string;
  role: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-secondary border border-border relative"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
      <p className="text-muted-foreground leading-relaxed mb-6 text-lg italic">
        "{text}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">
            {name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-bold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
