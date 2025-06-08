"use client"

import { useState, useEffect } from "react"
import { TourProvider, useTour } from "@reactour/tour"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  RotateCcw, 
  X, 
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Share2,
  Target,
  Mic,
  Video,
  Users,
  MessageCircle,
  Calculator,
  History,
  Filter,
  Calendar,
  Camera
} from "lucide-react"

interface OnboardingTourProps {
  isFirstVisit: boolean
  onTourComplete: () => void
}

const tourSteps = [
  {
    selector: 'body',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Welcome to A+ Trade Checklist!</h3>
        </div>
        <p>Let&apos;s take a comprehensive tour to show you all the powerful features for confident trading decisions.</p>
        <div className="space-y-2">
          <p className="text-sm font-medium">You&apos;ll discover:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Advanced checklist system with intelligent scoring</li>
            <li>• Voice & video notes with transcription</li>
            <li>• Real-time collaboration with mentors</li>
            <li>• Tag-based performance analytics</li>
            <li>• Professional trading tools & risk management</li>
          </ul>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span>This comprehensive tour takes about 4 minutes</span>
        </div>
      </div>
    ),
    position: 'center' as const,
  },
  {
    selector: '[data-tour="strategy-selector"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">1. Choose Your Trading Strategy</h4>
        <p>Start by selecting a trading strategy. We have 3 pre-built professional strategies, or create your own custom strategy.</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">ICT 2022</Badge>
          <Badge variant="outline">Price Action</Badge>
          <Badge variant="outline">Supply & Demand</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Each strategy has weighted conditions based on importance levels.</p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="new-strategy"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">Create Custom Strategies</h4>
        <p>Build your own trading strategy with unlimited conditions and importance levels.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>High (3pts) - Critical conditions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Medium (2pts) - Important conditions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Low (1pt) - Nice-to-have confirmations</span>
          </div>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="checklist"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">2. Complete Your Analysis Checklist</h4>
        <p>Check off conditions as they&apos;re met in your chart analysis. The intelligent scoring system calculates your confidence level in real-time.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-green-600" />
            <span>A+ Setup: 85%+ score or all high-priority conditions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Live scoring with weighted importance calculations</span>
          </div>
        </div>
      </div>
    ),
    position: 'right' as const,
  },
  {
    selector: '[data-tour="notes"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">3. Document Your Analysis</h4>
        <p>Add detailed trade notes and attach screenshots or charts. Multiple ways to capture your analysis:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4 text-blue-600" />
            <span>Drag & drop images or paste from clipboard</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mic className="h-4 w-4 text-green-600" />
            <span>Record voice notes with auto-transcription</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-purple-600" />
            <span>Capture video explanations (30 seconds)</span>
          </div>
        </div>
      </div>
    ),
    position: 'left' as const,
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">🎤 Voice & Video Notes</h4>
        <p>Record 30-second audio or video snippets to capture your thought process and market analysis.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mic className="h-4 w-4 text-green-600" />
            <span>Automatic speech-to-text transcription</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-purple-600" />
            <span>Screen recordings with audio commentary</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Searchable transcriptions for easy review</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Perfect for capturing market sentiment and quick analysis notes!</p>
      </div>
    ),
    position: 'center' as const,
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">🤝 Real-Time Collaboration</h4>
        <p>Work with mentors and other traders in real-time using our advanced collaboration system.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Live checklist synchronization</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span>Inline comments and feedback system</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-purple-600" />
            <span>See cursor movements and user presence</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Create private rooms or join existing ones with simple room IDs. Perfect for mentorship!</p>
      </div>
    ),
    position: 'center' as const,
  },
  {
    selector: '[data-tour="save-trade"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">4. Save Your Trade Decision</h4>
        <p>Once you&apos;ve completed your analysis, save the trade to build your comprehensive trading history.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Complete trade log with all attachments</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Share2 className="h-4 w-4 text-blue-600" />
            <span>Export analysis as professional PDF report</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Don&apos;t forget to update trades with P&L data later for performance tracking!</p>
      </div>
    ),
    position: 'top' as const,
  },
  {
    selector: '[data-tour="calculator-tab"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">🧮 Risk Calculator</h4>
        <p>Professional position sizing and risk management tools to protect your capital.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span>Automatic position size calculations</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-green-600" />
            <span>Risk-reward ratio analysis</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span>Visual risk level indicators</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Set your account balance and risk percentage for precise lot size calculations.</p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="performance-tab"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">5. Performance Analytics Dashboard</h4>
        <p>Comprehensive analytics to track and improve your trading performance over time.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>Equity curves, win rates, Sharpe ratio</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-green-600" />
            <span>Strategy comparison and optimization</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Calendar heatmaps and time analysis</span>
          </div>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="tags-tab"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">🏷️ Tag-Based Performance Analysis</h4>
        <p>Click any tag to see filtered performance data and identify your most profitable setups.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Interactive heatmaps by currency pairs, sessions, setups</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Win rates and equity curves per tag</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-purple-600" />
            <span>Drill down into specific trading patterns</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Perfect for identifying which sessions, pairs, or setups work best for you!</p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="history-tab"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">📊 Trade History & Advanced Filtering</h4>
        <p>Comprehensive trade management with powerful search and filtering capabilities.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-blue-600" />
            <span>Complete trade history with post-trade updates</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-green-600" />
            <span>Multi-dimensional filtering by any criteria</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>Calendar heatmap with daily performance</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Update trades with P&L, outcomes, and detailed metadata for complete tracking.</p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="share-strategy"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">6. Strategy Sharing & Collaboration</h4>
        <p>Share your strategies with the trading community and learn from others.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Share2 className="h-4 w-4 text-purple-600" />
            <span>Export as JSON files or shareable URLs</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-600" />
            <span>Strategy versioning and revision history</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-green-600" />
            <span>Build a community around your strategies</span>
          </div>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-semibold">You&apos;re Ready to Trade with Confidence!</h3>
        </div>
        <p>You now know all the powerful features of A+ Trade Checklist. Start by creating your first strategy or using one of our pre-built ones.</p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Pro Tips for Success:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Always aim for A+ setups before entering trades</li>
            <li>• Use voice notes to capture market sentiment</li>
            <li>• Collaborate with mentors for better decision-making</li>
            <li>• Update trades with P&L data for accurate performance tracking</li>
            <li>• Analyze tag-based performance to optimize your edge</li>
            <li>• Use the risk calculator for proper position sizing</li>
            <li>• Review performance dashboard regularly to improve</li>
          </ul>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
            Remember: This tool helps with analysis and decision-making. Always practice proper risk management!
          </p>
        </div>
      </div>
    ),
    position: 'center' as const,
  },
]

