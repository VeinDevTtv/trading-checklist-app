"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  Award, 
  Flame, 
  Star,
  Shield,
  Zap,
  Crown,
  Gem,
  BarChart3
} from "lucide-react"

interface TradeLog {
  id: number
  strategyName: string
  checkedIds: number[]
  score: number
  possible: number
  notes: string
  verdict: string
  timestamp: string
  pnl?: number
  riskAmount?: number
  outcome?: 'win' | 'loss' | 'breakeven'
  riskRewardRatio?: number
  tags?: string[]
}

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedDate?: string
  progress?: number
  requirement?: number
}

interface GamifiedConsistencyMeterProps {
  trades: TradeLog[]
}

export function GamifiedConsistencyMeter({ trades }: GamifiedConsistencyMeterProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')

  // Calculate consistency metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Filter trades by timeframe
    const filteredTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.timestamp)
      switch (selectedTimeframe) {
        case 'week':
          return tradeDate >= oneWeekAgo
        case 'month':
          return tradeDate >= oneMonthAgo
        default:
          return true
      }
    })

    // Calculate A+ streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const sortedTrades = [...trades].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    for (const trade of sortedTrades) {
      if (trade.verdict === 'A+') {
        tempStreak++
        if (tempStreak === sortedTrades.indexOf(trade) + 1) {
          currentStreak = tempStreak
        }
      } else {
        tempStreak = 0
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // Calculate other metrics
    const aPlusTrades = filteredTrades.filter(t => t.verdict === 'A+')
    const aPlusRate = filteredTrades.length > 0 ? (aPlusTrades.length / filteredTrades.length) * 100 : 0

    // Risk discipline score (based on consistent risk management)
    const tradesWithRisk = filteredTrades.filter(t => t.riskAmount && t.riskAmount > 0)
    const avgRisk = tradesWithRisk.length > 0 
      ? tradesWithRisk.reduce((sum, t) => sum + (t.riskAmount || 0), 0) / tradesWithRisk.length 
      : 0
    const riskVariance = tradesWithRisk.length > 0
      ? tradesWithRisk.reduce((sum, t) => sum + Math.pow((t.riskAmount || 0) - avgRisk, 2), 0) / tradesWithRisk.length
      : 0
    const riskDisciplineScore = avgRisk > 0 ? Math.max(0, 100 - (riskVariance / avgRisk) * 100) : 100

    // Weekly consistency (trades per week)
    const weeksInPeriod = selectedTimeframe === 'week' ? 1 : selectedTimeframe === 'month' ? 4 : 12
    const weeklyConsistency = filteredTrades.length / weeksInPeriod

    // Calculate XP and level
    const xp = trades.reduce((total, trade) => {
      let points = 10 // Base points per trade
      if (trade.verdict === 'A+') points += 20
      if (trade.outcome === 'win') points += 15
      if (trade.riskRewardRatio && trade.riskRewardRatio >= 2) points += 10
      return total + points
    }, 0)

    const level = Math.floor(xp / 1000) + 1

    return {
      currentStreak,
      longestStreak,
      aPlusRate,
      riskDisciplineScore: isNaN(riskDisciplineScore) ? 100 : riskDisciplineScore,
      weeklyConsistency,
      level,
      xp
    }
  }, [trades, selectedTimeframe])

  // Define available badges
  const badges = useMemo((): Badge[] => {
    const aPlusTrades = trades.filter(t => t.verdict === 'A+').length
    const winningTrades = trades.filter(t => t.outcome === 'win').length
    const totalTrades = trades.length

    return [
      {
        id: 'first-aplus',
        name: 'First A+',
        description: 'Complete your first A+ setup',
        icon: <Star className="h-4 w-4" />,
        rarity: 'common',
        unlocked: aPlusTrades >= 1,
        unlockedDate: aPlusTrades >= 1 ? trades.find(t => t.verdict === 'A+')?.timestamp : undefined
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Achieve 5 consecutive A+ setups',
        icon: <Flame className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: metrics.longestStreak >= 5,
        progress: Math.min(metrics.longestStreak, 5),
        requirement: 5
      },
      {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Maintain 80% A+ rate over 20 trades',
        icon: <Crown className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: totalTrades >= 20 && metrics.aPlusRate >= 80,
        progress: totalTrades >= 20 ? Math.min(metrics.aPlusRate, 80) : 0,
        requirement: 80
      },
      {
        id: 'risk-guardian',
        name: 'Risk Guardian',
        description: 'Perfect risk discipline score',
        icon: <Shield className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: metrics.riskDisciplineScore >= 95,
        progress: Math.min(metrics.riskDisciplineScore, 95),
        requirement: 95
      },
      {
        id: 'profit-legend',
        name: 'Profit Legend',
        description: 'Win 50 trades',
        icon: <Trophy className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: winningTrades >= 50,
        progress: Math.min(winningTrades, 50),
        requirement: 50
      },
      {
        id: 'diamond-hands',
        name: 'Diamond Hands',
        description: 'Complete 100 total trades',
        icon: <Gem className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: totalTrades >= 100,
        progress: Math.min(totalTrades, 100),
        requirement: 100
      }
    ]
  }, [trades, metrics])

  const totalBadges = badges.filter(b => b.unlocked).length

  // Badge rarity colors
  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  // Level progress
  const levelProgress = ((metrics.xp % 1000) / 1000) * 100

  return (
    <div className="space-y-6">
      {/* Header with Level and XP */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Trading Consistency Level {metrics.level}
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {metrics.xp.toLocaleString()} XP
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {metrics.level + 1}</span>
              <span>{metrics.xp % 1000} / 1000 XP</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
          >
            {timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : 'All Time'}
          </Button>
        ))}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  {metrics.currentStreak}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Best: {metrics.longestStreak}</p>
              </div>
            </div>
            {metrics.currentStreak >= 3 && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">🔥 Hot!</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* A+ Rate */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A+ Rate</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Target className="h-5 w-5 text-green-500" />
                  {metrics.aPlusRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-right">
                <Progress value={metrics.aPlusRate} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Discipline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Risk Discipline</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Shield className="h-5 w-5 text-blue-500" />
                  {metrics.riskDisciplineScore.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <Progress value={metrics.riskDisciplineScore} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Consistency */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Trades</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  {metrics.weeklyConsistency.toFixed(1)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target: 5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievement Badges ({totalBadges}/{badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card 
                key={badge.id} 
                className={`relative transition-all duration-300 ${
                  badge.unlocked 
                    ? `border-2 ${getRarityColor(badge.rarity)} shadow-md` 
                    : 'opacity-60 border-dashed'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      badge.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      
                      {!badge.unlocked && badge.progress !== undefined && badge.requirement && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{badge.progress.toFixed(0)} / {badge.requirement}</span>
                          </div>
                          <Progress 
                            value={(badge.progress / badge.requirement) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                      
                      {badge.unlocked && badge.unlockedDate && (
                        <p className="text-xs text-green-600">
                          Unlocked: {new Date(badge.unlockedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {badge.unlocked && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {badge.rarity}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivational Messages */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <h4 className="font-semibold">Keep Going!</h4>
              <p className="text-sm text-muted-foreground">
                {metrics.currentStreak === 0 
                  ? "Start your A+ streak today! Every expert was once a beginner."
                  : metrics.currentStreak < 3
                  ? `${metrics.currentStreak} in a row! You're building momentum.`
                  : metrics.currentStreak < 5
                  ? `${metrics.currentStreak} consecutive A+ setups! You're on fire! 🔥`
                  : `Incredible ${metrics.currentStreak}-trade streak! You're a consistency master! 👑`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 