import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Mail, 
  Database,
  Shield,
  Zap, 
} from "lucide-react";

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

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-8 w-8" />
              <h3 className="text-2xl">DataForge</h3>
            </div>
            <p className="text-primary-foreground/80 mb-4 leading-relaxed">
              The future of database schema management. Build, collaborate, and deploy 
              with confidence in real-time.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => smoothScrollToSection('features')}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 bg-transparent border-none cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => smoothScrollToSection('pricing')}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 bg-transparent border-none cursor-pointer"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => smoothScrollToSection('docs')}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 bg-transparent border-none cursor-pointer"
                >
                  Documentation
                </button>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Support Center
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4">Company</h4>
            <ul className="space-y-2 mb-6">
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Press Kit
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200">
                  Contact
                </a>
              </li>
            </ul>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary-foreground/60" />
                <span className="text-primary-foreground/80">ar30781871@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <Separator className="my-8 bg-primary-foreground/20" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-5 w-5 text-primary-foreground/60" />
            <div>
              <p className="text-sm">Lightning Fast</p>
              <p className="text-xs text-primary-foreground/60">Deploy changes instantly</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-5 w-5 text-primary-foreground/60" />
            <div>
              <p className="text-sm">Enterprise Security</p>
              <p className="text-xs text-primary-foreground/60">SOC 2 Type II compliant</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Database className="h-5 w-5 text-primary-foreground/60" />
            <div>
              <p className="text-sm">Always Available</p>
              <p className="text-xs text-primary-foreground/60">99.99% uptime SLA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © 2025 DataForge, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200">
                Security
              </a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}