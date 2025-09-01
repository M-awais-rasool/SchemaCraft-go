import { Features } from "../../components/landingPage/Features";
import { Footer } from "../../components/landingPage/Footer";
import { Header } from "../../components/landingPage/Header";
import { Hero } from "../../components/landingPage/Hero";
import { Pricing } from "../../components/landingPage/Pricing";
import { ProductDemo } from "../../components/landingPage/ProductDemo";
import { Testimonials } from "../../components/landingPage/Testimonials";


export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <ProductDemo />
        <Testimonials />
        <Pricing />
        
        {/* Docs Section Placeholder */}
        <section id="docs" className="py-16 lg:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
              Documentation & Guides
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Comprehensive documentation and tutorials to help you get started with DataForge.
            </p>
            <div className="text-muted-foreground">
              Coming soon...
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}