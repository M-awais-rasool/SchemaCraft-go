import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Database, 
  Plus, 
  Users, 
  Edit,
  Eye,
  Sparkles, 
  Code2,
  Monitor
} from "lucide-react";

const demoSteps = [
  {
    id: "create",
    title: "Create Schema",
    description: "Start with a simple table structure",
    action: "Creating 'Users' table...",
    icon: Database
  },
  {
    id: "fields",
    title: "Add Fields", 
    description: "Define your data structure dynamically",
    action: "Adding email, name, and profile fields...",
    icon: Code2
  },
  {
    id: "collaborate",
    title: "Team Collaboration",
    description: "Invite team members to edit together",
    action: "Sarah joined the workspace...",
    icon: Users
  },
  {
    id: "data",
    title: "Insert Data",
    description: "Add real data to test your schema",
    action: "Inserting sample records...",
    icon: Edit
  }
];

const sampleData = [
  { id: "1", email: "john@example.com", name: "John Doe", role: "Admin" },
  { id: "2", email: "sarah@example.com", name: "Sarah Chen", role: "Editor" },
  { id: "3", email: "mike@example.com", name: "Mike Johnson", role: "Viewer" }
];

export function ProductDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showData, setShowData] = useState(false);
  const [activeTab, setActiveTab] = useState("schema");

  const handlePlayDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setActiveTab("schema");
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          setShowData(true);
          setActiveTab("data");
          return prev;
        }
        // Switch to collaborate tab when reaching collaboration step
        if (prev === 1) {
          setTimeout(() => setActiveTab("collaborate"), 1000);
        }
        return prev + 1;
      });
    }, 2500);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setShowData(false);
    setActiveTab("schema");
  };

  return (
    <section id="demo" className="py-16 lg:py-24 bg-gradient-to-br from-muted/30 via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
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
              <Monitor className="h-3 w-3 mr-1 inline" />
              <span className="relative z-10">See It In Action</span>
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Watch DataForge in action
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            See how easy it is to create, modify, and collaborate on database schemas 
            without any complex setup or migration headaches.
          </motion.p>

          {/* Enhanced Demo Controls */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handlePlayDemo} 
                disabled={isPlaying}
                size="lg"
                className="px-8 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary"
                  initial={{ x: isPlaying ? "0%" : "-100%" }}
                  animate={{ x: isPlaying ? "100%" : "-100%" }}
                  transition={{ duration: 0.6 }}
                />
                <span className="relative z-10 flex items-center">
                  {isPlaying ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Pause className="mr-2 h-5 w-5" />
                      </motion.div>
                      Playing Demo
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start Demo
                    </>
                  )}
                </span>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={resetDemo} size="lg" className="px-8">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Demo Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.01, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Enhanced Browser Header */}
                <div className="bg-muted/50 p-4 border-b border-border/20 relative">
                  {/* Background gradient on browser header */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  <div className="flex items-center gap-2 mb-3 relative z-10">
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
                    <span className="ml-4 text-sm text-muted-foreground">
                      app.dataforge.io/workspace/demo
                    </span>
                  </div>
                  
                  {/* Enhanced Demo Progress */}
                  <div className="flex items-center gap-2 relative z-10">
                    {demoSteps.map((step, index) => (
                      <motion.div key={step.id} className="flex items-center">
                        <motion.div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-500 relative overflow-hidden ${
                            index <= currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          {index <= currentStep && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-primary to-accent"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                          )}
                          <motion.div
                            className="relative z-10"
                            animate={index === currentStep && isPlaying ? { rotate: 360 } : {}}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <step.icon className="h-4 w-4" />
                          </motion.div>
                        </motion.div>
                        {index < demoSteps.length - 1 && (
                          <motion.div 
                            className={`w-8 h-0.5 transition-all duration-500 ${
                              index < currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: index < currentStep ? 1 : 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Demo Content */}
                <div className="p-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="schema" className="flex items-center gap-2 relative overflow-hidden group">
                          <motion.div
                            className="absolute inset-0 bg-primary/10"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                          <Database className="h-4 w-4" />
                          <span className="relative z-10">Schema</span>
                        </TabsTrigger>
                        <TabsTrigger value="collaborate" className="flex items-center gap-2 relative overflow-hidden group">
                          <motion.div
                            className="absolute inset-0 bg-primary/10"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                          <Users className="h-4 w-4" />
                          <span className="relative z-10">Collaborate</span>
                        </TabsTrigger>
                        <TabsTrigger value="data" className="flex items-center gap-2 relative overflow-hidden group">
                          <motion.div
                            className="absolute inset-0 bg-primary/10"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                          <Eye className="h-4 w-4" />
                          <span className="relative z-10">Data</span>
                        </TabsTrigger>
                      </TabsList>
                    </motion.div>

                    <TabsContent value="schema" className="mt-6">
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Enhanced Schema Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: 180, scale: 1.1 }}
                              transition={{ duration: 0.4 }}
                            >
                              <Database className="h-6 w-6 text-primary" />
                            </motion.div>
                            <h3 className="text-xl">Users Table</h3>
                            <motion.div
                              animate={{ 
                                scale: isPlaying ? [1, 1.1, 1] : 1,
                                opacity: isPlaying ? [0.7, 1, 0.7] : 1
                              }}
                              transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                            >
                              <Badge variant="outline" className="text-xs">
                                {isPlaying ? 'Building...' : 'Ready'}
                              </Badge>
                            </motion.div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button size="sm" variant="outline" className="group">
                              <motion.div
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                              </motion.div>
                              Add Field
                            </Button>
                          </motion.div>
                        </div>

                        {/* Enhanced Schema Fields */}
                        <div className="space-y-2">
                          <motion.div 
                            className="grid grid-cols-4 gap-3 text-sm text-muted-foreground uppercase tracking-wide border-b border-border/20 pb-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <span>Field Name</span>
                            <span>Type</span>
                            <span>Constraints</span>
                            <span>Actions</span>
                          </motion.div>

                          <AnimatePresence>
                            {['id', 'email', 'name', 'role'].slice(0, currentStep >= 1 ? 4 : 1).map((field, index) => (
                              <motion.div
                                key={field}
                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                transition={{ delay: index * 0.2, duration: 0.4 }}
                                whileHover={{ 
                                  backgroundColor: "var(--color-muted)", 
                                  x: 5,
                                  scale: 1.01 
                                }}
                                className="grid grid-cols-4 gap-3 py-3 border-b border-border/10 transition-all rounded-md px-2 cursor-pointer group"
                              >
                                <motion.span 
                                  className="font-medium"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {field}
                                </motion.span>
                                <Badge variant="secondary" className="text-xs w-fit">
                                  {field === 'id' ? 'UUID' : field === 'email' ? 'Email' : 'String'}
                                </Badge>
                                <div className="flex gap-2">
                                  {field === 'id' && <Badge className="text-xs bg-blue-100 text-blue-800">Primary</Badge>}
                                  {field === 'email' && <Badge className="text-xs bg-orange-100 text-orange-800">Unique</Badge>}
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </motion.div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="collaborate" className="mt-6">
                      <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Enhanced Active Users */}
                        <div>
                          <h4 className="mb-4">Active Collaborators</h4>
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              <motion.div 
                                className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white relative overflow-hidden"
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                                <span className="relative z-10">You</span>
                              </motion.div>
                              <AnimatePresence>
                                {currentStep >= 2 && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0, x: -20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                    className="w-10 h-10 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm relative overflow-hidden"
                                  >
                                    <motion.div
                                      className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                                      animate={{ rotate: [360, 0] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span className="relative z-10">SC</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            {currentStep >= 2 && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                              >
                                <motion.div 
                                  className="w-2 h-2 bg-green-500 rounded-full"
                                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="text-sm text-muted-foreground">Sarah is editing...</span>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Recent Activity */}
                        <div>
                          <h4 className="mb-4">Recent Activity</h4>
                          <div className="space-y-3">
                            <AnimatePresence>
                              {currentStep >= 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/10 hover:border-border/30 transition-all cursor-pointer"
                                >
                                  <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Database className="h-4 w-4 text-primary" />
                                  </motion.div>
                                  <span className="text-sm">You created the Users schema</span>
                                  <span className="text-xs text-muted-foreground ml-auto">2m ago</span>
                                </motion.div>
                              )}
                              {currentStep >= 2 && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/10 hover:border-border/30 transition-all cursor-pointer"
                                >
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Users className="h-4 w-4 text-green-600" />
                                  </motion.div>
                                  <span className="text-sm">Sarah Chen joined the workspace</span>
                                  <span className="text-xs text-muted-foreground ml-auto">1m ago</span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="data" className="mt-6">
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4>Sample Data</h4>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button size="sm" variant="outline" className="group">
                              <motion.div
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                              </motion.div>
                              Add Record
                            </Button>
                          </motion.div>
                        </div>

                        {showData ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="overflow-x-auto bg-card/50 rounded-lg border"
                          >
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border/20">
                                  <th className="text-left py-3 px-4">ID</th>
                                  <th className="text-left py-3 px-4">Email</th>
                                  <th className="text-left py-3 px-4">Name</th>
                                  <th className="text-left py-3 px-4">Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sampleData.map((row, index) => (
                                  <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    whileHover={{ backgroundColor: "var(--color-muted)", scale: 1.01 }}
                                    className="border-b border-border/10 transition-all cursor-pointer"
                                  >
                                    <td className="py-3 px-4 font-mono text-xs">{row.id}</td>
                                    <td className="py-3 px-4">{row.email}</td>
                                    <td className="py-3 px-4">{row.name}</td>
                                    <td className="py-3 px-4">
                                      <Badge variant="outline" className="text-xs">{row.role}</Badge>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="text-center py-12 text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.div
                              animate={{ 
                                y: [-5, 5, -5],
                                rotate: [0, 5, 0, -5, 0]
                              }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            </motion.div>
                            <p>Run the demo to see sample data in action</p>
                          </motion.div>
                        )}
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  {/* Enhanced Current Action */}
                  <AnimatePresence>
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="mt-6 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-lg border border-primary/20 relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: [-200, 400] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="flex items-center gap-3 relative z-10">
                          <motion.div 
                            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="font-medium">{demoSteps[currentStep]?.action}</span>
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Sparkles className="h-4 w-4 text-primary ml-auto" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}