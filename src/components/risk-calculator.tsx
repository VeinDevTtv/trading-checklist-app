"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface RiskCalculation {
  positionSize: number
  riskAmount: number
  potentialProfit: number
  potentialLoss: number
  riskRewardRatio: number
}

export function RiskCalculator() {
  const [accountBalance, setAccountBalance] = useState<number>(10000)
  const [riskPercentage, setRiskPercentage] = useState<number[]>([2])
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [stopLoss, setStopLoss] = useState<number>(0)
  const [takeProfit, setTakeProfit] = useState<number>(0)
  const [pipValue, setPipValue] = useState<number>(10)
  const [calculation, setCalculation] = useState<RiskCalculation>({
    positionSize: 0,
    riskAmount: 0,
    potentialProfit: 0,
    potentialLoss: 0,
    riskRewardRatio: 0
  })

  const calculateRisk = useCallback(() => {
    if (!entryPrice || !stopLoss || !accountBalance) {
      setCalculation({
        positionSize: 0,
        riskAmount: 0,
        potentialProfit: 0,
        potentialLoss: 0,
        riskRewardRatio: 0
      })
      return
    }

    const riskAmount = (accountBalance * riskPercentage[0]) / 100
    const stopLossPips = Math.abs(entryPrice - stopLoss) * 10000 // Assuming 4-decimal currency pair
    const takeProfitPips = takeProfit ? Math.abs(takeProfit - entryPrice) * 10000 : 0
    
    const positionSize = stopLossPips > 0 ? riskAmount / (stopLossPips * pipValue / 10000) : 0
    const potentialLoss = riskAmount
    const potentialProfit = takeProfitPips > 0 ? (takeProfitPips * pipValue * positionSize) / 10000 : 0
    const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0

    setCalculation({
      positionSize: Math.round(positionSize * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      potentialLoss: Math.round(potentialLoss * 100) / 100,
      riskRewardRatio: Math.round(riskRewardRatio * 100) / 100
    })
  }, [accountBalance, riskPercentage, entryPrice, stopLoss, takeProfit, pipValue])

  useEffect(() => {
    calculateRisk()
  }, [calculateRisk])

  const getRiskLevel = () => {
    if (riskPercentage[0] <= 1) return { level: "Conservative", color: "bg-green-500" }
    if (riskPercentage[0] <= 2) return { level: "Moderate", color: "bg-yellow-500" }
    if (riskPercentage[0] <= 5) return { level: "Aggressive", color: "bg-orange-500" }
    return { level: "Very High Risk", color: "bg-red-500" }
  }

  const getRRRating = () => {
    if (calculation.riskRewardRatio >= 3) return { rating: "Excellent", color: "text-green-600" }
    if (calculation.riskRewardRatio >= 2) return { rating: "Good", color: "text-blue-600" }
    if (calculation.riskRewardRatio >= 1) return { rating: "Fair", color: "text-yellow-600" }
    return { rating: "Poor", color: "text-red-600" }
  }

  const riskLevel = getRiskLevel()
  const rrRating = getRRRating()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Risk Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account-balance">Account Balance ($)</Label>
            <Input
              id="account-balance"
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              placeholder="10000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pip-value">Pip Value ($)</Label>
            <Input
              id="pip-value"
              type="number"
              value={pipValue}
              onChange={(e) => setPipValue(Number(e.target.value))}
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-price">Entry Price</Label>
            <Input
              id="entry-price"
              type="number"
              step="0.00001"
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              placeholder="1.23456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop-loss">Stop Loss</Label>
            <Input
              id="stop-loss"
              type="number"
              step="0.00001"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              placeholder="1.23000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="take-profit">Take Profit (Optional)</Label>
            <Input
              id="take-profit"
              type="number"
              step="0.00001"
              value={takeProfit}
              onChange={(e) => setTakeProfit(Number(e.target.value))}
              placeholder="1.24000"
            />
          </div>
        </div>

        {/* Risk Percentage Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Risk Percentage: {riskPercentage[0]}%</Label>
            <Badge className={riskLevel.color}>
              {riskLevel.level}
            </Badge>
          </div>
          <Slider
            value={riskPercentage}
            onValueChange={setRiskPercentage}
            max={10}
            min={0.1}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0.1%</span>
            <span>10%</span>
          </div>
        </div>

        <Separator />

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Calculation Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Position Size</span>
                </div>
                <p className="text-2xl font-bold">{calculation.positionSize.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Lot Size</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Risk Amount</span>
                </div>
                <p className="text-2xl font-bold text-red-600">${calculation.riskAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Maximum Loss</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Potential Profit</span>
                </div>
                <p className="text-2xl font-bold text-green-600">${calculation.potentialProfit.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">If TP is hit</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Risk:Reward Ratio</span>
                </div>
                <p className={`text-2xl font-bold ${rrRating.color}`}>
                  1:{calculation.riskRewardRatio}
                </p>
                <p className={`text-sm ${rrRating.color}`}>{rrRating.rating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Management Tips */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Management Tips
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Never risk more than 1-2% of your account per trade</li>
                <li>• Aim for a minimum 1:2 risk-reward ratio</li>
                <li>• Always use stop losses to limit downside risk</li>
                <li>• Consider position sizing based on volatility</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
} 