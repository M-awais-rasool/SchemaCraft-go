import { Card, CardContent } from "./ui/card";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Alex Rivera",
    role: "CTO at TechFlow",
    company: "TechFlow Solutions",
    content: "DataForge transformed how we handle schema changes. What used to take weeks of migration planning now happens in minutes. Our development velocity has increased by 300%.",
    rating: 5,
    avatar: "AR",
    metric: "300% faster deployments"
  },
  {
    id: 2,
    name: "Sarah Kim", 
    role: "Lead Developer",
    company: "StartupCorp",
    content: "The real-time collaboration feature is a game-changer. Our distributed team can now work on database schemas simultaneously without any conflicts. It's like Google Docs for databases.",
    rating: 5,
    avatar: "SK",
    metric: "Zero schema conflicts"
  },
  {
    id: 3,
    name: "Michael Chen",
    role: "Data Architect",
    company: "Enterprise Solutions Inc",
    content: "We migrated from traditional database management to DataForge and saw immediate improvements. The version control and rollback features give us confidence to iterate quickly.",
    rating: 5,
    avatar: "MC",
    metric: "50% less downtime"
  },
  {
    id: 4,
    name: "Emma Thompson",
    role: "Product Manager",
    company: "InnovateApp",
    content: "DataForge bridges the gap between our technical and non-technical team members. Everyone can understand and contribute to data structure discussions through the intuitive interface.",
    rating: 5,
    avatar: "ET",
    metric: "100% team adoption"
  }
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4">
            Trusted by developers worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how teams are transforming their data management workflows with DataForge.
          </p>
        </motion.div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8 md:p-12">
                    {/* Quote Icon */}
                    <Quote className="h-12 w-12 text-primary/20 mb-6" />

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Testimonial Content */}
                    <blockquote className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                      "{testimonials[currentIndex].content}"
                    </blockquote>

                    {/* Customer Info and Metric */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                          {testimonials[currentIndex].avatar}
                        </div>
                        <div>
                          <p className="font-medium">{testimonials[currentIndex].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonials[currentIndex].role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testimonials[currentIndex].company}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {testimonials[currentIndex].metric}
                        </div>
                        <p className="text-sm text-muted-foreground">improvement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 rounded-full w-10 h-10 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 rounded-full w-10 h-10 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 pt-12 border-t border-border/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl mb-2 text-primary">10,000+</div>
              <p className="text-muted-foreground">Active Developers</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl mb-2 text-primary">4.9★</div>
              <p className="text-muted-foreground">Customer Rating</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl mb-2 text-primary">1M+</div>
              <p className="text-muted-foreground">Schema Changes</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl mb-2 text-primary">500+</div>
              <p className="text-muted-foreground">Enterprise Customers</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}