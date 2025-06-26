import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  Shield, 
  Clock, 
  Users, 
  MapPin, 
  Star,
  CheckCircle,
  Phone,
  Mail
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Bus className="w-8 h-8 text-blue-600" />,
      title: "Safe & Reliable Transportation",
      description: "Professional drivers with clean records and fully insured vehicles for your peace of mind."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Licensed & Insured",
      description: "All drivers are licensed by Miami-Dade County and carry comprehensive insurance coverage."
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Flexible Scheduling",
      description: "Customizable pickup and drop-off times to fit your family's schedule and school hours."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Direct Communication",
      description: "Stay connected with your driver through our secure messaging system for updates and coordination."
    },
    {
      icon: <MapPin className="w-8 h-8 text-red-600" />,
      title: "Miami-Dade Coverage",
      description: "Serving schools throughout Miami-Dade County with comprehensive route coverage."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      title: "Rated Drivers",
      description: "Review and rate drivers to help maintain high service standards in our community."
    }
  ];

  const benefits = [
    "Licensed Miami-Dade County drivers",
    "Comprehensive vehicle insurance",
    "Real-time communication with drivers",
    "Flexible pricing options (daily, weekly, monthly)",
    "Emergency contact system",
    "Route customization available"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Bus className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Vananavan</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              Serving Miami-Dade County Schools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Safe & Reliable
              <span className="text-blue-600 block">School Transportation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with licensed, professional drivers in Miami-Dade County. 
              Find the perfect transportation solution for your student with our 
              easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=rider">
                <Button size="lg" className="w-full sm:w-auto">
                  Find a Driver
                </Button>
              </Link>
              <Link to="/register?role=driver">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a Driver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Vananavan?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a secure, reliable platform connecting families with 
              qualified drivers throughout Miami-Dade County.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need for Safe School Transportation
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform ensures that every ride meets the highest standards 
                of safety and reliability, giving parents peace of mind.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Ready to Get Started?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">For Parents</h4>
                    <p className="text-sm text-gray-600">Find trusted drivers in your area</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <Bus className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">For Drivers</h4>
                    <p className="text-sm text-gray-600">Connect with families and grow your business</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Link to="/register?role=rider" className="block">
                  <Button className="w-full">Sign Up as Parent</Button>
                </Link>
                <Link to="/register?role=driver" className="block">
                  <Button variant="outline" className="w-full">Sign Up as Driver</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions? We're Here to Help
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Contact our support team for assistance with registration, 
              driver verification, or any other questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-blue-600" />
                <span className="text-lg text-gray-700">(305) 555-0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-blue-600" />
                <span className="text-lg text-gray-700">support@vananavan.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Bus className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">Vananavan</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting families with safe, reliable school transportation 
                throughout Miami-Dade County.
              </p>
              <p className="text-sm text-gray-500">
                Licensed and regulated by Miami-Dade County Transportation Authority
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
                <li><a href="#" className="hover:text-white">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Driver Requirements</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Vananavan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

