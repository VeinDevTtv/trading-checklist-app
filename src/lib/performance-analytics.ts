export interface TradeResult {
  id: number;
  timestamp: string;
  strategyName: string;
  verdict: string;
  score: number;
  possible: number;
  pnl?: number; // Profit/Loss in currency
  riskAmount?: number;
  outcome?: 'win' | 'loss' | 'breakeven';
  riskRewardRatio?: number;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  lossRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  currentDrawdown: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  averageRiskReward: number;
  sharpeRatio: number;
  calmarRatio: number;
}

export interface EquityPoint {
  date: string;
  balance: number;
  drawdown: number;
  tradeNumber: number;
  pnl: number;
}

export interface StrategyPerformance {
  strategyName: string;
  trades: number;
  winRate: number;
  totalPnL: number;
  averageScore: number;
  aPlusRate: number;
}

export class PerformanceAnalytics {
  private static STORAGE_KEY = 'trading-performance-cache';

  static calculateMetrics(trades: TradeResult[], initialBalance = 10000): PerformanceMetrics {
    if (trades.length === 0) {
      return this.getEmptyMetrics();
    }

    const tradesWithPnL = trades.filter(t => t.pnl !== undefined);
    const wins = tradesWithPnL.filter(t => t.outcome === 'win');
    const losses = tradesWithPnL.filter(t => t.outcome === 'loss');
    const breakevens = tradesWithPnL.filter(t => t.outcome === 'breakeven');

    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossWins = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLosses = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));

    // Calculate drawdown
    const equityCurve = this.generateEquityCurve(tradesWithPnL, initialBalance);
    const { maxDrawdown, maxDrawdownPercent, currentDrawdown } = this.calculateDrawdown(equityCurve);

    // Calculate consecutive wins/losses
    const { maxConsecutiveWins, maxConsecutiveLosses, consecutiveWins, consecutiveLosses } = 
      this.calculateConsecutiveRuns(tradesWithPnL);

    // Calculate risk-reward ratios
    const rrRatios = tradesWithPnL
      .filter(t => t.riskRewardRatio && t.riskRewardRatio > 0)
      .map(t => t.riskRewardRatio!);
    const averageRiskReward = rrRatios.length > 0 ? 
      rrRatios.reduce((sum, rr) => sum + rr, 0) / rrRatios.length : 0;

    // Calculate Sharpe ratio (simplified)
    const returns = this.calculateReturns(equityCurve);
    const sharpeRatio = this.calculateSharpeRatio(returns);

    return {
      totalTrades: tradesWithPnL.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      breakevenTrades: breakevens.length,
      winRate: tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0,
      lossRate: tradesWithPnL.length > 0 ? (losses.length / tradesWithPnL.length) * 100 : 0,
      totalPnL,
      averageWin: wins.length > 0 ? grossWins / wins.length : 0,
      averageLoss: losses.length > 0 ? grossLosses / losses.length : 0,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl || 0)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl || 0)) : 0,
      expectancy: tradesWithPnL.length > 0 ? totalPnL / tradesWithPnL.length : 0,
      profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0,
      maxDrawdown,
      maxDrawdownPercent,
      currentDrawdown,
      consecutiveWins,
      consecutiveLosses,
      maxConsecutiveWins,
      maxConsecutiveLosses,
      averageRiskReward,
      sharpeRatio,
      calmarRatio: maxDrawdownPercent > 0 ? (totalPnL / initialBalance * 100) / maxDrawdownPercent : 0
    };
  }

  static generateEquityCurve(trades: TradeResult[], initialBalance = 10000): EquityPoint[] {
    const curve: EquityPoint[] = [{
      date: new Date().toISOString().split('T')[0],
      balance: initialBalance,
      drawdown: 0,
      tradeNumber: 0,
      pnl: 0
    }];

    let runningBalance = initialBalance;
    let peak = initialBalance;

    trades.forEach((trade, index) => {
      const pnl = trade.pnl || 0;
      runningBalance += pnl;
      
      if (runningBalance > peak) {
        peak = runningBalance;
      }

      const drawdown = peak > 0 ? ((peak - runningBalance) / peak) * 100 : 0;

      curve.push({
        date: new Date(trade.timestamp).toISOString().split('T')[0],
        balance: runningBalance,
        drawdown,
        tradeNumber: index + 1,
        pnl
      });
    });

    return curve;
  }

  static calculateDrawdown(equityCurve: EquityPoint[]) {
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;
    let peak = equityCurve[0]?.balance || 0;

    equityCurve.forEach(point => {
      if (point.balance > peak) {
        peak = point.balance;
      }

      const drawdown = peak - point.balance;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }

      if (drawdownPercent > maxDrawdownPercent) {
        maxDrawdownPercent = drawdownPercent;
      }
    });

    const currentBalance = equityCurve[equityCurve.length - 1]?.balance || 0;
    const currentPeak = Math.max(...equityCurve.map(p => p.balance));
    const currentDrawdown = currentPeak > 0 ? ((currentPeak - currentBalance) / currentPeak) * 100 : 0;

    return { maxDrawdown, maxDrawdownPercent, currentDrawdown };
  }

  static calculateConsecutiveRuns(trades: TradeResult[]) {
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    trades.forEach(trade => {
      if (trade.outcome === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else if (trade.outcome === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    consecutiveWins = currentWinStreak;
    consecutiveLosses = currentLossStreak;

    return { maxConsecutiveWins, maxConsecutiveLosses, consecutiveWins, consecutiveLosses };
  }

  static calculateReturns(equityCurve: EquityPoint[]): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < equityCurve.length; i++) {
      const prevBalance = equityCurve[i - 1].balance;
      const currentBalance = equityCurve[i].balance;
      
      if (prevBalance > 0) {
        const returnRate = (currentBalance - prevBalance) / prevBalance;
        returns.push(returnRate);
      }
    }
    
    return returns;
  }

  static calculateSharpeRatio(returns: number[], riskFreeRate = 0.02): number {
    if (returns.length === 0) return 0;

    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const excessReturn = avgReturn - (riskFreeRate / 252); // Daily risk-free rate

    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? excessReturn / stdDev : 0;
  }

  static analyzeByStrategy(trades: TradeResult[]): StrategyPerformance[] {
    const strategyMap = new Map<string, TradeResult[]>();

    trades.forEach(trade => {
      if (!strategyMap.has(trade.strategyName)) {
        strategyMap.set(trade.strategyName, []);
      }
      strategyMap.get(trade.strategyName)!.push(trade);
    });

    return Array.from(strategyMap.entries()).map(([strategyName, strategyTrades]) => {
      const tradesWithPnL = strategyTrades.filter(t => t.pnl !== undefined);
      const wins = tradesWithPnL.filter(t => t.outcome === 'win');
      const aPlusTrades = strategyTrades.filter(t => t.verdict === 'A+');
      
      return {
        strategyName,
        trades: strategyTrades.length,
        winRate: tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0,
        totalPnL: tradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0),
        averageScore: strategyTrades.length > 0 ? 
          strategyTrades.reduce((sum, t) => sum + (t.score / t.possible * 100), 0) / strategyTrades.length : 0,
        aPlusRate: strategyTrades.length > 0 ? (aPlusTrades.length / strategyTrades.length) * 100 : 0
      };
    });
  }

  static generateRiskRewardDistribution(trades: TradeResult[]): Array<{ range: string; count: number }> {
    const ranges = [
      { min: 0, max: 1, label: '0-1:1' },
      { min: 1, max: 2, label: '1-2:1' },
      { min: 2, max: 3, label: '2-3:1' },
      { min: 3, max: 5, label: '3-5:1' },
      { min: 5, max: Infinity, label: '5+:1' }
    ];

    return ranges.map(range => ({
      range: range.label,
      count: trades.filter(t => 
        t.riskRewardRatio && 
        t.riskRewardRatio >= range.min && 
        t.riskRewardRatio < range.max
      ).length
    }));
  }

  static cacheMetrics(metrics: PerformanceMetrics): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        metrics,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache performance metrics:', error);
    }
  }

  static getCachedMetrics(): { metrics: PerformanceMetrics; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load cached metrics:', error);
      return null;
    }
  }

  private static getEmptyMetrics(): PerformanceMetrics {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      winRate: 0,
      lossRate: 0,
      totalPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      expectancy: 0,
      profitFactor: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0,
      currentDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      maxConsecutiveWins: 0,
      maxConsecutiveLosses: 0,
      averageRiskReward: 0,
      sharpeRatio: 0,
      calmarRatio: 0
    };
  }
}

export default PerformanceAnalytics; 