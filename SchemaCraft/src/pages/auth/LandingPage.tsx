import { Features } from "../../components/landingPage/Features";
import { Footer } from "../../components/landingPage/Footer";
import { Header } from "../../components/landingPage/Header";
import { Hero } from "../../components/landingPage/Hero";
import { Newsletter } from "../../components/landingPage/Newsletter";
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
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}