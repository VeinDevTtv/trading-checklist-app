"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  BarChart3,
  Filter,
  X
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
)

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
  imageIds?: string[]
  tags?: string[]
  pair?: string
  session?: 'london' | 'new-york' | 'tokyo' | 'sydney'
  dayOfWeek?: string
  setup?: string
}

interface TagStats {
  tag: string
  totalTrades: number
  winRate: number
  totalPnL: number
  avgPnL: number
  avgScore: number
  bestTrade: number
  worstTrade: number
  equityCurve: { date: string; equity: number; trade: number }[]
}

interface TagHeatmapProps {
  trades: TradeLog[]
}

export function TagHeatmap({ trades }: TagHeatmapProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'winRate' | 'totalPnL' | 'totalTrades'>('winRate')

  // Extract all unique tags from trades
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    trades.forEach(trade => {
      if (trade.tags) {
        trade.tags.forEach(tag => tagSet.add(tag))
      }
      // Also include other categorical data as tags
      if (trade.pair) tagSet.add(trade.pair)
      if (trade.session) tagSet.add(trade.session)
      if (trade.setup) tagSet.add(trade.setup)
    })
    return Array.from(tagSet)
  }, [trades])

  // Calculate statistics for each tag
  const tagStats = useMemo(() => {
    const stats: TagStats[] = []

    allTags.forEach(tag => {
      const tagTrades = trades.filter(trade => {
        return (
          trade.tags?.includes(tag) ||
          trade.pair === tag ||
          trade.session === tag ||
          trade.setup === tag
        )
      })

      const tradesWithPnL = tagTrades.filter(t => t.pnl !== undefined)
      const wins = tradesWithPnL.filter(t => t.outcome === 'win')
      const totalPnL = tradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0)
      const avgScore = tagTrades.reduce((sum, t) => sum + (t.score / t.possible), 0) / tagTrades.length

      // Calculate equity curve
      let runningEquity = 0
      const equityCurve = tradesWithPnL
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((trade, index) => {
          runningEquity += trade.pnl || 0
          return {
            date: new Date(trade.timestamp).toLocaleDateString(),
            equity: runningEquity,
            trade: index + 1
          }
        })

      if (tagTrades.length > 0) {
        stats.push({
          tag,
          totalTrades: tagTrades.length,
          winRate: tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0,
          totalPnL,
          avgPnL: tradesWithPnL.length > 0 ? totalPnL / tradesWithPnL.length : 0,
          avgScore: avgScore * 100,
          bestTrade: Math.max(...tradesWithPnL.map(t => t.pnl || 0)),
          worstTrade: Math.min(...tradesWithPnL.map(t => t.pnl || 0)),
          equityCurve
        })
      }
    })

    // Sort by selected criteria
    return stats.sort((a, b) => {
      switch (sortBy) {
        case 'winRate':
          return b.winRate - a.winRate
        case 'totalPnL':
          return b.totalPnL - a.totalPnL
        case 'totalTrades':
          return b.totalTrades - a.totalTrades
        default:
          return 0
      }
    })
  }, [allTags, trades, sortBy])

  const selectedTagStats = selectedTag ? tagStats.find(s => s.tag === selectedTag) : null

  const getTagColor = (winRate: number, totalPnL: number) => {
    if (winRate >= 70 && totalPnL > 0) return 'bg-green-500'
    if (winRate >= 50 && totalPnL >= 0) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getTagIntensity = (value: number, max: number) => {
    const intensity = Math.max(0.2, value / max)
    return `opacity-${Math.round(intensity * 100)}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tag-Based Performance Heatmap
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button
                variant={sortBy === 'winRate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('winRate')}
              >
                Win Rate
              </Button>
              <Button
                variant={sortBy === 'totalPnL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('totalPnL')}
              >
                Total P&L
              </Button>
              <Button
                variant={sortBy === 'totalTrades' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('totalTrades')}
              >
                Trade Count
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tagStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tag data available</p>
              <p className="text-sm">Add tags to your trades to see performance breakdowns</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {tagStats.map((stat) => (
                <div
                  key={stat.tag}
                  className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                    selectedTag === stat.tag ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTag(selectedTag === stat.tag ? null : stat.tag)}
                >
                  <div className={`absolute inset-0 rounded-lg ${getTagColor(stat.winRate, stat.totalPnL)} ${getTagIntensity(stat.winRate, 100)}`} />
                  <div className="relative z-10">
                    <div className="font-medium text-sm mb-1 truncate" title={stat.tag}>
                      {stat.tag}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Win Rate:</span>
                        <span className="font-medium">{stat.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P&L:</span>
                        <span className={`font-medium ${stat.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${stat.totalPnL >= 0 ? '+' : ''}{stat.totalPnL.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trades:</span>
                        <span className="font-medium">{stat.totalTrades}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Tag Details */}
      {selectedTagStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Performance Analysis: {selectedTagStats.tag}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Win Rate</span>
                </div>
                <div className="text-2xl font-bold">{selectedTagStats.winRate.toFixed(1)}%</div>
                <Progress value={selectedTagStats.winRate} className="mt-2" />
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total P&L</span>
                </div>
                <div className={`text-2xl font-bold ${selectedTagStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${selectedTagStats.totalPnL >= 0 ? '+' : ''}{selectedTagStats.totalPnL.toFixed(2)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Avg P&L</span>
                </div>
                <div className={`text-2xl font-bold ${selectedTagStats.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${selectedTagStats.avgPnL >= 0 ? '+' : ''}{selectedTagStats.avgPnL.toFixed(2)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Avg Score</span>
                </div>
                <div className="text-2xl font-bold">{selectedTagStats.avgScore.toFixed(1)}%</div>
                <Progress value={selectedTagStats.avgScore} className="mt-2" />
              </Card>
            </div>

            {/* Best/Worst Trades */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Best Trade</span>
                </div>
                <div className="text-xl font-bold text-green-600">
                  +${selectedTagStats.bestTrade.toFixed(2)}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Worst Trade</span>
                </div>
                <div className="text-xl font-bold text-red-600">
                  ${selectedTagStats.worstTrade.toFixed(2)}
                </div>
              </Card>
            </div>

            {/* Equity Curve */}
            {selectedTagStats.equityCurve.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">Equity Curve</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedTagStats.equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="trade" 
                        label={{ value: 'Trade Number', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        label={{ value: 'Cumulative P&L ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                        labelFormatter={(label) => `Trade #${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="equity" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Trade Distribution */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Trade Distribution</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {trades.filter(t => 
                      (t.tags?.includes(selectedTagStats.tag) || 
                       t.pair === selectedTagStats.tag || 
                       t.session === selectedTagStats.tag || 
                       t.setup === selectedTagStats.tag) && 
                      t.outcome === 'win'
                    ).length}
                  </div>
                  <div className="text-sm text-green-600">Wins</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {trades.filter(t => 
                      (t.tags?.includes(selectedTagStats.tag) || 
                       t.pair === selectedTagStats.tag || 
                       t.session === selectedTagStats.tag || 
                       t.setup === selectedTagStats.tag) && 
                      t.outcome === 'loss'
                    ).length}
                  </div>
                  <div className="text-sm text-red-600">Losses</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {trades.filter(t => 
                      (t.tags?.includes(selectedTagStats.tag) || 
                       t.pair === selectedTagStats.tag || 
                       t.session === selectedTagStats.tag || 
                       t.setup === selectedTagStats.tag) && 
                      t.outcome === 'breakeven'
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Breakeven</div>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 