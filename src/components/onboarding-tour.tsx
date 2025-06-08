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
  Target
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
        <p>Let&apos;s take a quick tour to show you how to make confident trading decisions with our advanced checklist system.</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4" />
          <span>This tour takes about 2 minutes</span>
        </div>
      </div>
    ),
    position: 'center' as const,
  },
  {
    selector: '[data-tour="strategy-selector"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">1. Choose Your Strategy</h4>
        <p>Start by selecting a trading strategy. We have 3 pre-built strategies, or you can create your own custom strategy.</p>
        <div className="flex gap-2">
          <Badge variant="outline">ICT 2022</Badge>
          <Badge variant="outline">Price Action</Badge>
          <Badge variant="outline">Supply & Demand</Badge>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="new-strategy"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">Create Custom Strategies</h4>
        <p>Click here to build your own trading strategy with custom conditions and importance levels.</p>
        <p className="text-sm text-muted-foreground">You can add unlimited conditions and assign High, Medium, or Low importance to each.</p>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="checklist"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">2. Complete Your Checklist</h4>
        <p>Check off conditions as they&apos;re met in your trade analysis. The system automatically calculates your confidence score.</p>
        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-green-600" />
          <span>Aim for an A+ setup (85%+ score or all high-priority conditions)</span>
        </div>
      </div>
    ),
    position: 'right' as const,
  },
  {
    selector: '[data-tour="notes"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">Add Trade Notes & Screenshots</h4>
        <p>Document your analysis and attach screenshots or charts. You can drag & drop images or paste from clipboard.</p>
        <p className="text-sm text-muted-foreground">Images are stored locally and included in your trade history.</p>
      </div>
    ),
    position: 'left' as const,
  },
  {
    selector: '[data-tour="save-trade"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">3. Save Your Trade Decision</h4>
        <p>Once you&apos;ve completed your analysis, save the trade to build your trading history and track performance over time.</p>
        <p className="text-sm text-muted-foreground">You can also export your analysis as a PDF report.</p>
      </div>
    ),
    position: 'top' as const,
  },
  {
    selector: '[data-tour="performance-tab"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">4. Analyze Your Performance</h4>
        <p>View comprehensive analytics including equity curves, win rates, drawdown analysis, and strategy comparisons.</p>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span>Professional-grade trading analytics</span>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
  {
    selector: '[data-tour="share-strategy"]',
    content: (
      <div className="space-y-3">
        <h4 className="font-semibold">5. Share Your Strategies</h4>
        <p>Export strategies as JSON files or generate shareable URLs to collaborate with other traders.</p>
        <div className="flex items-center gap-2 text-sm">
          <Share2 className="h-4 w-4 text-purple-600" />
          <span>Build a community around your trading strategies</span>
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
          <h3 className="text-lg font-semibold">You&apos;re All Set!</h3>
        </div>
        <p>You now know the key features of A+ Trade Checklist. Start by creating your first strategy or using one of our pre-built ones.</p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Pro Tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use the History button to see strategy evolution</li>
            <li>• Add P&L data to trades for performance tracking</li>
            <li>• Export strategies to backup your setups</li>
            <li>• Check the Performance tab regularly to improve</li>
          </ul>
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
            It looks like this is your first time here. Would you like a quick tour to learn how to use the platform?
          </p>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">You&apos;ll learn how to:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Create and manage trading strategies</li>
              <li>• Use the intelligent scoring system</li>
              <li>• Track performance with analytics</li>
              <li>• Share strategies with other traders</li>
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