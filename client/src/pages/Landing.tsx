import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Gem, Gauge } from "lucide-react";

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
          {/* Abstract pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
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
                  PREMIUM AUTOMOTIVE MANAGEMENT
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight text-white">
                  Experience <br />
                  <span className="gold-gradient-text">True Luxury</span>
                </h1>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Al-Saafa Al-Thahabeya provides an exclusive digital gateway to your automotive collection. View your reserved and purchased vehicles in pristine detail.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <a href="/api/login">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Access My Garage <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
                <div>
                  <h4 className="text-2xl font-bold text-white">250+</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Premium Cars</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">100%</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Secure Access</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white">24/7</h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Support</p>
                </div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div 
              variants={itemVariants}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/10 animate-float">
                {/* luxury car dark mode */}
                <img 
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop" 
                  alt="Luxury Car" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-display font-bold text-2xl">Elite Collection</p>
                  <p className="text-sm text-gray-300">Reserved for the distinguished.</p>
                </div>
              </div>
              
              {/* Decorative elements behind image */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-20 bg-card/30 border-t border-white/5">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck}
              title="Verified Ownership"
              description="Every vehicle in your digital garage is verified against official records and chassis numbers."
            />
            <FeatureCard 
              icon={Gem}
              title="Exclusive Inventory"
              description="Access to a curated selection of the world's most prestigious automotive masterpieces."
            />
            <FeatureCard 
              icon={Gauge}
              title="Real-time Status"
              description="Track the status of your purchases from reservation to delivery in real-time."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-bold font-display text-white mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
