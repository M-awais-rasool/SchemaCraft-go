import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { 
  Users, 
  Zap, 
  Shield, 
  GitBranch, 
  Database, 
  Palette,
  Clock,
  Globe,
  Lock,
  Sparkles,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together seamlessly with your team. See changes as they happen and resolve conflicts instantly.",
    badge: "Live",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
    hoverColor: "hover:shadow-blue-500/25"
  },
  {
    icon: Palette,
    title: "Customizable Schemas",
    description: "Design flexible data structures that adapt to your needs. No rigid templates or limitations.",
    badge: "Flexible",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-600",
    hoverColor: "hover:shadow-purple-500/25"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Deploy schema changes instantly without downtime. Zero-migration updates that just work.",
    badge: "Instant",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-600",
    hoverColor: "hover:shadow-yellow-500/25"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, role-based access control, and comprehensive audit logs.",
    badge: "Secure",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
    hoverColor: "hover:shadow-green-500/25"
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Track every change with Git-like versioning. Branch, merge, and rollback with confidence.",
    badge: "Tracked",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-600",
    hoverColor: "hover:shadow-indigo-500/25"
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Deploy across multiple regions with automatic replication and edge optimization.",
    badge: "Scalable",
    gradient: "from-teal-500/20 to-green-500/20",
    iconColor: "text-teal-600",
    hoverColor: "hover:shadow-teal-500/25"
  }
];

const useCases = [
  {
    icon: Database,
    title: "SaaS Platforms",
    description: "Rapidly iterate on data models for multi-tenant applications",
    color: "text-blue-600"
  },
  {
    icon: Clock,
    title: "Rapid Prototyping",
    description: "Build and test data structures without complex setup",
    color: "text-purple-600"
  },
  {
    icon: Lock,
    title: "Enterprise Apps",
    description: "Manage complex schemas with governance and compliance",
    color: "text-green-600"
  }
];

export function Features() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-r from-muted/30 to-primary/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Badge variant="outline" className="mb-4 px-4 py-2 relative overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.8 }}
              />
              <Sparkles className="h-3 w-3 mr-1 inline" />
              <span className="relative z-10">Powerful Features</span>
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Everything you need to manage
            <motion.span 
              className="block text-primary relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              dynamic data schemas
              <motion.div
                className="absolute -inset-2 bg-primary/5 rounded-lg -z-10"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Our platform combines the flexibility of NoSQL with the structure of SQL, 
            giving you the best of both worlds with enterprise-grade reliability.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <Card className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl ${feature.hoverColor} transition-all duration-500 h-full relative`}>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient.split(' ')[1]} 0%, ${feature.gradient.split(' ')[3]} 100%)`
                  }}
                />
                
                <CardContent className="p-6 h-full flex flex-col relative z-10">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center relative overflow-hidden`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                      </motion.div>
                      
                      {/* Sparkle effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        initial={{ scale: 0, rotate: 45 }}
                        whileHover={{ scale: 1, rotate: 45 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge variant="secondary" className="text-xs relative overflow-hidden group/badge">
                        <motion.div
                          className="absolute inset-0 bg-primary/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative z-10">{feature.badge}</span>
                      </Badge>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <motion.h3 
                    className="mb-3 group-hover:text-primary transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>

                  {/* Animated Hover Effect */}
                  <motion.div 
                    className="w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full mt-4"
                    initial={{ width: 0 }}
                    whileInView={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                  />
                  
                  {/* Floating particles on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/40 rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 20}%`,
                        }}
                        animate={{
                          y: [-10, -20, -10],
                          opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Use Cases Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          id="use-cases"
        >
          <div className="text-center mb-12">
            <motion.h3 
              className="text-2xl md:text-3xl mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              Perfect for any use case
            </motion.h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From startups to enterprise, DataForge adapts to your specific needs and scales with your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                {/* Background glow on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <motion.div 
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center relative"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <useCase.icon className={`h-8 w-8 ${useCase.color}`} />
                  </motion.div>
                  
                  {/* Pulse effect */}
                  <motion.div
                    className="absolute inset-0 border-2 border-primary/20 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <motion.h4 
                  className="mb-2 relative z-10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {useCase.title}
                </motion.h4>
                <p className="text-sm text-muted-foreground relative z-10">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-20 pt-12 border-t border-border/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "50ms", label: "Average Response Time", icon: Zap },
              { value: "99.99%", label: "Uptime SLA", icon: Shield },
              { value: "10TB+", label: "Data Processed Daily", icon: Database },
              { value: "500+", label: "Enterprise Customers", icon: TrendingUp }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
              >
                <motion.div
                  className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-6 w-6 text-primary" />
                </motion.div>
                <motion.div 
                  className="text-3xl md:text-4xl mb-2 text-primary"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}