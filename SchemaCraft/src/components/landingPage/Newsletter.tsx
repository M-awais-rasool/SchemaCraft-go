import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { Rocket, Sparkles, Bell, CheckCircle, Mail, Zap, Globe } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3],
          }} 
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-muted/30 to-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden relative">
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg"
                animate={{
                  background: [
                    "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)",
                    "linear-gradient(90deg, var(--color-accent) 0%, var(--color-primary) 50%, var(--color-accent) 100%)",
                    "linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)"
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <CardContent className="p-0 relative z-10">
                <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 md:p-12 text-center relative overflow-hidden">
                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-20, -40, -20],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Rocket className="h-8 w-8 relative z-10" />
                  </motion.div>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30 relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/30"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                      <Bell className="h-3 w-3 mr-1 relative z-10" />
                      <span className="relative z-10">Early Access</span>
                    </Badge>
                  </motion.div>

                  {/* Headline */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-2xl md:text-3xl lg:text-4xl mb-4 relative"
                  >
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      Ready to transform your workflow?
                    </motion.span>
                    {/* Sparkle effects */}
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles className="h-6 w-6 text-yellow-300" />
                    </motion.div>
                  </motion.h2>

                  {/* Subtext */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
                  >
                    Join thousands of developers who are already building faster with DataForge. 
                    Get early access to new features and exclusive updates.
                  </motion.p>

                  {/* Newsletter Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
                  >
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="flex-1"
                    >
                      <Input
                        type="email"
                        placeholder="Enter your work email"
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/70 focus:bg-white/20 transition-all duration-300"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="secondary" 
                        className="bg-white text-primary hover:bg-white/90 px-8 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/80 to-white"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Get Early Access
                        </span>
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Benefits */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-primary-foreground/80 mb-6"
                  >
                    {[
                      { icon: CheckCircle, text: "Free for 30 days" },
                      { icon: CheckCircle, text: "No credit card required" },
                      { icon: CheckCircle, text: "Cancel anytime" }
                    ].map((benefit, index) => (
                      <motion.div
                        key={benefit.text}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <benefit.icon className="h-4 w-4" />
                        </motion.div>
                        <span className="group-hover:text-primary-foreground transition-colors">
                          {benefit.text}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Privacy Notice */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-xs text-primary-foreground/70"
                  >
                    We respect your privacy. Unsubscribe at any time. No spam, ever.
                  </motion.p>
                </div>

                {/* Enhanced Additional Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="bg-gradient-to-br from-muted/30 via-background to-muted/20 p-8 text-center relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      {
                        icon: Sparkles,
                        title: "Beta Features",
                        description: "First access to new capabilities",
                        color: "text-purple-600"
                      },
                      {
                        icon: Bell,
                        title: "Product Updates",
                        description: "Stay informed about releases",
                        color: "text-blue-600"
                      },
                      {
                        icon: Zap,
                        title: "Expert Tips",
                        description: "Best practices from our team",
                        color: "text-orange-600"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="flex flex-col items-center group cursor-pointer"
                      >
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-3 relative overflow-hidden"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                            initial={{ scale: 0, rotate: 45 }}
                            whileHover={{ scale: 1, rotate: 45 }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.8 }}
                          >
                            <feature.icon className={`h-6 w-6 ${feature.color} relative z-10`} />
                          </motion.div>
                        </motion.div>
                        
                        <motion.h4 
                          className="mb-1 group-hover:text-primary transition-colors"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {feature.title}
                        </motion.h4>
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                          {feature.description}
                        </p>

                        {/* Hover effect underline */}
                        <motion.div
                          className="w-0 h-0.5 bg-gradient-to-r from-primary to-accent mt-2"
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional decorative elements */}
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{
                      rotate: [0, 360],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  >
                    <Globe className="h-8 w-8 text-primary/20" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-4 left-4"
                    animate={{
                      rotate: [360, 0],
                      scale: [1.2, 0.8, 1.2],
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <Rocket className="h-6 w-6 text-accent/30" />
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}