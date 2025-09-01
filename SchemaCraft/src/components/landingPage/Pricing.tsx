import { Check, Star, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Perfect for getting started with schema management",
    features: [
      "1,000 API calls per month",
      "Unlimited database schemas",
      "Basic collaboration",
      "Community support",
      "Standard templates",
      "Basic version control"
    ],
    badge: null,
    popular: false,
    buttonText: "Get Started Free",
    buttonVariant: "outline" as const
  },
  {
    name: "Premium",
    price: "20",
    period: "per month",
    description: "Advanced features for professional teams and growing businesses",
    features: [
      "Unlimited API calls",
      "Unlimited database schemas",
      "Advanced collaboration (unlimited team members)",
      "Custom templates & components",
      "Advanced version control & branching",
      "Advanced security features",
      "API documentation generator",
      "Custom integrations"
    ],
    badge: "Most Popular",
    popular: true,
    buttonText: "Start Premium Trial",
    buttonVariant: "default" as const
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-1/3 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Star className="h-3 w-3 mr-1" />
            Pricing Plans
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
            Choose the perfect plan
            <span className="block text-primary">for your team</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core features 
            with transparent, predictable pricing.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="relative"
            >
              <Card className={`h-full transition-all duration-300 ${
                plan.popular 
                  ? 'border-primary shadow-lg hover:shadow-xl scale-105' 
                  : 'border-border hover:shadow-lg hover:border-primary/50'
              }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl md:text-5xl font-bold">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (index * 0.2) + (featureIndex * 0.1), duration: 0.4 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.popular ? 'bg-primary' : 'bg-muted'
                        }`}>
                          <Check className={`h-3 w-3 ${
                            plan.popular ? 'text-primary-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant={plan.buttonVariant}
                      size="lg" 
                      className="w-full"
                    >
                      {plan.buttonText}
                    </Button>
                  </motion.div>

                  {plan.name === "Free" && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      No credit card required
                    </p>
                  )}

                  {plan.name === "Premium" && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Cancel anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-center mt-16 pt-12 border-t border-border/50"
        >
          <h3 className="text-xl font-semibold mb-4">
            All plans include
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">99.9% Uptime SLA</h4>
              <p className="text-sm text-muted-foreground">
                Reliable service you can count on
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Data Security</h4>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade encryption & protection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-2">Regular Updates</h4>
              <p className="text-sm text-muted-foreground">
                New features and improvements monthly
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
