import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Gem, Gauge, MapPin, Phone, Mail, Calendar, Facebook, Clock } from "lucide-react";
import logoImage from "@assets/image_1769171762465.png";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <div className="text-left space-y-8">
              <motion.div variants={itemVariants}>
                <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-4">
                  السعفة الذهبية لتجارة السيارات
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight text-foreground">
                  تتبع سياراتك<br />
                  <span className="text-primary">بكل سهولة</span>
                </h1>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                السعفة الذهبية توفر لك منصة رقمية حصرية لمتابعة سياراتك المحجوزة والمشتراة مع جميع تفاصيل الشحن والتتبع.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <a href="/login">
                  <Button size="lg" className="bg-primary text-primary-foreground text-lg px-8 py-6 h-auto shadow-xl hover:scale-105 transition-all" data-testid="button-login-hero">
                    تسجيل الدخول <ArrowRight className="mr-2 w-5 h-5" />
                  </Button>
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div>
                  <h4 className="text-2xl font-bold text-foreground">+13</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">سنة خبرة</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">100%</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">آمن وموثوق</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">24/7</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">دعم فني</p>
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
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
                  alt="سيارة فاخرة" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-display font-bold text-2xl">مجموعة حصرية</p>
                  <p className="text-sm text-gray-200">للعملاء المميزين</p>
                </div>
              </div>
              
              {/* Decorative elements behind image */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-secondary border-t border-border">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">من نحن</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                <strong className="text-foreground">السعفة الذهبية</strong> هي شركة رائدة في مجال تجارة السيارات واستيرادها، تأسست في <strong className="text-primary">29 أكتوبر 2011</strong>، ولدينا أكثر من 13 عاماً من الخبرة في توفير أفضل السيارات لعملائنا الكرام.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                نحن متخصصون في استيراد السيارات من أمريكا وأوروبا وتوفير خدمات التتبع والشحن لعملائنا، مع ضمان الجودة والشفافية في كل خطوة.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Calendar className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">تأسست في</p>
                    <p className="font-bold text-foreground">29 أكتوبر 2011</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">سنوات الخبرة</p>
                    <p className="font-bold text-foreground">+13 سنة</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop" 
                  alt="معرض السيارات" 
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl">
                <p className="text-3xl font-bold">+13</p>
                <p className="text-sm">سنة خبرة</p>
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
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">خدماتنا</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck}
              title="ملكية موثقة"
              description="كل سيارة في حسابك موثقة برقم الشاصي والسجلات الرسمية."
            />
            <FeatureCard 
              icon={Gem}
              title="سيارات حصرية"
              description="الوصول إلى أفخم السيارات من جميع أنحاء العالم."
            />
            <FeatureCard 
              icon={Gauge}
              title="تتبع مباشر"
              description="تابع حالة سيارتك من الحجز حتى التسليم بشكل مباشر."
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-secondary border-t border-border">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">تواصل معنا</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              نحن هنا لمساعدتك. تواصل معنا عبر أي من الوسائل التالية
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.a
              href="tel:0798860078"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              data-testid="link-phone"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">الهاتف</h3>
              <p className="text-muted-foreground text-center" dir="ltr">0798860078</p>
            </motion.a>

            <motion.a
              href="mailto:amairehkareem@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              data-testid="link-email"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">البريد الإلكتروني</h3>
              <p className="text-muted-foreground text-center text-sm" dir="ltr">amairehkareem@gmail.com</p>
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">الموقع</h3>
              <p className="text-muted-foreground text-center text-sm">الزرقاء - المنطقة الحرة<br />شارع ١٥ شمال</p>
            </motion.div>

            <motion.a
              href="https://www.facebook.com/golden.frond.gallery"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/30 transition-all group"
              data-testid="link-facebook"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Facebook className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-1">فيسبوك</h3>
              <p className="text-muted-foreground text-center text-sm">golden.frond.gallery</p>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="السعفة الذهبية" className="h-10 w-auto" />
              <span className="font-display font-bold text-foreground">السعفة الذهبية</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} السعفة الذهبية لتجارة السيارات. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <a href="tel:0798860078" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-phone">
                <Phone className="w-5 h-5" />
              </a>
              <a href="mailto:amairehkareem@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-email">
                <Mail className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/golden.frond.gallery" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-secondary border border-border hover:shadow-lg transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-display text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