// Welcome Card Component
function WelcomeCard({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Welcome to A+ Trade Checklist!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            It looks like this is your first time here. Would you like a comprehensive tour to learn all the powerful features?
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">You&apos;ll discover how to:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create intelligent trading strategies with weighted scoring</li>
              <li>• Record voice & video notes with auto-transcription</li>
              <li>• Collaborate in real-time with mentors and traders</li>
              <li>• Analyze performance with tag-based heatmaps</li>
              <li>• Use professional risk management tools</li>
              <li>• Track comprehensive trading analytics</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onStart} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
            <Button variant="outline" onClick={onSkip}>
              <X className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Tour Content Component
function TourContent({ isFirstVisit, onTourComplete }: OnboardingTourProps) {
  const { setIsOpen } = useTour()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (isFirstVisit) {
      // Show welcome card after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isFirstVisit])

  const startTour = () => {
    setShowWelcome(false)
    setIsOpen(true)
  }

  const skipTour = () => {
    setShowWelcome(false)
    onTourComplete()
  }

  return (
    <>
      {showWelcome && (
        <WelcomeCard onStart={startTour} onSkip={skipTour} />
      )}
    </>
  )
}

export function OnboardingTour({ isFirstVisit, onTourComplete }: OnboardingTourProps) {
  return (
    <TourProvider
      steps={tourSteps}
      showBadge={true}
      showCloseButton={true}
      showNavigation={true}
      showPrevNextButtons={true}
      showDots={true}
      scrollSmooth={true}
      afterOpen={() => {
        // Tour opened
      }}
      beforeClose={() => {
        // Tour about to close
        onTourComplete()
      }}
      styles={{
        popover: (base) => ({
          ...base,
          '--reactour-accent': 'hsl(var(--primary))',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }),
        maskWrapper: (base) => ({
          ...base,
          color: 'hsl(var(--primary))',
        }),
        badge: (base) => ({
          ...base,
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        }),
        controls: (base) => ({
          ...base,
          marginTop: '16px',
        }),
        button: (base) => ({
          ...base,
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          cursor: 'pointer',
        }),
        close: (base) => ({
          ...base,
          color: 'hsl(var(--muted-foreground))',
          right: '8px',
          top: '8px',
        }),
      }}
    >
      <TourContent isFirstVisit={isFirstVisit} onTourComplete={onTourComplete} />
    </TourProvider>
  )
}

// Tour Control Component for Manual Tour Restart
export function TourControls() {
  const { setIsOpen } = useTour()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Restart Tour
    </Button>
  )
} 