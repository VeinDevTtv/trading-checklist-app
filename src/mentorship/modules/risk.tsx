'use client';

import { VideoPlayer, PlaylistPlayer } from '../components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingDown, Shield, AlertTriangle } from 'lucide-react';

export default function RiskManagementModule() {
  const moduleVideos = [
    {
      id: 'dQw4w9WgXcQ', // Example YouTube video ID - replace with actual trading content
      title: 'Risk Management Fundamentals',
      description: 'Learn the basics of position sizing and risk-reward ratios',
      duration: '12:45'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Position Sizing Strategies',
      description: 'How to calculate the perfect position size for every trade',
      duration: '15:30'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Stop Loss Placement',
      description: 'Advanced techniques for optimal stop loss positioning',
      duration: '18:20'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Portfolio Risk Management',
      description: 'Managing risk across your entire trading portfolio',
      duration: '22:15'
    }
  ];

  const keyRiskRules = [
    {
      title: 'Never Risk More Than 1-2% Per Trade',
      description: 'This is the golden rule that separates profitable traders from those who blow accounts.',
      icon: <Calculator className="h-5 w-5" />
    },
    {
      title: 'Use Proper Position Sizing',
      description: 'Calculate your position size based on your stop loss distance and risk tolerance.',
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: 'Set Stop Losses Before Entry',
      description: 'Never enter a trade without knowing exactly where you will exit if wrong.',
      icon: <TrendingDown className="h-5 w-5" />
    },
    {
      title: 'Diversify Your Risk',
      description: 'Do not put all your risk into one currency pair or market sector.',
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Module Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Risk Management Mastery
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Learn the fundamental principles that separate successful traders from those who lose money. Master position sizing, stop placement, and portfolio management.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Essential
          </Badge>
          <Badge variant="secondary">4 Videos</Badge>
          <Badge variant="secondary">~70 minutes</Badge>
        </div>
      </div>

      {/* Video Playlist */}
      <PlaylistPlayer
        videos={moduleVideos}
        title="Risk Management Video Series"
        className="mb-8"
      />

      {/* Key Risk Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            The 4 Pillars of Risk Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keyRiskRules.map((rule, index) => (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="text-red-600 dark:text-red-400">
                    {rule.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {rule.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Position Sizing Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Position Sizing Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Basic Position Size Formula
                </h4>
                <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded border">
                  Position Size = (Account Risk ÷ Trade Risk) × Account Balance
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Example Calculation:</h4>
                <ul className="space-y-2 text-sm">
                  <li><strong>Account Balance:</strong> $10,000</li>
                  <li><strong>Risk per trade:</strong> 1% = $100</li>
                  <li><strong>Stop loss distance:</strong> 50 pips</li>
                  <li><strong>Position size:</strong> $100 ÷ $50 = 2 micro lots</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Risk-Reward Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>Risk-Reward Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Your risk-reward ratio determines your long-term profitability. Here's what different ratios mean for your win rate requirements:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Risk:Reward</th>
                        <th className="text-left py-2">Min Win Rate</th>
                        <th className="text-left py-2">Breakeven</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2">1:1</td>
                        <td className="py-2">50%</td>
                        <td className="py-2">50%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">1:2</td>
                        <td className="py-2">33.3%</td>
                        <td className="py-2">33.3%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">1:3</td>
                        <td className="py-2">25%</td>
                        <td className="py-2">25%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Maximum Risk Rules</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 1-2% per trade</li>
                  <li>• 5% per day</li>
                  <li>• 10% per week</li>
                  <li>• 20% per month</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Position Sizing Tools</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Forex position calculator</li>
                  <li>• Risk/reward calculator</li>
                  <li>• Pip value calculator</li>
                  <li>• Margin calculator</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Mistakes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h5 className="font-semibold text-red-900 dark:text-red-200">Over-leveraging</h5>
                  <p className="text-red-700 dark:text-red-300">Using too much leverage and risking too much per trade</p>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <h5 className="font-semibold text-yellow-900 dark:text-yellow-200">Moving Stop Losses</h5>
                  <p className="text-yellow-700 dark:text-yellow-300">Moving stops against you to avoid taking losses</p>
                </div>
                
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h5 className="font-semibold text-orange-900 dark:text-orange-200">Revenge Trading</h5>
                  <p className="text-orange-700 dark:text-orange-300">Increasing position size after losses to "get back"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Action Items for This Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Immediate Actions:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  Calculate your maximum risk per trade (1-2% of account)
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  Set up a position sizing calculator or spreadsheet
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  Review your past trades for risk management violations
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">This Week:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  Practice position sizing calculations on 10 trades
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  Implement risk rules in your trading plan
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  Track your risk metrics daily
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 