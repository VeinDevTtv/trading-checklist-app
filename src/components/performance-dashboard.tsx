"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from "lucide-react"
import { PerformanceAnalytics, TradeResult, PerformanceMetrics } from "@/lib/performance-analytics"

interface TradeLog {
  id: number;
  strategyName: string;
  checkedIds: number[];
  score: number;
  possible: number;
  notes: string;
  verdict: string;
  timestamp: string;
  pnl?: number;
  riskAmount?: number;
  outcome?: 'win' | 'loss' | 'breakeven';
  riskRewardRatio?: number;
}

interface PerformanceDashboardProps {
  trades: TradeLog[]
  initialBalance?: number
}

export function PerformanceDashboard({ trades, initialBalance = 10000 }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  // Convert TradeLog to TradeResult format
  const tradeResults: TradeResult[] = useMemo(() => {
    return trades.map(trade => ({
      id: trade.id,
      timestamp: trade.timestamp,
      strategyName: trade.strategyName,
      verdict: trade.verdict,
      score: trade.score,
      possible: trade.possible,
      pnl: trade.pnl,
      riskAmount: trade.riskAmount,
      outcome: trade.outcome,
      riskRewardRatio: trade.riskRewardRatio
    }))
  }, [trades])

  const calculateMetrics = async () => {
    setLoading(true)
    try {
      const calculatedMetrics = PerformanceAnalytics.calculateMetrics(tradeResults, initialBalance)
      setMetrics(calculatedMetrics)
      PerformanceAnalytics.cacheMetrics(calculatedMetrics)
    } catch (error) {
      console.error('Failed to calculate metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Try to load cached metrics first
    const cached = PerformanceAnalytics.getCachedMetrics()
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
      setMetrics(cached.metrics)
    } else {
      calculateMetrics()
    }
  }, [tradeResults, initialBalance])

  const equityCurve = useMemo(() => {
    if (tradeResults.length === 0) return []
    return PerformanceAnalytics.generateEquityCurve(tradeResults, initialBalance)
  }, [tradeResults, initialBalance])

  const strategyPerformance = useMemo(() => {
    return PerformanceAnalytics.analyzeByStrategy(tradeResults)
  }, [tradeResults])

  const riskRewardDistribution = useMemo(() => {
    return PerformanceAnalytics.generateRiskRewardDistribution(tradeResults)
  }, [tradeResults])

  const outcomeDistribution = useMemo(() => {
    if (!metrics) return []
    return [
      { name: 'Wins', value: metrics.winningTrades, color: '#00C49F' },
      { name: 'Losses', value: metrics.losingTrades, color: '#FF8042' },
      { name: 'Breakeven', value: metrics.breakevenTrades, color: '#FFBB28' }
    ].filter(item => item.value > 0)
  }, [metrics])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Calculating performance metrics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || tradeResults.length === 0) {
    const tradesWithoutPnL = trades.filter(t => t.pnl === undefined).length;
    
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">
                {trades.length === 0 ? 'No Trading Data' : 'Missing Trade Results'}
              </p>
              <p className="text-muted-foreground">
                {trades.length === 0 
                  ? 'Start logging trades with P&L data to see performance analytics'
                  : `You have ${tradesWithoutPnL} trade${tradesWithoutPnL !== 1 ? 's' : ''} without P&L data. Edit your trades in the Trade History tab to add outcomes and P&L for performance tracking.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Analysis of {metrics.totalTrades} trades • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Button onClick={calculateMetrics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.totalPnL)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.winRate)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Factor</p>
                <p className="text-2xl font-bold">
                  {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatPercentage(metrics.maxDrawdownPercent)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="equity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Equity Curve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [formatCurrency(value), 'Balance']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Drawdown Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#FF8042" 
                      fill="#FF8042"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Trade Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {outcomeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk:Reward Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskRewardDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategyPerformance.map((strategy) => (
                  <div key={strategy.strategyName} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{strategy.strategyName}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{strategy.trades} trades</span>
                        <span>Win Rate: {formatPercentage(strategy.winRate)}</span>
                        <span>Avg Score: {strategy.averageScore.toFixed(1)}%</span>
                        <span>A+ Rate: {formatPercentage(strategy.aPlusRate)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${strategy.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(strategy.totalPnL)}
                      </div>
                      <Badge variant={strategy.totalPnL >= 0 ? "default" : "destructive"}>
                        {strategy.totalPnL >= 0 ? 'Profitable' : 'Loss'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Trading Activity</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Trades:</span>
                  <span>{metrics.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Winning Trades:</span>
                  <span className="text-green-600">{metrics.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Losing Trades:</span>
                  <span className="text-red-600">{metrics.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Breakeven Trades:</span>
                  <span>{metrics.breakevenTrades}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Performance Ratios</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Expectancy:</span>
                  <span>{formatCurrency(metrics.expectancy)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio:</span>
                  <span>{metrics.sharpeRatio.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calmar Ratio:</span>
                  <span>{metrics.calmarRatio.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg R:R:</span>
                  <span>{metrics.averageRiskReward.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Streaks & Extremes</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Max Consecutive Wins:</span>
                  <span className="text-green-600">{metrics.maxConsecutiveWins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Consecutive Losses:</span>
                  <span className="text-red-600">{metrics.maxConsecutiveLosses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Largest Win:</span>
                  <span className="text-green-600">{formatCurrency(metrics.largestWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Largest Loss:</span>
                  <span className="text-red-600">{formatCurrency(metrics.largestLoss)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 