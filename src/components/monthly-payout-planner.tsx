"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  PiggyBank,
  Zap
} from "lucide-react"

interface PropFirmRule {
  name: string
  maxDailyLoss: number // percentage
  maxTotalLoss: number // percentage
  profitTarget: number // percentage
  minTradingDays: number
  maxTradingDays: number
  consistencyRule?: string
}

interface PayoutPlan {
  targetDate: string
  targetAmount: number
  currentBalance: number
  propFirm: string
  dailyRiskBudget: number
  requiredDailyProfit: number
  tradingDaysRemaining: number
  successProbability: number
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
}

interface MonthlyPayoutPlannerProps {
  currentBalance: number
  onPlanUpdate?: (plan: PayoutPlan) => void
}

export function MonthlyPayoutPlanner({ currentBalance, onPlanUpdate }: MonthlyPayoutPlannerProps) {
  const [targetAmount, setTargetAmount] = useState<number>(5000)
  const [targetDate, setTargetDate] = useState<string>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    return date.toISOString().split('T')[0]
  })
  const [selectedPropFirm, setSelectedPropFirm] = useState<string>('ftmo')

  // Prop firm rules database
  const propFirmRules: Record<string, PropFirmRule> = {
    ftmo: {
      name: 'FTMO',
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 10,
      minTradingDays: 10,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 50% of total profit'
    },
    fundednext: {
      name: 'FundedNext',
      maxDailyLoss: 5,
      maxTotalLoss: 12,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30,
      consistencyRule: 'No single day > 40% of total profit'
    },
    myforexfunds: {
      name: 'MyForexFunds',
      maxDailyLoss: 5,
      maxTotalLoss: 12,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30
    },
    thefundedtrader: {
      name: 'The Funded Trader',
      maxDailyLoss: 4,
      maxTotalLoss: 8,
      profitTarget: 8,
      minTradingDays: 5,
      maxTradingDays: 30
    },
    apex: {
      name: 'Apex Trader Funding',
      maxDailyLoss: 3,
      maxTotalLoss: 6,
      profitTarget: 8,
      minTradingDays: 10,
      maxTradingDays: 30
    }
  }

  // Calculate payout plan
  const payoutPlan = useMemo((): PayoutPlan => {
    const rules = propFirmRules[selectedPropFirm]
    const today = new Date()
    const target = new Date(targetDate)
    const timeDiff = target.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    // Calculate trading days (excluding weekends)
    let tradingDaysRemaining = 0
    const currentDate = new Date(today)
    while (currentDate <= target) {
      const dayOfWeek = currentDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        tradingDaysRemaining++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Ensure minimum trading days
    tradingDaysRemaining = Math.max(tradingDaysRemaining, rules.minTradingDays)

    // Calculate required daily profit
    const profitNeeded = targetAmount - currentBalance
    const requiredDailyProfit = profitNeeded / tradingDaysRemaining

    // Calculate daily risk budget (conservative approach)
    const maxDailyLossAmount = currentBalance * (rules.maxDailyLoss / 100)
    const dailyRiskBudget = Math.min(
      maxDailyLossAmount * 0.5, // Use 50% of max allowed loss as safety margin
      requiredDailyProfit * 2 // Risk 2x the required profit (1:2 risk-reward)
    )

    // Calculate success probability based on various factors
    let successProbability = 100
    
    // Factor 1: Time pressure
    if (tradingDaysRemaining < rules.minTradingDays) successProbability -= 30
    else if (tradingDaysRemaining < 15) successProbability -= 15
    
    // Factor 2: Daily profit requirement vs account size
    const dailyProfitPercentage = (requiredDailyProfit / currentBalance) * 100
    if (dailyProfitPercentage > 3) successProbability -= 25
    else if (dailyProfitPercentage > 2) successProbability -= 15
    else if (dailyProfitPercentage > 1) successProbability -= 10
    
    // Factor 3: Risk budget vs daily loss limit
    const riskPercentage = (dailyRiskBudget / currentBalance) * 100
    if (riskPercentage > rules.maxDailyLoss * 0.8) successProbability -= 20
    
    // Factor 4: Consistency requirements
    if (rules.consistencyRule && dailyProfitPercentage > 1.5) successProbability -= 15

    successProbability = Math.max(0, Math.min(100, successProbability))

    // Determine risk level
    let riskLevel: PayoutPlan['riskLevel'] = 'low'
    if (dailyProfitPercentage > 2 || successProbability < 50) riskLevel = 'extreme'
    else if (dailyProfitPercentage > 1.5 || successProbability < 70) riskLevel = 'high'
    else if (dailyProfitPercentage > 1 || successProbability < 85) riskLevel = 'medium'

    return {
      targetDate,
      targetAmount,
      currentBalance,
      propFirm: rules.name,
      dailyRiskBudget,
      requiredDailyProfit,
      tradingDaysRemaining,
      successProbability,
      riskLevel
    }
  }, [targetAmount, targetDate, currentBalance, selectedPropFirm])

  // Update parent component when plan changes
  useEffect(() => {
    onPlanUpdate?.(payoutPlan)
  }, [payoutPlan, onPlanUpdate])

  const getRiskLevelColor = (level: PayoutPlan['riskLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'extreme': return 'text-red-600 bg-red-100'
    }
  }

  const getRiskLevelIcon = (level: PayoutPlan['riskLevel']) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'extreme': return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-green-600" />
            Monthly Payout Planner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Plan your trading strategy to meet prop firm payout requirements while respecting risk management rules.
          </p>
        </CardContent>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="target-amount">Target Payout ($)</Label>
            <Input
              id="target-amount"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="target-date">Target Date</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="current-balance">Current Balance ($)</Label>
            <Input
              id="current-balance"
              type="number"
              value={currentBalance}
              disabled
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <Label htmlFor="prop-firm">Prop Firm</Label>
            <Select value={selectedPropFirm} onValueChange={setSelectedPropFirm}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(propFirmRules).map(([key, rule]) => (
                  <SelectItem key={key} value={key}>
                    {rule.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Plan Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Required Daily Profit */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Profit Needed</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  ${payoutPlan.requiredDailyProfit.toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {((payoutPlan.requiredDailyProfit / currentBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Risk Budget */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Risk Budget</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Target className="h-5 w-5 text-blue-500" />
                  ${payoutPlan.dailyRiskBudget.toFixed(0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {((payoutPlan.dailyRiskBudget / currentBalance) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Days Remaining */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trading Days Left</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  {payoutPlan.tradingDaysRemaining}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Min: {propFirmRules[selectedPropFirm].minTradingDays}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Probability */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Probability</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  {payoutPlan.successProbability.toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <Progress value={payoutPlan.successProbability} className="w-16 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Risk Level Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`${getRiskLevelColor(payoutPlan.riskLevel)} flex items-center gap-1`}>
                {getRiskLevelIcon(payoutPlan.riskLevel)}
                {payoutPlan.riskLevel.toUpperCase()} RISK
              </Badge>
              <span className="text-sm text-muted-foreground">
                Based on prop firm rules and market conditions
              </span>
            </div>

            {/* Prop Firm Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Prop Firm Limits</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Max Daily Loss:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].maxDailyLoss}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Total Loss:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].maxTotalLoss}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit Target:</span>
                    <span className="font-medium">{propFirmRules[selectedPropFirm].profitTarget}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Your Plan</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Daily Risk:</span>
                    <span className="font-medium">
                      {((payoutPlan.dailyRiskBudget / currentBalance) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Profit Target:</span>
                    <span className="font-medium">
                      {((payoutPlan.requiredDailyProfit / currentBalance) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk:Reward Ratio:</span>
                    <span className="font-medium">
                      1:{(payoutPlan.requiredDailyProfit / payoutPlan.dailyRiskBudget).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recommendations
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {payoutPlan.riskLevel === 'extreme' && (
                  <p className="text-red-600">⚠️ This plan is extremely risky. Consider extending your timeline or reducing your target.</p>
                )}
                {payoutPlan.riskLevel === 'high' && (
                  <p className="text-orange-600">⚠️ High risk plan. Focus on high-probability setups only.</p>
                )}
                {payoutPlan.successProbability < 70 && (
                  <p>• Consider extending your target date to improve success probability</p>
                )}
                {((payoutPlan.requiredDailyProfit / currentBalance) * 100) > 2 && (
                  <p>• Daily profit target is aggressive. Focus on quality over quantity.</p>
                )}
                {payoutPlan.tradingDaysRemaining < 15 && (
                  <p>• Limited time remaining. Avoid overtrading and stick to your best setups.</p>
                )}
                <p>• Maintain strict risk management: never exceed ${payoutPlan.dailyRiskBudget.toFixed(0)} daily risk</p>
                <p>• Track your progress daily and adjust if needed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
