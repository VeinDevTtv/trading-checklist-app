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
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Brain,
  Eye,
  Heart,
  Rocket,
  Mountain,
  Sunrise,
  Moon,
  Coffee,
  Briefcase,
  Medal,
  Swords,
  Activity,
  Compass,
  Anchor,
  Lightbulb,
  Crosshair,
  Timer,
  Gauge
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
  pair?: string
  session?: 'london' | 'new-york' | 'tokyo' | 'sydney'
  setup?: string
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
    
    // Time-based calculations
    const now = new Date()
    const today = now.toDateString()
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const todayTrades = trades.filter(t => new Date(t.timestamp).toDateString() === today)
    const weekTrades = trades.filter(t => new Date(t.timestamp) >= thisWeek)
    const monthTrades = trades.filter(t => new Date(t.timestamp) >= thisMonth)
    
    // Strategy diversity
    const uniqueStrategies = new Set(trades.map(t => t.strategyName)).size
    
    // Risk-reward calculations
    const highRRTrades = trades.filter(t => t.riskRewardRatio && t.riskRewardRatio >= 2).length
    const perfectRRTrades = trades.filter(t => t.riskRewardRatio && t.riskRewardRatio >= 3).length
    
    // Session analysis
    const londonTrades = trades.filter(t => t.session === 'london').length
    const newYorkTrades = trades.filter(t => t.session === 'new-york').length
    const tokyoTrades = trades.filter(t => t.session === 'tokyo').length
    const sydneyTrades = trades.filter(t => t.session === 'sydney').length
    
    // Pair diversity
    const uniquePairs = new Set(trades.filter(t => t.pair).map(t => t.pair)).size
    
    // Consecutive wins/losses
    let maxWinStreak = 0
    let currentWinStreak = 0
    let maxLossStreak = 0
    let currentLossStreak = 0
    
    trades.slice().reverse().forEach(trade => {
      if (trade.outcome === 'win') {
        currentWinStreak++
        currentLossStreak = 0
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
      } else if (trade.outcome === 'loss') {
        currentLossStreak++
        currentWinStreak = 0
        maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
      } else {
        currentWinStreak = 0
        currentLossStreak = 0
      }
    })

    return [
      // Beginner Achievements
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
        id: 'first-trade',
        name: 'First Steps',
        description: 'Complete your first trade analysis',
        icon: <Compass className="h-4 w-4" />,
        rarity: 'common',
        unlocked: totalTrades >= 1,
        unlockedDate: totalTrades >= 1 ? trades[trades.length - 1]?.timestamp : undefined
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Complete 5 trade analyses',
        icon: <Sunrise className="h-4 w-4" />,
        rarity: 'common',
        unlocked: totalTrades >= 5,
        progress: Math.min(totalTrades, 5),
        requirement: 5
      },

      // Streak Achievements
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Achieve 3 consecutive A+ setups',
        icon: <Flame className="h-4 w-4" />,
        rarity: 'common',
        unlocked: metrics.longestStreak >= 3,
        progress: Math.min(metrics.longestStreak, 3),
        requirement: 3
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
        id: 'streak-legend',
        name: 'Streak Legend',
        description: 'Achieve 10 consecutive A+ setups',
        icon: <Flame className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: metrics.longestStreak >= 10,
        progress: Math.min(metrics.longestStreak, 10),
        requirement: 10
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Achieve 15 consecutive A+ setups',
        icon: <Rocket className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: metrics.longestStreak >= 15,
        progress: Math.min(metrics.longestStreak, 15),
        requirement: 15
      },

      // Consistency Achievements
      {
        id: 'consistency-apprentice',
        name: 'Consistency Apprentice',
        description: 'Maintain 60% A+ rate over 10 trades',
        icon: <Target className="h-4 w-4" />,
        rarity: 'common',
        unlocked: totalTrades >= 10 && metrics.aPlusRate >= 60,
        progress: totalTrades >= 10 ? Math.min(metrics.aPlusRate, 60) : 0,
        requirement: 60
      },
      {
        id: 'consistency-expert',
        name: 'Consistency Expert',
        description: 'Maintain 70% A+ rate over 15 trades',
        icon: <Eye className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: totalTrades >= 15 && metrics.aPlusRate >= 70,
        progress: totalTrades >= 15 ? Math.min(metrics.aPlusRate, 70) : 0,
        requirement: 70
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
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Maintain 90% A+ rate over 25 trades',
        icon: <Gem className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: totalTrades >= 25 && metrics.aPlusRate >= 90,
        progress: totalTrades >= 25 ? Math.min(metrics.aPlusRate, 90) : 0,
        requirement: 90
      },

      // Volume Achievements
      {
        id: 'active-trader',
        name: 'Active Trader',
        description: 'Complete 25 total trades',
        icon: <Activity className="h-4 w-4" />,
        rarity: 'common',
        unlocked: totalTrades >= 25,
        progress: Math.min(totalTrades, 25),
        requirement: 25
      },
      {
        id: 'experienced-trader',
        name: 'Experienced Trader',
        description: 'Complete 50 total trades',
        icon: <Briefcase className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: totalTrades >= 50,
        progress: Math.min(totalTrades, 50),
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
      },
      {
        id: 'trading-veteran',
        name: 'Trading Veteran',
        description: 'Complete 250 total trades',
        icon: <Medal className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: totalTrades >= 250,
        progress: Math.min(totalTrades, 250),
        requirement: 250
      },

      // Risk Management Achievements
      {
        id: 'risk-aware',
        name: 'Risk Aware',
        description: 'Achieve 80% risk discipline score',
        icon: <Shield className="h-4 w-4" />,
        rarity: 'common',
        unlocked: metrics.riskDisciplineScore >= 80,
        progress: Math.min(metrics.riskDisciplineScore, 80),
        requirement: 80
      },
      {
        id: 'risk-guardian',
        name: 'Risk Guardian',
        description: 'Achieve 90% risk discipline score',
        icon: <Shield className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: metrics.riskDisciplineScore >= 90,
        progress: Math.min(metrics.riskDisciplineScore, 90),
        requirement: 90
      },
      {
        id: 'risk-master',
        name: 'Risk Master',
        description: 'Perfect risk discipline score (95%+)',
        icon: <Anchor className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: metrics.riskDisciplineScore >= 95,
        progress: Math.min(metrics.riskDisciplineScore, 95),
        requirement: 95
      },

      // Profitability Achievements
      {
        id: 'first-win',
        name: 'First Victory',
        description: 'Win your first trade',
        icon: <Trophy className="h-4 w-4" />,
        rarity: 'common',
        unlocked: winningTrades >= 1,
        unlockedDate: winningTrades >= 1 ? trades.find(t => t.outcome === 'win')?.timestamp : undefined
      },
      {
        id: 'profit-maker',
        name: 'Profit Maker',
        description: 'Win 10 trades',
        icon: <DollarSign className="h-4 w-4" />,
        rarity: 'common',
        unlocked: winningTrades >= 10,
        progress: Math.min(winningTrades, 10),
        requirement: 10
      },
      {
        id: 'profit-expert',
        name: 'Profit Expert',
        description: 'Win 25 trades',
        icon: <TrendingUp className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: winningTrades >= 25,
        progress: Math.min(winningTrades, 25),
        requirement: 25
      },
      {
        id: 'profit-legend',
        name: 'Profit Legend',
        description: 'Win 50 trades',
        icon: <Trophy className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: winningTrades >= 50,
        progress: Math.min(winningTrades, 50),
        requirement: 50
      },
      {
        id: 'profit-god',
        name: 'Profit God',
        description: 'Win 100 trades',
        icon: <Crown className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: winningTrades >= 100,
        progress: Math.min(winningTrades, 100),
        requirement: 100
      },

      // Win Streak Achievements
      {
        id: 'winning-streak',
        name: 'Winning Streak',
        description: 'Win 3 trades in a row',
        icon: <Zap className="h-4 w-4" />,
        rarity: 'common',
        unlocked: maxWinStreak >= 3,
        progress: Math.min(maxWinStreak, 3),
        requirement: 3
      },
      {
        id: 'hot-streak',
        name: 'Hot Streak',
        description: 'Win 5 trades in a row',
        icon: <Flame className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: maxWinStreak >= 5,
        progress: Math.min(maxWinStreak, 5),
        requirement: 5
      },
      {
        id: 'unstoppable-force',
        name: 'Unstoppable Force',
        description: 'Win 8 trades in a row',
        icon: <Rocket className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: maxWinStreak >= 8,
        progress: Math.min(maxWinStreak, 8),
        requirement: 8
      },

      // Risk-Reward Achievements
      {
        id: 'good-rr',
        name: 'Good Risk-Reward',
        description: 'Complete 10 trades with 2:1+ RR',
        icon: <Gauge className="h-4 w-4" />,
        rarity: 'common',
        unlocked: highRRTrades >= 10,
        progress: Math.min(highRRTrades, 10),
        requirement: 10
      },
      {
        id: 'excellent-rr',
        name: 'Excellent Risk-Reward',
        description: 'Complete 5 trades with 3:1+ RR',
        icon: <Mountain className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: perfectRRTrades >= 5,
        progress: Math.min(perfectRRTrades, 5),
        requirement: 5
      },

      // Time-based Achievements
      {
        id: 'daily-grind',
        name: 'Daily Grind',
        description: 'Complete 3 trades in one day',
        icon: <Clock className="h-4 w-4" />,
        rarity: 'common',
        unlocked: todayTrades.length >= 3,
        progress: Math.min(todayTrades.length, 3),
        requirement: 3
      },
      {
        id: 'weekly-warrior',
        name: 'Weekly Warrior',
        description: 'Complete 10 trades in one week',
        icon: <Calendar className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: weekTrades.length >= 10,
        progress: Math.min(weekTrades.length, 10),
        requirement: 10
      },
      {
        id: 'monthly-master',
        name: 'Monthly Master',
        description: 'Complete 25 trades in one month',
        icon: <Calendar className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: monthTrades.length >= 25,
        progress: Math.min(monthTrades.length, 25),
        requirement: 25
      },

      // Session Achievements
      {
        id: 'london-lover',
        name: 'London Lover',
        description: 'Complete 20 London session trades',
        icon: <Coffee className="h-4 w-4" />,
        rarity: 'common',
        unlocked: londonTrades >= 20,
        progress: Math.min(londonTrades, 20),
        requirement: 20
      },
      {
        id: 'new-york-ninja',
        name: 'New York Ninja',
        description: 'Complete 20 New York session trades',
        icon: <Briefcase className="h-4 w-4" />,
        rarity: 'common',
        unlocked: newYorkTrades >= 20,
        progress: Math.min(newYorkTrades, 20),
        requirement: 20
      },
      {
        id: 'tokyo-trader',
        name: 'Tokyo Trader',
        description: 'Complete 20 Tokyo session trades',
        icon: <Sunrise className="h-4 w-4" />,
        rarity: 'common',
        unlocked: tokyoTrades >= 20,
        progress: Math.min(tokyoTrades, 20),
        requirement: 20
      },
      {
        id: 'sydney-specialist',
        name: 'Sydney Specialist',
        description: 'Complete 20 Sydney session trades',
        icon: <Moon className="h-4 w-4" />,
        rarity: 'common',
        unlocked: sydneyTrades >= 20,
        progress: Math.min(sydneyTrades, 20),
        requirement: 20
      },
      {
        id: 'global-trader',
        name: 'Global Trader',
        description: 'Trade in all 4 major sessions',
        icon: <Compass className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: londonTrades > 0 && newYorkTrades > 0 && tokyoTrades > 0 && sydneyTrades > 0,
      },

      // Strategy Achievements
      {
        id: 'strategy-explorer',
        name: 'Strategy Explorer',
        description: 'Use 3 different strategies',
        icon: <Brain className="h-4 w-4" />,
        rarity: 'common',
        unlocked: uniqueStrategies >= 3,
        progress: Math.min(uniqueStrategies, 3),
        requirement: 3
      },
      {
        id: 'strategy-master',
        name: 'Strategy Master',
        description: 'Use 5 different strategies',
        icon: <Lightbulb className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: uniqueStrategies >= 5,
        progress: Math.min(uniqueStrategies, 5),
        requirement: 5
      },

      // Pair Diversity Achievements
      {
        id: 'pair-explorer',
        name: 'Pair Explorer',
        description: 'Trade 5 different currency pairs',
        icon: <Compass className="h-4 w-4" />,
        rarity: 'common',
        unlocked: uniquePairs >= 5,
        progress: Math.min(uniquePairs, 5),
        requirement: 5
      },
      {
        id: 'currency-connoisseur',
        name: 'Currency Connoisseur',
        description: 'Trade 10 different currency pairs',
        icon: <Eye className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: uniquePairs >= 10,
        progress: Math.min(uniquePairs, 10),
        requirement: 10
      },

      // Resilience Achievements
      {
        id: 'comeback-kid',
        name: 'Comeback Kid',
        description: 'Win a trade after 3 consecutive losses',
        icon: <Heart className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: maxLossStreak >= 3 && winningTrades > 0,
      },
      {
        id: 'phoenix-rising',
        name: 'Phoenix Rising',
        description: 'Win a trade after 5 consecutive losses',
        icon: <Rocket className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: maxLossStreak >= 5 && winningTrades > 0,
      },

      // Special Achievements
      {
        id: 'night-owl',
        name: 'Night Owl',
        description: 'Complete a trade between 10PM-6AM',
        icon: <Moon className="h-4 w-4" />,
        rarity: 'common',
        unlocked: trades.some(t => {
          const hour = new Date(t.timestamp).getHours()
          return hour >= 22 || hour <= 6
        }),
      },
      {
        id: 'early-riser',
        name: 'Early Riser',
        description: 'Complete a trade between 5AM-8AM',
        icon: <Sunrise className="h-4 w-4" />,
        rarity: 'common',
        unlocked: trades.some(t => {
          const hour = new Date(t.timestamp).getHours()
          return hour >= 5 && hour <= 8
        }),
      },
      {
        id: 'weekend-warrior',
        name: 'Weekend Warrior',
        description: 'Complete analysis on weekend',
        icon: <Swords className="h-4 w-4" />,
        rarity: 'rare',
        unlocked: trades.some(t => {
          const day = new Date(t.timestamp).getDay()
          return day === 0 || day === 6 // Sunday or Saturday
        }),
      },
      {
        id: 'precision-trader',
        name: 'Precision Trader',
        description: 'Complete 10 trades with perfect 100% scores',
        icon: <Crosshair className="h-4 w-4" />,
        rarity: 'epic',
        unlocked: trades.filter(t => t.score === t.possible && t.possible > 0).length >= 10,
        progress: Math.min(trades.filter(t => t.score === t.possible && t.possible > 0).length, 10),
        requirement: 10
      },
      {
        id: 'speed-demon',
        name: 'Speed Demon',
        description: 'Complete 5 trades in one hour',
        icon: <Timer className="h-4 w-4" />,
        rarity: 'legendary',
        unlocked: (() => {
          // Check if any hour had 5+ trades
          const hourGroups = new Map()
          trades.forEach(t => {
            const hourKey = new Date(t.timestamp).toISOString().slice(0, 13) // YYYY-MM-DDTHH
            hourGroups.set(hourKey, (hourGroups.get(hourKey) || 0) + 1)
          })
          return Math.max(...Array.from(hourGroups.values()), 0) >= 5
        })(),
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