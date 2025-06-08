// Performance Analytics Web Worker
// This worker handles heavy KPI calculations off the main thread

class PerformanceWorker {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  // Main message handler
  handleMessage(event) {
    const { id, type, data } = event.data

    try {
      let result
      
      switch (type) {
        case 'calculateKPIs':
          result = this.calculateKPIs(data.trades)
          break
        case 'generateEquityCurve':
          result = this.generateEquityCurve(data.trades)
          break
        case 'analyzeDrawdown':
          result = this.analyzeDrawdown(data.trades)
          break
        case 'calculateStrategyComparison':
          result = this.calculateStrategyComparison(data.trades)
          break
        case 'generateCalendarData':
          result = this.generateCalendarData(data.trades, data.year, data.month)
          break
        case 'calculateRiskMetrics':
          result = this.calculateRiskMetrics(data.trades)
          break
        default:
          throw new Error(`Unknown calculation type: ${type}`)
      }

      this.postMessage({
        id,
        type: 'success',
        result
      })
    } catch (error) {
      this.postMessage({
        id,
        type: 'error',
        error: error.message
      })
    }
  }

  // Calculate comprehensive KPIs
  calculateKPIs(trades) {
    const cacheKey = `kpis-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const tradesWithPnL = trades.filter(t => t.pnl !== undefined && t.pnl !== null)
    
    if (tradesWithPnL.length === 0) {
      return {
        totalTrades: trades.length,
        profitableTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        maxDrawdownPercent: 0,
        recoveryFactor: 0,
        expectancy: 0,
        aPlusRate: 0,
        avgScore: 0
      }
    }

    const wins = tradesWithPnL.filter(t => t.pnl > 0)
    const losses = tradesWithPnL.filter(t => t.pnl < 0)
    const aPlusCount = trades.filter(t => t.verdict === 'A+').length

    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + t.pnl, 0)
    const totalWins = wins.reduce((sum, t) => sum + t.pnl, 0)
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0))
    
    const avgWin = wins.length > 0 ? totalWins / wins.length : 0
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
    
    // Calculate Sharpe Ratio (simplified)
    const returns = tradesWithPnL.map(t => t.pnl)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // Annualized

    // Calculate drawdown
    const { maxDrawdown, maxDrawdownPercent } = this.calculateDrawdownMetrics(tradesWithPnL)
    
    // Recovery factor
    const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : 0
    
    // Expectancy
    const winRate = wins.length / tradesWithPnL.length
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss)
    
    // A+ rate and average score
    const aPlusRate = trades.length > 0 ? (aPlusCount / trades.length) * 100 : 0
    const avgScore = trades.length > 0 
      ? trades.reduce((sum, t) => sum + (t.score / t.possible * 100), 0) / trades.length 
      : 0

    const result = {
      totalTrades: trades.length,
      profitableTrades: wins.length,
      winRate: winRate * 100,
      totalPnL,
      avgWin,
      avgLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      maxDrawdownPercent,
      recoveryFactor,
      expectancy,
      aPlusRate,
      avgScore
    }

    this.setCache(cacheKey, result)
    return result
  }

  // Generate equity curve data
  generateEquityCurve(trades) {
    const cacheKey = `equity-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const tradesWithPnL = trades
      .filter(t => t.pnl !== undefined && t.pnl !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    let runningBalance = 0
    const equityCurve = tradesWithPnL.map(trade => {
      runningBalance += trade.pnl
      return {
        date: trade.timestamp,
        balance: runningBalance,
        pnl: trade.pnl,
        verdict: trade.verdict,
        strategyName: trade.strategyName
      }
    })

    const result = { equityCurve, finalBalance: runningBalance }
    this.setCache(cacheKey, result)
    return result
  }

  // Analyze drawdown periods
  analyzeDrawdown(trades) {
    const cacheKey = `drawdown-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const tradesWithPnL = trades
      .filter(t => t.pnl !== undefined && t.pnl !== null)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    let runningBalance = 0
    let peak = 0
    let maxDrawdown = 0
    let currentDrawdown = 0
    let drawdownStart = null
    let maxDrawdownPeriod = null

    const drawdownData = []
    const drawdownPeriods = []

    tradesWithPnL.forEach((trade, index) => {
      runningBalance += trade.pnl
      
      if (runningBalance > peak) {
        // New peak, end any current drawdown
        if (currentDrawdown > 0) {
          drawdownPeriods.push({
            start: drawdownStart,
            end: trade.timestamp,
            drawdown: currentDrawdown,
            duration: index - drawdownPeriods.length
          })
        }
        peak = runningBalance
        currentDrawdown = 0
        drawdownStart = null
      } else {
        // In drawdown
        const drawdown = peak - runningBalance
        if (drawdown > currentDrawdown) {
          if (currentDrawdown === 0) {
            drawdownStart = trade.timestamp
          }
          currentDrawdown = drawdown
          
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown
            maxDrawdownPeriod = {
              start: drawdownStart,
              end: trade.timestamp,
              drawdown: maxDrawdown
            }
          }
        }
      }

      drawdownData.push({
        date: trade.timestamp,
        balance: runningBalance,
        peak,
        drawdown: peak - runningBalance,
        drawdownPercent: peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0
      })
    })

    const result = {
      drawdownData,
      drawdownPeriods,
      maxDrawdown,
      maxDrawdownPeriod,
      avgDrawdown: drawdownPeriods.length > 0 
        ? drawdownPeriods.reduce((sum, p) => sum + p.drawdown, 0) / drawdownPeriods.length 
        : 0
    }

    this.setCache(cacheKey, result)
    return result
  }

  // Calculate strategy comparison metrics
  calculateStrategyComparison(trades) {
    const cacheKey = `strategy-comparison-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const strategies = {}
    
    trades.forEach(trade => {
      const strategyName = trade.strategyName
      if (!strategies[strategyName]) {
        strategies[strategyName] = {
          name: strategyName,
          trades: [],
          totalTrades: 0,
          aPlusCount: 0,
          totalPnL: 0,
          wins: 0,
          losses: 0
        }
      }
      
      strategies[strategyName].trades.push(trade)
      strategies[strategyName].totalTrades++
      
      if (trade.verdict === 'A+') {
        strategies[strategyName].aPlusCount++
      }
      
      if (trade.pnl !== undefined && trade.pnl !== null) {
        strategies[strategyName].totalPnL += trade.pnl
        if (trade.pnl > 0) {
          strategies[strategyName].wins++
        } else if (trade.pnl < 0) {
          strategies[strategyName].losses++
        }
      }
    })

    // Calculate derived metrics for each strategy
    const strategyMetrics = Object.values(strategies).map(strategy => {
      const tradesWithPnL = strategy.trades.filter(t => t.pnl !== undefined && t.pnl !== null)
      const winRate = tradesWithPnL.length > 0 ? (strategy.wins / tradesWithPnL.length) * 100 : 0
      const aPlusRate = strategy.totalTrades > 0 ? (strategy.aPlusCount / strategy.totalTrades) * 100 : 0
      const avgScore = strategy.totalTrades > 0 
        ? strategy.trades.reduce((sum, t) => sum + (t.score / t.possible * 100), 0) / strategy.totalTrades 
        : 0
      const avgPnL = tradesWithPnL.length > 0 ? strategy.totalPnL / tradesWithPnL.length : 0

      return {
        ...strategy,
        winRate,
        aPlusRate,
        avgScore,
        avgPnL,
        profitableTrades: strategy.wins
      }
    }).sort((a, b) => b.totalPnL - a.totalPnL)

    const result = { strategies: strategyMetrics }
    this.setCache(cacheKey, result)
    return result
  }

  // Generate calendar heat-map data
  generateCalendarData(trades, year, month) {
    const cacheKey = `calendar-${year}-${month}-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const dailyData = {}
    
    trades.forEach(trade => {
      const tradeDate = new Date(trade.timestamp)
      const dateKey = tradeDate.toISOString().split('T')[0]
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          trades: [],
          totalPnl: 0,
          aPlusCount: 0,
          totalTrades: 0,
          winCount: 0
        }
      }
      
      dailyData[dateKey].trades.push(trade)
      dailyData[dateKey].totalTrades++
      dailyData[dateKey].totalPnl += trade.pnl || 0
      
      if (trade.verdict === 'A+') {
        dailyData[dateKey].aPlusCount++
      }
      
      if (trade.outcome === 'win') {
        dailyData[dateKey].winCount++
      }
    })

    // Calculate derived metrics for each day
    Object.values(dailyData).forEach(day => {
      day.winRate = day.totalTrades > 0 ? (day.winCount / day.totalTrades) * 100 : 0
      day.aPlusRate = day.totalTrades > 0 ? (day.aPlusCount / day.totalTrades) * 100 : 0
      day.avgScore = day.totalTrades > 0 
        ? day.trades.reduce((sum, t) => sum + (t.score / t.possible * 100), 0) / day.totalTrades 
        : 0
    })

    const result = { dailyData }
    this.setCache(cacheKey, result)
    return result
  }

  // Calculate risk management metrics
  calculateRiskMetrics(trades) {
    const cacheKey = `risk-${this.hashTrades(trades)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const tradesWithRisk = trades.filter(t => 
      t.riskAmount !== undefined && 
      t.riskAmount !== null && 
      t.pnl !== undefined && 
      t.pnl !== null
    )

    if (tradesWithRisk.length === 0) {
      return {
        avgRiskAmount: 0,
        maxRiskAmount: 0,
        riskRewardRatios: [],
        avgRiskReward: 0,
        riskAdjustedReturn: 0,
        maxRiskPercent: 0
      }
    }

    const riskAmounts = tradesWithRisk.map(t => t.riskAmount)
    const avgRiskAmount = riskAmounts.reduce((sum, r) => sum + r, 0) / riskAmounts.length
    const maxRiskAmount = Math.max(...riskAmounts)

    const riskRewardRatios = tradesWithRisk
      .filter(t => t.riskRewardRatio !== undefined)
      .map(t => t.riskRewardRatio)
    
    const avgRiskReward = riskRewardRatios.length > 0 
      ? riskRewardRatios.reduce((sum, r) => sum + r, 0) / riskRewardRatios.length 
      : 0

    const totalPnL = tradesWithRisk.reduce((sum, t) => sum + t.pnl, 0)
    const totalRisk = tradesWithRisk.reduce((sum, t) => sum + t.riskAmount, 0)
    const riskAdjustedReturn = totalRisk > 0 ? totalPnL / totalRisk : 0

    // Assuming account balance for risk percentage (this would need to be passed in)
    const maxRiskPercent = 2 // Placeholder - would calculate based on account size

    const result = {
      avgRiskAmount,
      maxRiskAmount,
      riskRewardRatios,
      avgRiskReward,
      riskAdjustedReturn,
      maxRiskPercent
    }

    this.setCache(cacheKey, result)
    return result
  }

  // Helper method to calculate drawdown metrics
  calculateDrawdownMetrics(trades) {
    let runningBalance = 0
    let peak = 0
    let maxDrawdown = 0
    let maxDrawdownPercent = 0

    trades.forEach(trade => {
      runningBalance += trade.pnl
      
      if (runningBalance > peak) {
        peak = runningBalance
      }
      
      const drawdown = peak - runningBalance
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
        maxDrawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0
      }
    })

    return { maxDrawdown, maxDrawdownPercent }
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
    
    // Clean old cache entries
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
  }

  // Simple hash function for cache keys
  hashTrades(trades) {
    return trades.length + '-' + (trades[0]?.timestamp || '') + '-' + (trades[trades.length - 1]?.timestamp || '')
  }

  // Post message wrapper
  postMessage(data) {
    if (typeof self !== 'undefined' && self.postMessage) {
      self.postMessage(data)
    }
  }
}

// Initialize worker
const worker = new PerformanceWorker()

// Listen for messages
if (typeof self !== 'undefined') {
  self.onmessage = (event) => {
    worker.handleMessage(event)
  }
} 