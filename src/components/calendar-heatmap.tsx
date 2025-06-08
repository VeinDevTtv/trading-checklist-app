"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target,
  BarChart3,
  Star
} from "lucide-react"

interface TradeDay {
  date: string
  trades: Array<{
    id: number
    verdict: string
    pnl?: number
    strategyName: string
    score: number
    possible: number
  }>
  totalPnl: number
  aPlusCount: number
  totalTrades: number
  winRate: number
  avgScore: number
}

interface CalendarHeatmapProps {
  trades: Array<{
    id: number
    timestamp: string
    verdict: string
    pnl?: number
    strategyName: string
    score: number
    possible: number
    outcome?: 'win' | 'loss' | 'breakeven'
  }>
  year?: number
  month?: number
}

export function CalendarHeatmap({ trades, year, month }: CalendarHeatmapProps) {
  const currentDate = new Date()
  const targetYear = year || currentDate.getFullYear()
  const targetMonth = month !== undefined ? month : currentDate.getMonth()

  // Process trades into daily data
  const dailyData = useMemo(() => {
    const days: { [key: string]: TradeDay } = {}

    trades.forEach(trade => {
      const tradeDate = new Date(trade.timestamp)
      const dateKey = tradeDate.toISOString().split('T')[0]

      if (!days[dateKey]) {
        days[dateKey] = {
          date: dateKey,
          trades: [],
          totalPnl: 0,
          aPlusCount: 0,
          totalTrades: 0,
          winRate: 0,
          avgScore: 0,
        }
      }

      days[dateKey].trades.push(trade)
      days[dateKey].totalTrades++
      days[dateKey].totalPnl += trade.pnl || 0
      
      if (trade.verdict === 'A+') {
        days[dateKey].aPlusCount++
      }
    })

    // Calculate derived metrics
    Object.values(days).forEach(day => {
      const wins = day.trades.filter(t => t.outcome === 'win').length
      day.winRate = day.totalTrades > 0 ? (wins / day.totalTrades) * 100 : 0
      day.avgScore = day.totalTrades > 0 
        ? day.trades.reduce((sum, t) => sum + (t.score / t.possible * 100), 0) / day.totalTrades 
        : 0
    })

    return days
  }, [trades])

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(targetYear, targetMonth, 1)
    const lastDay = new Date(targetYear, targetMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days = []
    const current = new Date(startDate)

    while (current <= lastDay || current.getDay() !== 0) {
      const dateKey = current.toISOString().split('T')[0]
      const dayData = dailyData[dateKey]
      const isCurrentMonth = current.getMonth() === targetMonth
      
      days.push({
        date: new Date(current),
        dateKey,
        dayData,
        isCurrentMonth,
        isToday: dateKey === new Date().toISOString().split('T')[0],
      })

      current.setDate(current.getDate() + 1)
      
      // Break after 6 weeks to avoid infinite loop
      if (days.length > 42) break
    }

    return days
  }, [targetYear, targetMonth, dailyData])

  // Get heat intensity based on performance
  const getHeatIntensity = (dayData: TradeDay | undefined) => {
    if (!dayData || dayData.totalTrades === 0) return 'none'
    
    const aPlusRatio = dayData.aPlusCount / dayData.totalTrades
    const pnlPositive = dayData.totalPnl > 0
    
    if (aPlusRatio >= 0.8 && pnlPositive) return 'excellent'
    if (aPlusRatio >= 0.6 && pnlPositive) return 'good'
    if (aPlusRatio >= 0.4 || pnlPositive) return 'average'
    return 'poor'
  }

  const getHeatColor = (intensity: string) => {
    switch (intensity) {
      case 'excellent': return 'bg-green-500 text-white'
      case 'good': return 'bg-green-300 text-green-900'
      case 'average': return 'bg-yellow-300 text-yellow-900'
      case 'poor': return 'bg-red-300 text-red-900'
      default: return 'bg-gray-100 text-gray-400'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthTrades = Object.values(dailyData).filter(day => {
      const dayDate = new Date(day.date)
      return dayDate.getMonth() === targetMonth && dayDate.getFullYear() === targetYear
    })

    const totalTrades = monthTrades.reduce((sum, day) => sum + day.totalTrades, 0)
    const totalAPlusCount = monthTrades.reduce((sum, day) => sum + day.aPlusCount, 0)
    const totalPnl = monthTrades.reduce((sum, day) => sum + day.totalPnl, 0)
    const tradingDays = monthTrades.filter(day => day.totalTrades > 0).length

    return {
      totalTrades,
      aPlusRatio: totalTrades > 0 ? (totalAPlusCount / totalTrades) * 100 : 0,
      totalPnl,
      tradingDays,
      avgTradesPerDay: tradingDays > 0 ? totalTrades / tradingDays : 0,
    }
  }, [dailyData, targetMonth, targetYear])

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Trading Calendar - {monthNames[targetMonth]} {targetYear}
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {monthlyStats.aPlusRatio.toFixed(1)}% A+
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {monthlyStats.tradingDays} days
              </Badge>
              {monthlyStats.totalPnl !== 0 && (
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${
                    monthlyStats.totalPnl > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {monthlyStats.totalPnl > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  ${Math.abs(monthlyStats.totalPnl).toFixed(2)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map(({ date, dateKey, dayData, isCurrentMonth, isToday }) => {
                const intensity = getHeatIntensity(dayData)
                const heatColor = getHeatColor(intensity)
                
                return (
                  <Tooltip key={dateKey}>
                    <TooltipTrigger asChild>
                      <div
                        className={`
                          relative aspect-square p-1 rounded-md cursor-pointer transition-all hover:scale-105
                          ${heatColor}
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                          ${isToday ? 'ring-2 ring-blue-500' : ''}
                        `}
                      >
                        <div className="text-xs font-medium text-center">
                          {date.getDate()}
                        </div>
                        
                        {dayData && dayData.totalTrades > 0 && (
                          <div className="absolute top-0 right-0 flex gap-0.5">
                            {dayData.aPlusCount > 0 && (
                              <Star className="h-2 w-2 fill-current" />
                            )}
                          </div>
                        )}
                        
                        {dayData && dayData.totalTrades > 1 && (
                          <div className="absolute bottom-0 left-0 text-[8px] font-bold">
                            {dayData.totalTrades}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-semibold">
                          {date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        {dayData && dayData.totalTrades > 0 ? (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Trades:</span>
                              <span className="font-medium">{dayData.totalTrades}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>A+ Setups:</span>
                              <span className="font-medium">
                                {dayData.aPlusCount} ({((dayData.aPlusCount / dayData.totalTrades) * 100).toFixed(0)}%)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Score:</span>
                              <span className="font-medium">{dayData.avgScore.toFixed(1)}%</span>
                            </div>
                            {dayData.totalPnl !== 0 && (
                              <div className="flex justify-between">
                                <span>P&L:</span>
                                <span className={`font-medium ${
                                  dayData.totalPnl > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  ${dayData.totalPnl > 0 ? '+' : ''}${dayData.totalPnl.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {dayData.winRate > 0 && (
                              <div className="flex justify-between">
                                <span>Win Rate:</span>
                                <span className="font-medium">{dayData.winRate.toFixed(0)}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No trades</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Performance:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100"></div>
                  <span className="text-xs">No trades</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-300"></div>
                  <span className="text-xs">Poor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-300"></div>
                  <span className="text-xs">Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-300"></div>
                  <span className="text-xs">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-xs">Excellent</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-3 w-3" />
                <span className="text-xs">A+ Setup</span>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.totalTrades}</div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.tradingDays}</div>
                <div className="text-sm text-muted-foreground">Trading Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.aPlusRatio.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">A+ Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{monthlyStats.avgTradesPerDay.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Avg/Day</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
} 