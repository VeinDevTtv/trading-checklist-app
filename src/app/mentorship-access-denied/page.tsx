'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Brain, 
  Video,
  FileText,
  Star,
  Shield
} from 'lucide-react';
import { YouTubeAuthManager } from '@/utils/youtubeAuth';

export default function MentorshipAccessDenied() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const authManager = YouTubeAuthManager.getInstance();
      const userProfile = await authManager.signIn();
      setUser(userProfile);
      
      // Redirect to mentorship dashboard after successful sign in
      if (userProfile) {
        window.location.href = '/mentorship';
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: '1-on-1 Trade Review Opportunities',
      description: 'Get personalized feedback on your trades from experienced professionals'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Risk Management Blueprints',
      description: 'Proven frameworks to protect your capital and maximize returns'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Daily Trade Signals with Screenshots',
      description: 'Real-time market opportunities with detailed entry and exit points'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Psychology Coaching for Consistency',
      description: 'Master the mental game of trading with proven psychological techniques'
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: 'Video Walkthroughs of Live Trades',
      description: 'See exactly how professional traders analyze and execute trades'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Lifetime Strategy Updates',
      description: 'Stay current with evolving market conditions and new strategies'
    }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Day Trader",
      content: "The mentorship program completely transformed my trading. I went from losing consistently to having my first profitable quarter.",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Swing Trader",
      content: "The psychology coaching alone was worth the entire program. I finally learned to control my emotions while trading.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Options Trader",
      content: "The real-time signals and trade analysis helped me understand market structure like never before.",
      rating: 5
    }
  ];

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$97',
      period: '/month',
      features: [
        'Access to all video modules',
        'Weekly trade signals',
        'Community forum access',
        'Basic risk management tools'
      ],
      recommended: false
    },
    {
      name: 'Premium',
      price: '$197',
      period: '/month',
      features: [
        'Everything in Basic',
        'Daily trade signals with analysis',
        '1-on-1 monthly coaching call',
        'Advanced psychology modules',
        'Trade review submissions',
        'Direct mentor messaging'
      ],
      recommended: true
    },
    {
      name: 'VIP',
      price: '$397',
      period: '/month',
      features: [
        'Everything in Premium',
        'Weekly 1-on-1 coaching calls',
        'Live trading room access',
        'Custom strategy development',
        'Priority support',
        'Exclusive mastermind group'
      ],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Unlock Professional Trading Mentorship
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join thousands of traders who have transformed their trading with our comprehensive mentorship program
          </p>
        </div>

        {/* Value Proposition */}
        <Card className="mb-12 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
              What You Get Inside
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                    <div className="text-blue-600 dark:text-blue-400">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Choose Your Path to Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative ${tier.recommended ? 'border-2 border-blue-500 shadow-lg scale-105' : ''}`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {tier.price}
                    <span className="text-lg text-gray-500">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={tier.recommended ? "default" : "outline"}
                    onClick={handleSignIn}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            What Our Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Sign in with your Google account to get started. You'll have immediate access to our mentorship dashboard and can choose your subscription tier.
            </p>
            <Button 
              size="lg" 
              onClick={handleSignIn}
              disabled={isLoading}
              className="px-8 py-3"
            >
              {isLoading ? 'Signing In...' : 'Sign In with Google & Get Started'}
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              30-day money-back guarantee • Cancel anytime • No long-term commitments
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 