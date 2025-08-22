import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Key, 
  Storage, 
  FlashOn, 
  Palette,
  PlayArrow,
  Check,
  GitHub,
  LinkedIn,
  Book,
  Api,
  ContactMail,
  ArrowForward,
  Dashboard,
  Security,
  Speed,
  TrendingUp,
  Menu,
  Close,
  Code
} from '@mui/icons-material'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const features = [
    {
      icon: <Key className="w-8 h-8 text-black" />,
      title: "API Key Generation",
      description: "Generate secure API keys instantly for your applications with advanced authentication."
    },
    {
      icon: <Storage className="w-8 h-8 text-black" />,
      title: "Connect Your MongoDB",
      description: "Seamlessly integrate your MongoDB database with just a connection string."
    },
    {
      icon: <FlashOn className="w-8 h-8 text-black" />,
      title: "Auto Swagger Docs",
      description: "Automatically generated API documentation with interactive Swagger interface."
    },
    {
      icon: <Palette className="w-8 h-8 text-black" />,
      title: "Customizable APIs",
      description: "Build and customize your APIs with flexible schema definitions and endpoints."
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your free account and get started in seconds"
    },
    {
      number: "02", 
      title: "Add MongoDB URI",
      description: "Connect your database with a simple connection string"
    },
    {
      number: "03",
      title: "Start Building APIs",
      description: "Generate powerful APIs and manage everything from one dashboard"
    }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "1,000 API requests/month",
        "Basic MongoDB integration",
        "Standard support",
        "Basic analytics"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month", 
      features: [
        "Unlimited API requests",
        "Custom domain support",
        "Advanced analytics",
        "Priority support",
        "Team collaboration",
        "Custom integrations"
      ],
      popular: true
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Full Stack Developer",
      company: "TechCorp",
      feedback: "SchemaCraft saved me weeks of development time. The auto-generated APIs are exactly what I needed!"
    },
    {
      name: "Mike Chen", 
      role: "Backend Engineer",
      company: "StartupXYZ",
      feedback: "The MongoDB integration is seamless. I can focus on building features instead of boilerplate code."
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager", 
      company: "InnovateLab",
      feedback: "Our team's productivity increased by 300% since using SchemaCraft. Highly recommended!"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md shadow-lg py-2' 
            : 'bg-transparent py-4'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              animate={{
                x: isScrolled ? -20 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black p-2 rounded-xl">
                <Code className="w-6 h-6 text-white" />
              </div>
              <AnimatePresence>
                <motion.span 
                  className={`text-2xl font-bold text-black ${
                    isScrolled ? 'hidden sm:block' : 'block'
                  }`}
                  initial={{ opacity: 1, width: 'auto' }}
                  animate={{ 
                    opacity: isScrolled ? 0 : 1,
                    width: isScrolled ? 0 : 'auto'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  SchemaCraft
                </motion.span>
              </AnimatePresence>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-black transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-black transition-colors font-medium">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-black transition-colors font-medium">Pricing</a>
              <a href="#about" className="text-gray-700 hover:text-black transition-colors font-medium">About</a>
              <motion.button 
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <Close className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden mt-4 pb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-4 bg-white rounded-lg shadow-lg p-4">
                  <a href="#features" className="text-gray-700 hover:text-black transition-colors font-medium py-2">Features</a>
                  <a href="#how-it-works" className="text-gray-700 hover:text-black transition-colors font-medium py-2">How It Works</a>
                  <a href="#pricing" className="text-gray-700 hover:text-black transition-colors font-medium py-2">Pricing</a>
                  <a href="#about" className="text-gray-700 hover:text-black transition-colors font-medium py-2">About</a>
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-left">
                    Get Started
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden bg-white min-h-screen flex items-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-gray-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
              {...fadeInUp}
            >
              Build Your Own{' '}
              <span className="text-black">
                APIs in Minutes
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Generate APIs instantly, connect your own database, and manage everything with ease.
              Perfect for developers who want to move fast.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <button className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group">
                Get Started Free
                <ArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                <PlayArrow className="w-5 h-5" />
                View Demo
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Key Features Section */}
      <motion.section 
        id="features"
        className="py-32 bg-white relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for{' '}
              <span className="text-black">
                Modern Developers
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to build, deploy, and manage APIs without the complexity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="mb-6 p-3 bg-gray-50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-black transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        id="how-it-works"
        className="py-32 bg-gray-50 relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How It{' '}
              <span className="text-black">
                Works
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Get up and running in just three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-300"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="text-center relative"
                variants={fadeInUp}
              >
                <motion.div 
                  className="bg-black text-white text-2xl font-bold w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl relative z-10"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.number}
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">{step.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Dashboard Preview Section */}
      <motion.section 
        className="py-32 bg-white relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Beautiful{' '}
              <span className="text-black">
                Dashboard
              </span>{' '}
              Experience
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Manage your APIs with an intuitive and powerful interface designed for modern developers
            </p>
          </motion.div>

          <motion.div 
            className="relative max-w-6xl mx-auto"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            {/* Enhanced Mockup Frame */}
            <div className="bg-gray-800 rounded-t-2xl p-4 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded-lg px-4 py-1 mx-4">
                  <span className="text-gray-300 text-sm">dashboard.schemacraft.dev</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 md:p-12 rounded-b-2xl shadow-2xl border-x border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="bg-gray-100 p-3 rounded-xl w-fit mb-6">
                    <Dashboard className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">API Dashboard</h4>
                  <p className="text-gray-600">Monitor your API usage, performance metrics, and analytics in real-time</p>
                </motion.div>
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="bg-gray-100 p-3 rounded-xl w-fit mb-6">
                    <Api className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Schema Builder</h4>
                  <p className="text-gray-600">Visual schema design and management with drag-and-drop interface</p>
                </motion.div>
                <motion.div 
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="bg-gray-100 p-3 rounded-xl w-fit mb-6">
                    <Book className="w-8 h-8 text-black" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Documentation</h4>
                  <p className="text-gray-600">Auto-generated API documentation with interactive examples</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        className="py-32 bg-gray-50 relative"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple,{' '}
              <span className="text-black">
                Transparent
              </span>{' '}
              Pricing
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-white rounded-3xl shadow-xl p-10 relative overflow-hidden border-2 transition-all duration-500 ${
                  plan.popular 
                    ? 'border-black scale-105 shadow-2xl' 
                    : 'border-gray-200 hover:border-gray-200 hover:shadow-2xl'
                }`}
                variants={fadeInUp}
                whileHover={{ y: plan.popular ? 0 : -5 }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-5 ${
                  plan.popular 
                    ? 'bg-black' 
                    : 'bg-gray-400'
                }`}></div>

                {plan.popular && (
                  <motion.div 
                    className="absolute -top-5 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <span className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </motion.div>
                )}
                
                <div className="relative">
                  <div className="text-center mb-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-6xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-xl text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-5 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="bg-gray-100 rounded-full p-1 mr-4">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-gray-700 text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.button 
                    className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-black text-white shadow-lg hover:shadow-xl' 
                        : 'border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started {plan.popular && '🚀'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Us Section */}
      <motion.section 
        id="about"
        className="py-32 bg-white relative overflow-hidden"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gray-100 rounded-full opacity-30 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div className="text-center mb-20" variants={fadeInUp}>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Developers{' '}
              <span className="text-black">
                Choose
              </span>{' '}
              SchemaCraft
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Built by developers, for developers. Experience the difference.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <motion.div className="text-center group" variants={fadeInUp}>
              <motion.div 
                className="bg-gray-100 p-6 rounded-3xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <Speed className="w-16 h-16 text-black" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Developer Friendly</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Built by developers, for developers. Intuitive APIs, comprehensive documentation, and developer-first design principles.</p>
            </motion.div>
            <motion.div className="text-center group" variants={fadeInUp}>
              <motion.div 
                className="bg-gray-100 p-6 rounded-3xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <Security className="w-16 h-16 text-black" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Secure</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Enterprise-grade security with API key authentication, rate limiting, and advanced security features built-in.</p>
            </motion.div>
            <motion.div className="text-center group" variants={fadeInUp}>
              <motion.div 
                className="bg-gray-100 p-6 rounded-3xl w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                <TrendingUp className="w-16 h-16 text-black" />
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Scalable</h3>
              <p className="text-gray-600 text-lg leading-relaxed">From prototype to production, SchemaCraft scales with your needs. Handle millions of requests with ease.</p>
            </motion.div>
          </div>

          {/* Enhanced Testimonials */}
          <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer}>
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">What Developers Say</h3>
              <p className="text-gray-600 text-lg">Join thousands of happy developers</p>
            </motion.div>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6">
                  <div className="flex text-black mb-4">
                    {'★'.repeat(5)}
                  </div>
                  <p className="text-gray-700 text-lg italic leading-relaxed">"{testimonial.feedback}"</p>
                </div>
                <div className="flex items-center">
                  <div className="bg-black w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black text-white py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <motion.div 
                className="flex items-center space-x-3 mb-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="bg-white p-3 rounded-xl">
                  <Code className="w-8 h-8 text-black" />
                </div>
                <span className="text-3xl font-bold text-white">
                  SchemaCraft
                </span>
              </motion.div>
              <motion.p 
                className="text-gray-300 mb-8 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Build APIs in minutes, not days. The fastest way to create and manage your backend infrastructure with modern tools and best practices.
              </motion.p>
              <motion.div 
                className="flex space-x-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors p-3 bg-gray-800 rounded-xl hover:bg-gray-700"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <GitHub className="w-6 h-6" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors p-3 bg-gray-800 rounded-xl hover:bg-gray-700"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <LinkedIn className="w-6 h-6" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors p-3 bg-gray-800 rounded-xl hover:bg-gray-700"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <ContactMail className="w-6 h-6" />
                </motion.a>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#features" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Documentation</a></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#about" className="hover:text-white transition-colors hover:translate-x-1 inline-block">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Support</a></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h4 className="font-bold mb-6 text-lg">Resources</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Examples</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Status</a></li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div 
            className="border-t border-gray-800 mt-16 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-gray-400 text-lg">
              &copy; 2025 SchemaCraft. All rights reserved. Made with ❤️ for developers worldwide.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
