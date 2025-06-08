"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Search
} from "lucide-react"

export interface TradeTag {
  id: string
  name: string
  color: string
  category: 'session' | 'pair' | 'setup' | 'outcome' | 'custom'
}

export interface EnhancedTradeLog {
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

export interface TradeFilters {
  search: string
  strategy: string
  verdict: string
  outcome: string
  pair: string
  session: string
  dayOfWeek: string
  tags: string[]
  dateFrom: string
  dateTo: string
  pnlMin: string
  pnlMax: string
}

interface TradeFiltersProps {
  trades: EnhancedTradeLog[]
  filters: TradeFilters
  onFiltersChange: (filters: TradeFilters) => void
  availableTags: TradeTag[]
  onCreateTag: (tag: Omit<TradeTag, 'id'>) => void
}

const defaultTags: TradeTag[] = [
  // Sessions
  { id: 'london', name: 'London Session', color: '#3B82F6', category: 'session' },
  { id: 'new-york', name: 'New York Session', color: '#10B981', category: 'session' },
  { id: 'tokyo', name: 'Tokyo Session', color: '#F59E0B', category: 'session' },
  { id: 'sydney', name: 'Sydney Session', color: '#8B5CF6', category: 'session' },
  
  // Pairs
  { id: 'eurusd', name: 'EUR/USD', color: '#EF4444', category: 'pair' },
  { id: 'gbpusd', name: 'GBP/USD', color: '#06B6D4', category: 'pair' },
  { id: 'usdjpy', name: 'USD/JPY', color: '#84CC16', category: 'pair' },
  { id: 'audusd', name: 'AUD/USD', color: '#F97316', category: 'pair' },
  { id: 'usdcad', name: 'USD/CAD', color: '#EC4899', category: 'pair' },
  
  // Setups
  { id: 'breakout', name: 'Breakout', color: '#14B8A6', category: 'setup' },
  { id: 'pullback', name: 'Pullback', color: '#A855F7', category: 'setup' },
  { id: 'reversal', name: 'Reversal', color: '#DC2626', category: 'setup' },
  { id: 'continuation', name: 'Continuation', color: '#059669', category: 'setup' },
]

const dayOfWeekOptions = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function TradeFilters({ 
  trades, 
  filters, 
  onFiltersChange, 
  availableTags, 
  onCreateTag 
}: TradeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique values from trades for filter options
  const uniqueValues = useMemo(() => {
    const strategies = [...new Set(trades.map(t => t.strategyName))]
    const pairs = [...new Set(trades.map(t => t.pair).filter(Boolean))]
    const sessions = [...new Set(trades.map(t => t.session).filter(Boolean))]
    
    return { strategies, pairs, sessions }
  }, [trades])

  const updateFilter = (key: keyof TradeFilters, value: string | string[]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      strategy: '',
      verdict: '',
      outcome: '',
      pair: '',
      session: '',
      dayOfWeek: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      pnlMin: '',
      pnlMax: '',
    })
  }

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId]
    updateFilter('tags', newTags)
  }

  const getTagById = (id: string) => {
    return availableTags.find(tag => tag.id === id) || defaultTags.find(tag => tag.id === id)
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Trade Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Notes</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search in notes..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Strategy */}
          <div className="space-y-2">
            <Label>Strategy</Label>
            <Select value={filters.strategy} onValueChange={(value) => updateFilter('strategy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All strategies</SelectItem>
                {uniqueValues.strategies.map(strategy => (
                  <SelectItem key={strategy} value={strategy}>{strategy}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verdict */}
          <div className="space-y-2">
            <Label>Verdict</Label>
            <Select value={filters.verdict} onValueChange={(value) => updateFilter('verdict', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All verdicts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All verdicts</SelectItem>
                <SelectItem value="A+">A+ Setup</SelectItem>
                <SelectItem value="Not A+">Not A+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Outcome */}
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select value={filters.outcome} onValueChange={(value) => updateFilter('outcome', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All outcomes</SelectItem>
                    <SelectItem value="win">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Win
                      </div>
                    </SelectItem>
                    <SelectItem value="loss">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Loss
                      </div>
                    </SelectItem>
                    <SelectItem value="breakeven">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-yellow-600" />
                        Breakeven
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pair */}
              <div className="space-y-2">
                <Label>Currency Pair</Label>
                <Select value={filters.pair} onValueChange={(value) => updateFilter('pair', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All pairs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All pairs</SelectItem>
                    {uniqueValues.pairs.map(pair => (
                      <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session */}
              <div className="space-y-2">
                <Label>Trading Session</Label>
                <Select value={filters.session} onValueChange={(value) => updateFilter('session', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sessions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sessions</SelectItem>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="tokyo">Tokyo</SelectItem>
                    <SelectItem value="sydney">Sydney</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Day of Week */}
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={filters.dayOfWeek} onValueChange={(value) => updateFilter('dayOfWeek', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All days</SelectItem>
                    {dayOfWeekOptions.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* P&L Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pnlMin">Min P&L ($)</Label>
                <Input
                  id="pnlMin"
                  type="number"
                  placeholder="0"
                  value={filters.pnlMin}
                  onChange={(e) => updateFilter('pnlMin', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pnlMax">Max P&L ($)</Label>
                <Input
                  id="pnlMax"
                  type="number"
                  placeholder="1000"
                  value={filters.pnlMax}
                  onChange={(e) => updateFilter('pnlMax', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Tags */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <Label>Tags</Label>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {[...defaultTags, ...availableTags].map(tag => (
              <Badge
                key={tag.id}
                variant={filters.tags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                style={{
                  backgroundColor: filters.tags.includes(tag.id) ? tag.color : undefined,
                  borderColor: tag.color,
                  color: filters.tags.includes(tag.id) ? 'white' : tag.color,
                }}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {filters.tags.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Selected tags:</span>
              <div className="flex gap-1">
                {filters.tags.map(tagId => {
                  const tag = getTagById(tagId)
                  return tag ? (
                    <Badge key={tagId} variant="secondary" className="text-xs">
                      {tag.name}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleTag(tagId)
                        }}
                      />
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for filtering trades
export function useTradeFilters(trades: EnhancedTradeLog[], filters: TradeFilters) {
  return useMemo(() => {
    return trades.filter(trade => {
      // Search in notes
      if (filters.search && !trade.notes.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Strategy filter
      if (filters.strategy && trade.strategyName !== filters.strategy) {
        return false
      }

      // Verdict filter
      if (filters.verdict && trade.verdict !== filters.verdict) {
        return false
      }

      // Outcome filter
      if (filters.outcome && trade.outcome !== filters.outcome) {
        return false
      }

      // Pair filter
      if (filters.pair && trade.pair !== filters.pair) {
        return false
      }

      // Session filter
      if (filters.session && trade.session !== filters.session) {
        return false
      }

      // Day of week filter
      if (filters.dayOfWeek) {
        const tradeDay = new Date(trade.timestamp).toLocaleDateString('en-US', { weekday: 'long' })
        if (tradeDay !== filters.dayOfWeek) {
          return false
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const tradeTags = trade.tags || []
        const hasMatchingTag = filters.tags.some(tagId => tradeTags.includes(tagId))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const tradeDate = new Date(trade.timestamp).toISOString().split('T')[0]
        if (filters.dateFrom && tradeDate < filters.dateFrom) {
          return false
        }
        if (filters.dateTo && tradeDate > filters.dateTo) {
          return false
        }
      }

      // P&L range filter
      if (trade.pnl !== undefined) {
        if (filters.pnlMin && trade.pnl < parseFloat(filters.pnlMin)) {
          return false
        }
        if (filters.pnlMax && trade.pnl > parseFloat(filters.pnlMax)) {
          return false
        }
      }

      return true
    })
  }, [trades, filters])
} 