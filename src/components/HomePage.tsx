import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Zap, Battery, MapPin, TrendingUp, Users, Car, Bike, Smartphone, ArrowRight, X, Leaf, Clock, Shield, Navigation } from "lucide-react";
const HomePage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const {
    login,
    signup
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = isSignup ? await signup(formData.username, formData.email, formData.password) : await login(formData.username, formData.email, formData.password);
      if (success) {
        toast({
          title: isSignup ? "Welcome to ChargeSmart! 🎉" : "Welcome back! 🚗",
          description: `Successfully ${isSignup ? 'signed up' : 'logged in'} as ${formData.username}`
        });
        setShowAuth(false);
      } else {
        toast({
          title: "Authentication failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const stats = [{
    icon: MapPin,
    label: "Active Stations",
    value: "1,247",
    color: "text-green-600"
  }, {
    icon: Users,
    label: "EV Users",
    value: "28.5K",
    color: "text-blue-600"
  }, {
    icon: TrendingUp,
    label: "Time Saved Daily",
    value: "342h",
    color: "text-emerald-600"
  }];
  const features = [{
    icon: Battery,
    title: "Smart Charging",
    description: "AI-powered station recommendations based on availability and your vehicle's needs"
  }, {
    icon: MapPin,
    title: "Real-time Navigation",
    description: "Live traffic and station status updates for optimal route planning"
  }, {
    icon: Clock,
    title: "Predictive Analytics",
    description: "Know before you go - predict wait times and station availability"
  }, {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Safe transactions and trusted network of verified charging stations"
  }];
  return <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-green-900 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* EV-themed 3D elements */}
          
          {/* Charging Station Pods */}
          <div className="absolute top-16 left-8 w-20 h-32 bg-gradient-to-b from-green-400/30 to-green-600/40 rounded-t-full rounded-b-lg animate-[charge-pulse_3s_ease-in-out_infinite] backdrop-blur-sm border-2 border-green-300/50 shadow-2xl transform rotate-12">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full animate-[pulse_2s_infinite]"></div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-green-500/60 rounded-full"></div>
          </div>
          
          {/* Battery Cells */}
          <div className="absolute top-32 right-16 w-16 h-24 bg-gradient-to-b from-blue-400/40 to-blue-600/50 rounded-lg animate-[battery-charge_4s_ease-in-out_infinite] backdrop-blur-sm border-2 border-blue-300/50 shadow-2xl transform -rotate-12">
            <div className="absolute top-1 left-1 right-1 h-1 bg-blue-300/60 rounded-full"></div>
            <div className="absolute bottom-2 left-2 right-2 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded animate-[energy-flow_2s_ease-in-out_infinite]"></div>
          </div>
          
          {/* Electric Particles */}
          <div className="absolute top-20 left-1/3 w-6 h-6 bg-yellow-400/80 rounded-full animate-[spark_1.5s_ease-in-out_infinite] shadow-lg">
            <div className="absolute inset-0 bg-yellow-300/60 rounded-full animate-[pulse_1s_infinite]"></div>
          </div>
          <div className="absolute bottom-40 right-1/4 w-4 h-4 bg-cyan-400/80 rounded-full animate-[spark_2s_ease-in-out_infinite_0.5s] shadow-lg">
            <div className="absolute inset-0 bg-cyan-300/60 rounded-full animate-[pulse_1.2s_infinite]"></div>
          </div>
          <div className="absolute top-48 left-2/3 w-5 h-5 bg-green-400/80 rounded-full animate-[spark_1.8s_ease-in-out_infinite_1s] shadow-lg">
            <div className="absolute inset-0 bg-green-300/60 rounded-full animate-[pulse_0.8s_infinite]"></div>
          </div>
          
          {/* Power Flow Lines */}
          <div className="absolute top-1/4 left-0 w-full h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-[power-flow_3s_ease-in-out_infinite] rounded-full shadow-lg"></div>
          </div>
          <div className="absolute top-2/3 left-0 w-full h-1">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[power-flow_3s_ease-in-out_infinite_1.5s] rounded-full shadow-lg"></div>
          </div>
          
          {/* Floating EV Icons */}
          <div className="absolute top-24 right-32 text-3xl animate-[float-rotate_8s_ease-in-out_infinite] opacity-20">
            🚗
          </div>
          <div className="absolute bottom-32 left-20 text-2xl animate-[float-rotate_6s_ease-in-out_infinite_2s] opacity-20">
            🛵
          </div>
          <div className="absolute top-56 left-1/2 text-xl animate-[float-rotate_7s_ease-in-out_infinite_1s] opacity-20">
            ⚡
          </div>
          
          {/* Energy Orbs */}
          <div className="absolute top-40 left-1/4 w-12 h-12 bg-gradient-radial from-green-400/60 via-green-500/40 to-transparent rounded-full animate-[energy-orb_5s_ease-in-out_infinite] backdrop-blur-sm"></div>
          <div className="absolute bottom-48 right-1/3 w-10 h-10 bg-gradient-radial from-blue-400/60 via-blue-500/40 to-transparent rounded-full animate-[energy-orb_4s_ease-in-out_infinite_2s] backdrop-blur-sm"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-green-100/90 text-green-700 border-green-200/50 hover:bg-green-200/90 backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              AI EV Network
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent leading-tight drop-shadow-lg">
              ChargeSmart
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed font-light">
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg" onClick={() => setShowAuth(true)}>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Link to="/ai-route-planner">
                
              </Link>
            </div>
            
            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              {stats.map((stat, index) => <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ChargeSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of electric vehicle charging with our intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* EV Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-50">
              Supporting All Electric Vehicles
            </h2>
            <p className="text-xl text-gray-50">
              From cars to scooters, we've got you covered
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Car className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Electric Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Tata Nexon EV, MG ZS EV, Hyundai Kona & more</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <Smartphone className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Electric Scooters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Ather 450X, Ola S1 Pro, TVS iQube & more</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Bike className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Electric Bikes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Hero Electric, Okinawa, Ampere & more</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="relative">
              <button onClick={() => setShowAuth(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
              <CardTitle className="text-2xl text-center">
                {isSignup ? 'Join ChargeSmart' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignup ? 'Create your account to get started' : 'Sign in to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" value={formData.username} onChange={e => setFormData({
                ...formData,
                username: e.target.value
              })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} required />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={e => setFormData({
                ...formData,
                password: e.target.value
              })} required minLength={6} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
                </Button>
              </form>
              <div className="text-center mt-4">
                <button onClick={() => setIsSignup(!isSignup)} className="text-sm text-blue-600 hover:underline">
                  {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
};
export default HomePage;