import React from 'react';
import AIRoutePlanner from '@/components/AIRoutePlanner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AIRoutePlannerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">AI Route Planner</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Plan your EV journey across Southern India with intelligent charging station routing.
              Our AI optimizes your route for minimal charging time and maximum convenience.
            </p>
          </div>
        </div>

        {/* AI Route Planner Component */}
        <AIRoutePlanner />

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold mb-2">AI Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Smart algorithms find the most efficient route with optimal charging stops
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Real-time Data</h3>
            <p className="text-sm text-muted-foreground">
              Live station availability and pricing information for accurate planning
            </p>
          </div>
          
          <div className="text-center p-6 border rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗺️</span>
            </div>
            <h3 className="font-semibold mb-2">Multi-City Coverage</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive coverage across Karnataka, Tamil Nadu, Kerala, and Andhra Pradesh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRoutePlannerPage;