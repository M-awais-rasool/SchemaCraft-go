import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Play, ArrowRight, Database, Users, Zap, Sparkles, Code, Globe } from "lucide-react";
import { Link } from "react-router-dom";

// Smooth scroll utility function
const smoothScrollToSection = (sectionId: string, offset: number = 80) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export function Hero() {
  return (
    <section id="hero" className="bg-gradient-to-br from-background via-background to-muted/30 py-16 lg:py-24 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/30 rounded-full blur-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="mb-6 px-4 py-2 relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <Sparkles className="h-3 w-3 mr-1 inline" />
                <span className="relative z-10">Real-time Collaboration Ready</span>
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.div className="mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl tracking-tight"
              >
                <motion.span
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Build Dynamic
                </motion.span>
                <motion.span
                  className="block text-primary relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Data Schemas
                  <motion.div
                    className="absolute -inset-2 bg-primary/5 rounded-lg -z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.span>
                <motion.span
                  className="block"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Together
                </motion.span>
              </motion.h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl lg:max-w-none"
            >
              Create, modify, and collaborate on database schemas in real-time.
              No more complex migrations or deployment headaches. Just pure flexibility
              and team productivity.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button size="lg" className="px-8 py-3 text-lg group relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <Link to="/login">
                    <span className="relative z-10 flex items-center">
                      Start Building Free
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-3 text-lg group relative overflow-hidden"
                  onClick={() => smoothScrollToSection('demo')}
                >
                  <motion.div
                    className="absolute inset-0 bg-muted/50"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative z-10 flex items-center">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start text-center lg:text-left"
            >
              {[
                { icon: Users, label: "10k+ Teams", delay: 0 },
                { icon: Database, label: "1M+ Tables Created", delay: 0.1 },
                { icon: Zap, label: "99.9% Uptime", delay: 0.2 }
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + stat.delay, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Animated Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ duration: 0.3 }}
              className="bg-card rounded-2xl shadow-2xl overflow-hidden relative"
              style={{ perspective: "1000px" }}
            >
              {/* Mock Interface */}
              <div className="bg-muted/20 p-4 border-b border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <motion.div
                    className="w-3 h-3 bg-destructive rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  />
                  <span className="ml-4 text-sm text-muted-foreground">schema-builder.dataforge.io</span>
                </div>
              </div>

              <div className="p-6">
                {/* Schema Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Database className="h-6 w-6 text-primary" />
                  </motion.div>
                  <h3 className="text-lg">User Management Schema</h3>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge variant="outline" className="text-xs">Live</Badge>
                  </motion.div>
                </motion.div>

                {/* Animated Table Creation */}
                <div className="space-y-3">
                  {/* Table Headers */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.4 }}
                    className="grid grid-cols-3 gap-3 text-xs text-muted-foreground uppercase tracking-wide border-b border-border/20 pb-2"
                  >
                    <span>Field Name</span>
                    <span>Type</span>
                    <span>Options</span>
                  </motion.div>

                  {/* Animated Rows */}
                  {[
                    { name: "id", type: "UUID", delay: 1.4 },
                    { name: "email", type: "String", delay: 1.6 },
                    { name: "created_at", type: "DateTime", delay: 1.8 },
                    { name: "profile", type: "JSON", delay: 2.0 }
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: field.delay, duration: 0.4 }}
                      whileHover={{
                        backgroundColor: "var(--color-muted)",
                        x: 5,
                        scale: 1.02
                      }}
                      className="grid grid-cols-3 gap-3 py-2 text-sm border-b border-border/10 transition-colors rounded-md px-2 cursor-pointer"
                    >
                      <span className="font-medium">{field.name}</span>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {field.type}
                      </Badge>
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 + index * 0.2 }}
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Field Animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.2, duration: 0.4 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: "var(--color-primary)"
                    }}
                    className="border-2 border-dashed border-primary/30 rounded-lg p-3 text-center text-primary hover:border-primary/60 transition-all cursor-pointer group"
                  >
                    <motion.span
                      className="text-sm flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Code className="h-4 w-4" />
                      </motion.div>
                      Add new field
                    </motion.span>
                  </motion.div>
                </div>

                {/* Collaboration Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4, duration: 0.4 }}
                  className="flex items-center gap-2 mt-6 pt-4 border-t border-border/20"
                >
                  <div className="flex -space-x-2">
                    {["A", "B", "C"].map((letter, index) => (
                      <motion.div
                        key={letter}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.6 + index * 0.2, duration: 0.3 }}
                        whileHover={{ scale: 1.2, zIndex: 10 }}
                        className={`w-6 h-6 ${index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' : 'bg-purple-500'
                          } rounded-full border-2 border-white flex items-center justify-center text-xs text-white cursor-pointer`}
                      >
                        {letter}
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">3 users editing</span>
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full ml-2"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Floating Elements */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.2 }}
              className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg cursor-pointer"
            >
              <Zap className="h-5 w-5" />
            </motion.div>

            <motion.div
              animate={{
                y: [10, -10, 10],
                rotate: [0, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              whileHover={{ scale: 1.2 }}
              className="absolute -bottom-4 -left-4 bg-card border border-border/20 rounded-full p-3 shadow-lg cursor-pointer"
            >
              <Users className="h-5 w-5 text-primary" />
            </motion.div>

            <motion.div
              animate={{
                y: [-5, 5, -5],
                rotate: [0, 10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              whileHover={{ scale: 1.2 }}
              className="absolute top-1/2 -left-6 bg-accent text-accent-foreground rounded-full p-2 shadow-md cursor-pointer"
            >
              <Globe className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}